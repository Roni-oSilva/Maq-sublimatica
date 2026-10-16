import { cache } from "react";
import { redirect } from "next/navigation";
import { createServerSupabase } from "./supabase/server";
import { isSupabaseConfigured } from "./supabase/public";

/**
 * Autorização no servidor: exige sessão válida E registro na tabela `admins`.
 * Usado no layout do painel e em TODAS as Server Actions administrativas.
 */
export const requireAdmin = cache(async function requireAdmin() {
  if (!isSupabaseConfigured()) redirect("/admin/login");
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) redirect("/admin/login?erro=forbidden");
  return { supabase, user };
});

/** Variante para Server Actions: lança erro em vez de redirecionar. */
export async function assertAdmin() {
  if (!isSupabaseConfigured()) throw new Error("Banco de dados não configurado.");
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Sessão expirada. Entre novamente.");
  const { data: isAdmin } = await supabase.rpc("is_admin");
  if (!isAdmin) throw new Error("Sem permissão de administrador.");
  return { supabase, user };
}
