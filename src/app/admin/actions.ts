"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";
import type { z } from "zod";
import { assertAdmin } from "@/lib/admin";
import { CONTENT_GROUPS, validateField } from "@/lib/content";
import { extensionFor, validateImage } from "@/lib/images";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import {
  artworkSchema,
  bannerSchema,
  categorySchema,
  clientSchema,
  ensureSlug,
  flattenErrors,
  newPasswordSchema,
  productSchema,
  recordUpdateSchema,
  serviceSchema,
  settingsSchema,
  type FieldErrors,
} from "@/lib/validation";

export type ActionResult = { ok: boolean; error?: string; fieldErrors?: FieldErrors; id?: string };

function fail(error: string, fieldErrors?: FieldErrors): ActionResult {
  return { ok: false, error, fieldErrors };
}

function formToObject(fd: FormData): Record<string, string> {
  const o: Record<string, string> = {};
  for (const [k, v] of fd.entries()) if (typeof v === "string" && !k.startsWith("$ACTION")) o[k] = v;
  return o;
}

function dbError(message: string): string {
  if (/duplicate key|unique/i.test(message)) return "Já existe um registro com esse nome/slug/código.";
  if (/row-level security|permission denied/i.test(message)) return "Sem permissão para esta operação.";
  if (/violates check constraint/i.test(message)) return "Algum campo está fora dos limites permitidos.";
  return "Erro ao salvar. Tente novamente.";
}

function refresh() {
  revalidateTag("site"); // cache das consultas públicas (src/lib/data.ts)
  revalidatePath("/", "layout");
}

async function guard<T>(fn: () => Promise<T>): Promise<T | ActionResult> {
  try {
    return await fn();
  } catch (e) {
    if (e && typeof e === "object" && "digest" in e) throw e; // redirect/notFound do Next
    return fail(e instanceof Error ? e.message : "Erro inesperado.");
  }
}

function parse<S extends z.ZodTypeAny>(schema: S, fd: FormData): { ok: true; data: z.infer<S> } | { ok: false; res: ActionResult } {
  const r = schema.safeParse(formToObject(fd));
  if (!r.success) return { ok: false, res: fail("Revise os campos destacados.", flattenErrors(r.error)) };
  return { ok: true, data: r.data };
}

// ---------- Auth ----------
export async function loginAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Supabase não configurado (variáveis de ambiente ausentes).");
  const email = String(fd.get("email") ?? "").trim();
  const password = String(fd.get("password") ?? "");
  if (!email || !password) return fail("Informe e-mail e senha.");
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return fail("E-mail ou senha inválidos.");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) {
    await supabase.auth.signOut();
    return fail("Este usuário não tem permissão de administrador.");
  }
  const next = String(fd.get("next") ?? "");
  redirect(next.startsWith("/admin") && !next.startsWith("//") ? next : "/admin");
}

