"use server";

import { createPublicClient } from "@/lib/supabase/public";
import { orderItemSchema, quoteSchema, flattenErrors, type FieldErrors } from "@/lib/validation";
import { z } from "zod";

export type OrderResult = { ok: true; orderNumber: string } | { ok: false; error: string };

/** Registra o pedido (status "Novo") antes de abrir o WhatsApp. Preço e total são calculados no banco. */
export async function registerOrderAction(input: unknown): Promise<OrderResult> {
  const parsed = orderItemSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Item inválido." };
  const db = createPublicClient();
  if (!db) return { ok: false, error: "Banco de dados não configurado." };

  const { data, error } = await db.rpc("register_order", {
    p_customer_name: null,
    p_customer_phone: null,
    p_items: [parsed.data],
    p_source: parsed.data.kind,
  });
  if (error) {
    console.error("[register_order]", error.message);
    return { ok: false, error: "Não foi possível registrar o pedido." };
  }
  return { ok: true, orderNumber: (data as { order_number: string }).order_number };
}

export type QuoteResult =
  | { ok: true; protocol: string }
  | { ok: false; error: string; fieldErrors?: FieldErrors };

export async function registerQuoteAction(input: unknown): Promise<QuoteResult> {
  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Revise os campos destacados.", fieldErrors: flattenErrors(parsed.error) };
  }
  const q = parsed.data;
  const db = createPublicClient();
  if (!db) return { ok: false, error: "Banco de dados não configurado." };

  const { data, error } = await db.rpc("register_quote", {
    p_customer_name: q.customerName,
    p_customer_phone: q.customerPhone ?? null,
    p_product_type: q.productType,
    p_quantity: q.quantity ?? null,
    p_deadline: q.deadline ?? null,
    p_description: q.description,
    p_details: q.details ?? null,
    p_reference_url: q.referenceUrl ?? null,
  });
  if (error) {
    console.error("[register_quote]", error.message);
    return { ok: false, error: "Não foi possível registrar a solicitação. Tente novamente." };
  }
  return { ok: true, protocol: (data as { protocol_number: string }).protocol_number };
}

const clickSchema = z.object({ label: z.string().max(200).optional() });

/** Contabiliza clique genérico no WhatsApp (cabeçalho, rodapé etc.). Não é venda. */
export async function trackGeneralClickAction(input: unknown): Promise<void> {
  const parsed = clickSchema.safeParse(input);
  const db = createPublicClient();
  if (!parsed.success || !db) return;
  await db.rpc("track_whatsapp_click", { p_kind: "general", p_label: parsed.data.label ?? null, p_ref: null });
}
