-- Conteúdo editável do site (textos, links, imagens e cores), chave → valor.
-- O catálogo de campos fica em src/lib/content.ts; valores ausentes usam o padrão do código.
create table public.site_content (
  key        text primary key check (key ~ '^[a-z0-9_]{2,80}$'),
  value      text not null check (char_length(value) <= 12000),
  updated_at timestamptz not null default now()
);
create trigger site_content_updated_at before update on public.site_content
  for each row execute function public.set_updated_at();

alter table public.site_content enable row level security;
create policy site_content_public_read on public.site_content for select to anon, authenticated using (true);
create policy site_content_admin_all   on public.site_content for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke insert, update, delete on public.site_content from anon;

-- A categoria "Equipamentos para Sublimação" (criada só pelo seed opcional) foi descontinuada.
delete from public.categories where kind = 'product' and slug = 'equipamentos-para-sublimacao';