/** Envia o e-mail de redefinição. Sempre responde “ok” para não revelar se o e-mail existe. */
export async function requestPasswordResetAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  if (!isSupabaseConfigured()) return fail("Supabase não configurado (variáveis de ambiente ausentes).");
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return fail("Informe um e-mail válido.");
  const base = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") || (await headers()).get("origin") || "";
  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${base}/admin/auth/confirm?next=/admin/redefinir-senha`,
  });
  if (error) console.error("[resetPasswordForEmail]", error.message);
  if (error && /rate limit|too many|seconds/i.test(error.message)) {
    return fail("Muitas tentativas. Aguarde alguns minutos e tente de novo.");
  }
  return { ok: true };
}

/** Define a nova senha após clicar no link do e-mail (a sessão de recuperação já está ativa). */
export async function resetPasswordAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  const parsed = newPasswordSchema.safeParse({ password: fd.get("password"), confirm: fd.get("confirm") });
  if (!parsed.success) return fail("Revise os campos destacados.", flattenErrors(parsed.error));
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return fail("O link expirou. Peça um novo em “Esqueci minha senha”.");
  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
  if (error) return fail(/same|different/i.test(error.message) ? "A nova senha deve ser diferente da atual." : "Não foi possível alterar a senha. Tente novamente.");
  redirect("/admin");
}

/** Troca de senha dentro do painel: exige a senha atual. */
export async function changePasswordAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase, user } = await assertAdmin();
    const current = String(fd.get("current") ?? "");
    const parsed = newPasswordSchema.safeParse({ password: fd.get("password"), confirm: fd.get("confirm") });
    if (!current) return fail("Informe a senha atual.", { current: "Informe a senha atual." });
    if (!parsed.success) return fail("Revise os campos destacados.", flattenErrors(parsed.error));
    if (parsed.data.password === current) return fail("A nova senha deve ser diferente da atual.", { password: "Escolha uma senha diferente da atual." });
    const check = await supabase.auth.signInWithPassword({ email: user.email ?? "", password: current });
    if (check.error) return fail("A senha atual está incorreta.", { current: "Senha atual incorreta." });
    const { error } = await supabase.auth.updateUser({ password: parsed.data.password });
    if (error) return fail("Não foi possível alterar a senha. Tente novamente.");
    return { ok: true };
  }) as Promise<ActionResult>;
}

export async function logoutAction() {
  const supabase = await createServerSupabase();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

// ---------- Upload de imagens ----------
export async function uploadImageAction(fd: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const { supabase } = await assertAdmin();
    const file = fd.get("file");
    const folder = String(fd.get("folder") ?? "geral").replace(/[^a-z0-9-]/gi, "").slice(0, 30) || "geral";
    if (!(file instanceof File)) return { ok: false, error: "Nenhum arquivo enviado." };
    const bytes = new Uint8Array(await file.arrayBuffer());
    const check = validateImage(bytes);
    if (!check.ok) return { ok: false, error: check.error };
    const path = `${folder}/${randomUUID()}.${extensionFor(check.type)}`;
    const { error } = await supabase.storage.from("media").upload(path, bytes, { contentType: check.type, upsert: false });
    if (error) return { ok: false, error: "Falha no upload. Verifique o bucket “media” e suas permissões." };
    const { data } = supabase.storage.from("media").getPublicUrl(path);
    return { ok: true, url: data.publicUrl };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "Erro no upload." };
  }
}

// ---------- Produtos ----------
export async function saveProductAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const p = parse(productSchema, fd);
    if (!p.ok) return p.res;
    const { id, gallery, slug, ...rest } = p.data;
    const row = {
      ...rest,
      slug: ensureSlug(slug, rest.name),
      category_id: rest.category_id ?? null,
      description: rest.description ?? null,
      specifications: rest.specifications ?? null,
      price: rest.price_on_request ? null : rest.price,
      stock_quantity: rest.track_stock ? rest.stock_quantity : null,
      low_stock_threshold: rest.low_stock_threshold ?? 5,
    };
    const q = id ? supabase.from("products").update(row).eq("id", id).select("id").single() : supabase.from("products").insert(row).select("id").single();
    const { data, error } = await q;
    if (error) return fail(dbError(error.message), error.message.includes("slug") ? { slug: "Slug já utilizado." } : undefined);

    let urls: string[] = [];
    try {
      const parsed = JSON.parse(gallery || "[]");
      if (Array.isArray(parsed)) urls = parsed.filter((u): u is string => typeof u === "string" && /^https?:\/\//.test(u)).slice(0, 10);
    } catch {
      /* ignora galeria inválida */
    }
    await supabase.from("product_images").delete().eq("product_id", data.id);
    if (urls.length) {
      const { error: gErr } = await supabase
        .from("product_images")
        .insert(urls.map((image_url, display_order) => ({ product_id: data.id, image_url, display_order })));
      if (gErr) return fail(dbError(gErr.message));
    }
    refresh();
    return { ok: true, id: data.id };
  }) as Promise<ActionResult>;
}

const CONTENT_TABLES = ["products", "artworks", "services", "banners", "categories", "clients"] as const;
type ContentTable = (typeof CONTENT_TABLES)[number];

export async function toggleActiveAction(table: ContentTable, id: string, active: boolean): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    if (!CONTENT_TABLES.includes(table)) return fail("Tabela inválida.");
    const { error } = await supabase.from(table).update({ active }).eq("id", id);
    if (error) return fail(dbError(error.message));
    refresh();
    return { ok: true };
  }) as Promise<ActionResult>;
}

export async function deleteRowAction(table: ContentTable, id: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    if (!CONTENT_TABLES.includes(table)) return fail("Tabela inválida.");
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) return fail(dbError(error.message));
    refresh();
    return { ok: true };
  }) as Promise<ActionResult>;
}

// ---------- Artes ----------
export async function saveArtworkAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const p = parse(artworkSchema, fd);
    if (!p.ok) return p.res;
    const { id, ...rest } = p.data;
    const row = { ...rest, category_id: rest.category_id ?? null, description: rest.description ?? null, price: rest.price_on_request ? null : rest.price };
    const { data, error } = await (id ? supabase.from("artworks").update(row).eq("id", id) : supabase.from("artworks").insert(row)).select("id").single();
    if (error) return fail(dbError(error.message), /code/.test(error.message) ? { code: "Código já utilizado." } : undefined);
    refresh();
    return { ok: true, id: data.id };
  }) as Promise<ActionResult>;
}

// ---------- Serviços ----------
export async function saveServiceAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const p = parse(serviceSchema, fd);
    if (!p.ok) return p.res;
    const { id, ...rest } = p.data;
    const row = {
      ...rest,
      category_id: rest.category_id ?? null,
      description: rest.description ?? null,
      specifications: rest.specifications ?? null,
      lead_time: rest.lead_time ?? null,
      price: rest.price_on_request ? null : rest.price,
    };
    const { data, error } = await (id ? supabase.from("services").update(row).eq("id", id) : supabase.from("services").insert(row)).select("id").single();
    if (error) return fail(dbError(error.message));
    refresh();
    return { ok: true, id: data.id };
  }) as Promise<ActionResult>;
}

// ---------- Categorias ----------
export async function saveCategoryAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const p = parse(categorySchema, fd);
    if (!p.ok) return p.res;
    const { id, slug, ...rest } = p.data;
    const row = { ...rest, slug: ensureSlug(slug, rest.name), description: rest.description ?? null };
    const { data, error } = await (id ? supabase.from("categories").update(row).eq("id", id) : supabase.from("categories").insert(row)).select("id").single();
    if (error) return fail(dbError(error.message));
    refresh();
    return { ok: true, id: data.id };
  }) as Promise<ActionResult>;
}

// ---------- Banners ----------
export async function saveBannerAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const p = parse(bannerSchema, fd);
    if (!p.ok) return p.res;
    const { id, ...rest } = p.data;
    const row = { ...rest, subtitle: rest.subtitle ?? null, cta_label: rest.cta_label ?? null, cta_href: rest.cta_href ?? null };
    const { data, error } = await (id ? supabase.from("banners").update(row).eq("id", id) : supabase.from("banners").insert(row)).select("id").single();
    if (error) return fail(dbError(error.message));
    refresh();
    return { ok: true, id: data.id };
  }) as Promise<ActionResult>;
}

// ---------- Textos, imagens e cores do site ----------
export async function saveContentAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const group = CONTENT_GROUPS.find((g) => g.id === String(fd.get("_group") ?? ""));
    if (!group) return fail("Grupo inválido.");
    const fieldErrors: FieldErrors = {};
    const upserts: { key: string; value: string }[] = [];
    const removals: string[] = [];
    for (const f of group.fields) {
      const raw = fd.get(f.key);
      if (typeof raw !== "string") continue;
      const err = validateField(f, raw);
      if (err) {
        fieldErrors[f.key] = err;
        continue;
      }
      const value = raw.replace(/\r\n/g, "\n").trim();
      if (value === "" || value === f.default) removals.push(f.key);
      else upserts.push({ key: f.key, value });
    }
    if (Object.keys(fieldErrors).length) return fail("Revise os campos destacados.", fieldErrors);
    if (upserts.length) {
      const { error } = await supabase.from("site_content").upsert(upserts, { onConflict: "key" });
      if (error) return fail(dbError(error.message));
    }
    if (removals.length) {
      const { error } = await supabase.from("site_content").delete().in("key", removals);
      if (error) return fail(dbError(error.message));
    }
    refresh();
    return { ok: true };
  }) as Promise<ActionResult>;
}

export async function resetContentGroupAction(groupId: string): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const group = CONTENT_GROUPS.find((g) => g.id === groupId);
    if (!group) return fail("Grupo inválido.");
    const { error } = await supabase.from("site_content").delete().in("key", group.fields.map((f) => f.key));
    if (error) return fail(dbError(error.message));
    refresh();
    return { ok: true };
  }) as Promise<ActionResult>;
}

// ---------- Clientes ----------
export async function saveClientAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const p = parse(clientSchema, fd);
    if (!p.ok) return p.res;
    const { id, ...row } = p.data;
    const { data, error } = await (id ? supabase.from("clients").update(row).eq("id", id) : supabase.from("clients").insert(row)).select("id").single();
    if (error) return fail(dbError(error.message));
    refresh();
    return { ok: true, id: data.id };
  }) as Promise<ActionResult>;
}

// ---------- Configurações ----------
export async function saveSettingsAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const p = parse(settingsSchema, fd);
    if (!p.ok) return p.res;
    const d = p.data;
    const compact = <T extends Record<string, string | undefined>>(o: T) =>
      Object.fromEntries(Object.entries(o).filter(([, v]) => v));
    const { error } = await supabase
      .from("store_settings")
      .update({
        store_name: d.store_name,
        whatsapp_number: d.whatsapp_number,
        logo_url: d.logo_url,
        default_whatsapp_message: d.default_whatsapp_message,
        social_links: compact({ instagram: d.instagram, facebook: d.facebook, tiktok: d.tiktok, youtube: d.youtube }),
        contact_information: compact({ email: d.email, phone: d.phone, address: d.address, hours: d.hours }),
        about_text: d.about_text ?? null,
        policies_text: d.policies_text ?? null,
        payment_methods: d.payment_methods ?? null,
      })
      .eq("id", 1);
    if (error) return fail(dbError(error.message));
    refresh();
    return { ok: true };
  }) as Promise<ActionResult>;
}

// ---------- Pedidos / orçamentos ----------
export async function updateRecordAction(_: ActionResult, fd: FormData): Promise<ActionResult> {
  return guard(async () => {
    const { supabase } = await assertAdmin();
    const p = parse(recordUpdateSchema, fd);
    if (!p.ok) return p.res;
    const { id, table, status, admin_notes, total_amount } = p.data;
    const patch: Record<string, unknown> = { status, admin_notes: admin_notes ?? null };
    if (table === "orders" && fd.has("total_amount")) patch.total_amount = total_amount ?? null;
    const { error } = await supabase.from(table).update(patch).eq("id", id);
    if (error) return fail(dbError(error.message));
    revalidatePath("/admin", "layout");
    return { ok: true };
  }) as Promise<ActionResult>;
}
