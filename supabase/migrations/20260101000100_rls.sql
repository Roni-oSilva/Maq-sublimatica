-- =====================================================================
-- Row Level Security
-- Visitantes: leitura apenas de conteúdo ativo; escrita só via funções RPC.
-- Administradores (tabela public.admins): acesso total via is_admin().
-- =====================================================================

alter table public.admins          enable row level security;
alter table public.categories      enable row level security;
alter table public.products        enable row level security;
alter table public.product_images  enable row level security;
alter table public.artworks        enable row level security;
alter table public.services        enable row level security;
alter table public.banners         enable row level security;
alter table public.orders          enable row level security;
alter table public.custom_quotes   enable row level security;
alter table public.whatsapp_clicks enable row level security;
alter table public.store_settings  enable row level security;

-- admins: cada usuário só enxerga a própria linha; ninguém altera pela API.
create policy admins_self_read on public.admins for select to authenticated using (user_id = auth.uid());

-- Leitura pública de conteúdo ativo
create policy categories_public_read on public.categories for select to anon, authenticated using (active);
create policy products_public_read   on public.products   for select to anon, authenticated using (active);
create policy product_images_public_read on public.product_images for select to anon, authenticated
  using (exists (select 1 from public.products p where p.id = product_id and p.active));
create policy artworks_public_read on public.artworks for select to anon, authenticated using (active);
create policy services_public_read on public.services for select to anon, authenticated using (active);
create policy banners_public_read  on public.banners  for select to anon, authenticated using (active);
create policy settings_public_read on public.store_settings for select to anon, authenticated using (true);

-- Administradores: leitura (inclui inativos) e escrita
create policy categories_admin_all on public.categories for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy products_admin_all   on public.products   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy product_images_admin_all on public.product_images for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy artworks_admin_all   on public.artworks   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy services_admin_all   on public.services   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy banners_admin_all    on public.banners    for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy settings_admin_write on public.store_settings for update to authenticated using (public.is_admin()) with check (public.is_admin());

-- Pedidos, orçamentos e cliques: SEM acesso para visitantes (nem leitura, nem escrita).
create policy orders_admin_all  on public.orders          for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy quotes_admin_all  on public.custom_quotes   for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy clicks_admin_read on public.whatsapp_clicks for select to authenticated using (public.is_admin());

-- Defesa em profundidade: remove privilégios de tabela dos papéis públicos onde não são necessários.
revoke all on public.admins, public.orders, public.custom_quotes, public.whatsapp_clicks from anon;
revoke insert, update, delete on all tables in schema public from anon;
revoke all on all sequences in schema public from anon, authenticated;
