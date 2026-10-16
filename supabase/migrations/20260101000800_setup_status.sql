-- Diagnóstico de instalação (usado por /admin/diagnostico): só devolve verdadeiro/falso, nenhum dado.
create or replace function public.setup_status()
returns jsonb
language sql
stable
security definer
set search_path = public
as $$
  select jsonb_build_object(
    'has_admin', exists (select 1 from public.admins),
    'has_settings', exists (select 1 from public.store_settings)
  );
$$;
revoke execute on function public.setup_status() from public;
grant execute on function public.setup_status() to anon, authenticated;
