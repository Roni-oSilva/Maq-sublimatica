import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AuthShell } from "@/components/admin/auth-shell";
import { createServerSupabase } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import { PasswordForm } from "@/components/admin/password-form";
import { resetPasswordAction } from "../actions";

export const metadata: Metadata = { title: "Nova senha — Administração", robots: { index: false, follow: false } };

export default async function ResetPasswordPage() {
  if (!isSupabaseConfigured()) redirect("/admin/login");
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login?erro=link");
  return (
    <AuthShell title="Criar nova senha" subtitle={`Defina a nova senha de ${user.email ?? "sua conta"}.`}>
      <PasswordForm action={resetPasswordAction} submitLabel="Salvar nova senha" />
    </AuthShell>
  );
}
