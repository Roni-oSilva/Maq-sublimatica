import type { Metadata } from "next";
import { LoginForm } from "./login-form";
import { Logo } from "@/components/site/logo";
import { isSupabaseConfigured } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Entrar — Administração", robots: { index: false, follow: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; erro?: string }> }) {
  const sp = await searchParams;
  return (
    <div className="admin-area flex min-h-screen items-center justify-center bg-ink p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-7 shadow-2xl">
        <Logo className="h-12 w-auto" />
        <h1 className="mt-4 text-2xl font-extrabold">Área administrativa</h1>
        <p className="mt-1 text-sm text-ink-muted">Acesso restrito a administradores.</p>
        {sp.erro === "forbidden" && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-800">Sua conta não tem permissão de administrador.</p>
        )}
        {!isSupabaseConfigured() && (
          <p role="alert" className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
            Supabase não configurado. Defina as variáveis de ambiente (veja o README).
          </p>
        )}
        <LoginForm next={sp.next ?? ""} />
      </div>
    </div>
  );
}
