import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cliente com a sessão do usuário (cookies). Todas as operações respeitam o RLS. */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // Chamado a partir de um Server Component: o middleware já renova a sessão.
        }
      },
    },
  });
}
