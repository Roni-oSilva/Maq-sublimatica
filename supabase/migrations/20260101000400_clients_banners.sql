-- Clientes (barra "Nossos Clientes"), posição dos banners e formas de pagamento.

alter table public.banners
  add column placement text not null default 'promo' check (placement in ('hero', 'promo'));

alter table public.store_settings
  add column payment_methods text check (char_length(payment_methods) <= 600);

create table public.clients (
  id            uuid primary key default gen_random_uuid(),
  name          text not null check (char_length(name) between 2 and 80),
  logo_url      text,
  display_order integer not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

alter table public.clients enable row level security;
create policy clients_public_read on public.clients for select to anon, authenticated using (active);
create policy clients_admin_all   on public.clients for all to authenticated using (public.is_admin()) with check (public.is_admin());
revoke insert, update, delete on public.clients from anon;
