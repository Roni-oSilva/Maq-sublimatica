"use client";

import { useEffect } from "react";

/**
 * Captura links de autenticação enviados por e-mail pelo Supabase, em qualquer página do site:
 *  - `#access_token=…&refresh_token=…&type=recovery`  (link enviado pelo painel do Supabase)
 *  - `#error=…&error_code=otp_expired`                 (link vencido ou já usado)
 *  - `?code=…`                                         (link gerado por “Esqueci minha senha”, PKCE)
 * e leva a pessoa à tela de nova senha ou ao login com uma mensagem clara.
 */
export function AuthLinkHandler() {
  useEffect(() => {
    const { hash, search, pathname } = window.location;
    if (pathname.startsWith("/admin/auth/")) return;

    const h = new URLSearchParams(hash.startsWith("#") ? hash.slice(1) : "");
    const q = new URLSearchParams(search);

    if (h.get("error") || h.get("error_code")) {
      window.location.replace("/admin/login?erro=link");
      return;
    }

    const access = h.get("access_token");
    const refresh = h.get("refresh_token");
    if (access && refresh && (h.get("type") === "recovery" || h.get("type") === "magiclink")) {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      if (!url || !key) return;
      // Importação sob demanda: a biblioteca do Supabase só é baixada neste caso raro.
      import("@supabase/ssr")
        .then(({ createBrowserClient }) => createBrowserClient(url, key).auth.setSession({ access_token: access, refresh_token: refresh }))
        .then(({ error }) => window.location.replace(error ? "/admin/login?erro=link" : "/admin/redefinir-senha"))
        .catch(() => window.location.replace("/admin/login?erro=link"));
      return;
    }

    const code = q.get("code");
    if (code && !pathname.startsWith("/admin/esqueci-senha")) {
      window.location.replace(`/admin/auth/confirm?code=${encodeURIComponent(code)}&next=/admin/redefinir-senha`);
    }
  }, []);
  return null;
}
