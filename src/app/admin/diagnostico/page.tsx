import { CheckCircle2, CircleAlert, CircleX } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "@/components/admin/auth-shell";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = { title: "Diagnóstico da instalação", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Status = "ok" | "warn" | "fail";
type Check = { status: Status; title: string; detail: string; fix?: string };

/** Mostra só verdadeiro/falso e dicas. Nunca exibe chaves, senhas nem dados do banco. */
async function runChecks(): Promise<Check[]> {
  const checks: Check[] = [];
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const site = process.env.NEXT_PUBLIC_SITE_URL;

  // 1) Variáveis de ambiente
  if (!url || !key) {
    checks.push({
      status: "fail",
      title: "Variáveis do Supabase",
      detail: `Faltando: ${[!url && "NEXT_PUBLIC_SUPABASE_URL", !key && "NEXT_PUBLIC_SUPABASE_ANON_KEY"].filter(Boolean).join(" e ")}.`,
      fix: "Na Vercel: Settings → Environment Variables → crie as variáveis e depois faça Redeploy.",
    });
    return checks;
  }
  const urlOk = /^https:\/\/[a-z0-9]+\.supabase\.co\/?$/.test(url);
  checks.push({
    status: urlOk ? "ok" : "warn",
    title: "Variáveis do Supabase",
    detail: urlOk ? "URL e chave anon estão definidas." : `A URL definida (${url}) não parece a do Supabase (esperado https://xxxx.supabase.co, sem /rest/v1 no final).`,
    fix: urlOk ? undefined : "Copie o Project URL em Supabase → Project Settings → API.",
  });
  checks.push({
    status: site ? "ok" : "warn",
    title: "Endereço do site (NEXT_PUBLIC_SITE_URL)",
    detail: site ? `Definido: ${site}` : "Não definido. Os links de produto no WhatsApp e o e-mail de recuperação de senha podem usar o endereço errado.",
    fix: site ? undefined : "Crie NEXT_PUBLIC_SITE_URL com o endereço do site e faça Redeploy.",
  });

  // 2) Conexão com o Auth do Supabase (e configurações de cadastro)
  try {
    const res = await fetch(`${url.replace(/\/$/, "")}/auth/v1/settings`, { headers: { apikey: key }, cache: "no-store", signal: AbortSignal.timeout(6000) });
    if (res.status === 401 || res.status === 403) {
      checks.push({ status: "fail", title: "Conexão com o Supabase", detail: "A chave anon foi recusada.", fix: "Copie de novo a chave “anon public” (não a service_role) em Project Settings → API." });
    } else if (!res.ok) {
      checks.push({ status: "fail", title: "Conexão com o Supabase", detail: `O Supabase respondeu com erro ${res.status}.`, fix: "Confira se o projeto está ativo (projetos gratuitos pausam por inatividade) e se a URL está correta." });
    } else {
      const s = (await res.json()) as { disable_signup?: boolean };
      checks.push({ status: "ok", title: "Conexão com o Supabase", detail: "O Supabase respondeu e aceitou a chave." });
      checks.push({
        status: s.disable_signup ? "ok" : "warn",
        title: "Cadastro público de usuários",
        detail: s.disable_signup ? "Desligado (recomendado): ninguém consegue criar conta sozinho." : "Ligado. Qualquer pessoa poderia criar uma conta (ela não vira administradora, mas o ideal é desligar).",
        fix: s.disable_signup ? undefined : "Supabase → Authentication → Sign In / Providers → Email → desligue “Allow new users to sign up”.",
      });
    }
  } catch {
    checks.push({ status: "fail", title: "Conexão com o Supabase", detail: "Não foi possível falar com o Supabase.", fix: "Confira a URL em NEXT_PUBLIC_SUPABASE_URL e se o projeto não está pausado." });
    return checks;
  }

  // 3) Banco instalado + administrador cadastrado
  const db = createPublicClient();
  if (db) {
    const settings = await db.from("store_settings").select("id").eq("id", 1).maybeSingle();
    if (settings.error || !settings.data) {
      checks.push({
        status: "fail",
        title: "Banco de dados instalado",
        detail: settings.error ? "As tabelas do site não foram encontradas." : "As tabelas existem, mas faltam os dados iniciais.",
        fix: "Supabase → SQL Editor → New query → cole TODO o arquivo supabase/setup-completo.sql → Run.",
      });
    } else {
      checks.push({ status: "ok", title: "Banco de dados instalado", detail: "As tabelas e as configurações iniciais existem." });
      const st = await db.rpc("setup_status");
      if (st.error) {
        checks.push({
          status: "warn",
          title: "Administrador cadastrado",
          detail: "Não foi possível verificar (a função de diagnóstico não está instalada no banco).",
          fix: "Rode o arquivo supabase/migrations/20260101000800_setup_status.sql no SQL Editor, ou reinstale com o setup-completo.sql atualizado.",
        });
      } else if (!(st.data as { has_admin: boolean }).has_admin) {
        checks.push({
          status: "fail",
          title: "Administrador cadastrado",
          detail: "Nenhum usuário foi autorizado como administrador ainda.",
          fix: "1) Authentication → Users → Add user (marque Auto Confirm). 2) SQL Editor: insert into public.admins (user_id) select id from auth.users where email = 'seu@email.com';",
        });
      } else {
        checks.push({ status: "ok", title: "Administrador cadastrado", detail: "Existe ao menos um administrador autorizado." });
      }
    }
  }
  return checks;
}

const ICON = { ok: CheckCircle2, warn: CircleAlert, fail: CircleX } as const;
const TONE = { ok: "text-emerald-600", warn: "text-amber-600", fail: "text-red-600" } as const;

export default async function DiagnosticPage() {
  const checks = await runChecks();
  const fails = checks.filter((c) => c.status === "fail").length;
  return (
    <AuthShell
      title="Diagnóstico da instalação"
      subtitle={fails ? `${fails} ${fails === 1 ? "item precisa" : "itens precisam"} de atenção. Resolva de cima para baixo.` : "Tudo certo! Já dá para entrar no painel."}
      wide
    >
      <ol className="mt-5 space-y-3">
        {checks.map((c) => {
          const Icon = ICON[c.status];
          return (
            <li key={c.title} className="flex gap-3 rounded-2xl border border-line p-3">
              <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${TONE[c.status]}`} aria-label={c.status === "ok" ? "OK" : c.status === "warn" ? "Atenção" : "Erro"} />
              <div className="min-w-0 text-sm">
                <p className="font-bold">{c.title}</p>
                <p className="text-ink-soft">{c.detail}</p>
                {c.fix && <p className="mt-1 rounded-xl bg-amber-50 p-2 text-amber-950"><strong>Como resolver:</strong> {c.fix}</p>}
              </div>
            </li>
          );
        })}
      </ol>
      <p className="mt-5 text-center text-sm">
        <Link href="/admin/login" className="font-semibold text-brand-text hover:underline">Ir para o login</Link>
      </p>
    </AuthShell>
  );
}
