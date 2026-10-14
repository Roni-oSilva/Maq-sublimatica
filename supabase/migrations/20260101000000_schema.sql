-- =====================================================================
-- Maq Sublimática — esquema principal
-- Tabelas, constraints, índices, triggers e funções de apoio.
-- As políticas RLS estão em 20260101000100_rls.sql
-- =====================================================================

-- ---------- Administradores ------------------------------------------
-- Somente usuários listados aqui acessam o painel. Não há cadastro público.
create table public.admins (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- Categorias -----------------------------------------------
create table public.categories (
  id            uuid primary key default gen_random_uuid(),
  kind          text not null default 'product' check (kind in ('product', 'artwork', 'service')),
  name          text not null check (char_length(name) between 2 and 80),
  slug          text not null check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description   text check (char_length(description) <= 500),
  active        boolean not null default true,
  display_order integer not null default 0,
  created_at    timestamptz not null default now(),
  unique (kind, slug)
);

-- ---------- Produtos -------------------------------------------------
create table public.products (
  id                  uuid primary key default gen_random_uuid(),
  name                text not null check (char_length(name) between 2 and 160),
  slug                text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description         text check (char_length(description) <= 5000),
  specifications      text check (char_length(specifications) <= 5000),
  price               numeric(12, 2) check (price >= 0),
  price_on_request    boolean not null default false,
  category_id         uuid references public.categories (id) on delete set null,
  image_url           text,
  active              boolean not null default true,
  featured            boolean not null default false,
  available           boolean not null default true,
  track_stock         boolean not null default false,
  stock_quantity      integer check (stock_quantity >= 0),
  low_stock_threshold integer not null default 5 check (low_stock_threshold >= 0),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),
  constraint products_price_rule check (price_on_request or price is not null),
  constraint products_stock_rule check (not track_stock or stock_quantity is not null)
);
create index products_category_idx on public.products (category_id);
create index products_public_idx   on public.products (active, featured, created_at desc);
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

create table public.product_images (
  id            uuid primary key default gen_random_uuid(),
  product_id    uuid not null references public.products (id) on delete cascade,
  image_url     text not null,
  display_order integer not null default 0
);
create index product_images_product_idx on public.product_images (product_id, display_order);

-- ---------- Artes prontas --------------------------------------------
create table public.artworks (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 2 and 160),
  code             text not null unique check (char_length(code) between 1 and 40),
  description      text check (char_length(description) <= 2000),
  category_id      uuid references public.categories (id) on delete set null,
  image_url        text,
  price            numeric(12, 2) check (price >= 0),
  price_on_request boolean not null default false,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint artworks_price_rule check (price_on_request or price is not null)
);
create index artworks_public_idx on public.artworks (active, created_at desc);
create trigger artworks_updated_at before update on public.artworks
  for each row execute function public.set_updated_at();

-- ---------- Serviços -------------------------------------------------
create table public.services (
  id               uuid primary key default gen_random_uuid(),
  name             text not null check (char_length(name) between 2 and 160),
  description      text check (char_length(description) <= 3000),
  specifications   text check (char_length(specifications) <= 3000),
  lead_time        text check (char_length(lead_time) <= 120),
  category_id      uuid references public.categories (id) on delete set null,
  image_url        text,
  price            numeric(12, 2) check (price >= 0),
  price_on_request boolean not null default false,
  active           boolean not null default true,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  constraint services_price_rule check (price_on_request or price is not null)
);
create index services_public_idx on public.services (active, created_at desc);
create trigger services_updated_at before update on public.services
  for each row execute function public.set_updated_at();

-- ---------- Banners --------------------------------------------------
create table public.banners (
  id            uuid primary key default gen_random_uuid(),
  title         text not null check (char_length(title) between 2 and 120),
  subtitle      text check (char_length(subtitle) <= 300),
  image_url     text,
  cta_label     text check (char_length(cta_label) <= 40),
  cta_href      text check (cta_href ~ '^(/|https?://)'),
  display_order integer not null default 0,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

-- ---------- Pedidos e orçamentos -------------------------------------
create sequence public.order_number_seq;
create sequence public.quote_number_seq;

create table public.orders (
  id                 uuid primary key default gen_random_uuid(),
  order_number       text not null unique,
  customer_name      text check (char_length(customer_name) <= 120),
  customer_phone     text check (customer_phone ~ '^[0-9]{8,15}$'),
  items              jsonb not null default '[]'::jsonb check (jsonb_typeof(items) = 'array'),
  total_amount       numeric(12, 2) check (total_amount >= 0),
  has_unpriced_items boolean not null default false,
  status             text not null default 'new'
                       check (status in ('new', 'in_progress', 'awaiting_payment', 'confirmed', 'completed', 'cancelled')),
  source             text not null default 'product' check (source in ('product', 'artwork', 'service', 'manual')),
  admin_notes        text check (char_length(admin_notes) <= 2000),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
create index orders_created_idx on public.orders (created_at desc);
create index orders_status_idx  on public.orders (status);
create trigger orders_updated_at before update on public.orders
  for each row execute function public.set_updated_at();

create table public.custom_quotes (
  id               uuid primary key default gen_random_uuid(),
  protocol_number  text not null unique,
  customer_name    text not null check (char_length(customer_name) between 2 and 120),
  customer_phone   text check (customer_phone ~ '^[0-9]{8,15}$'),
  product_type     text not null check (char_length(product_type) between 2 and 160),
  quantity         text check (char_length(quantity) <= 60),
  desired_deadline text check (char_length(desired_deadline) <= 120),
  description      text not null check (char_length(description) between 10 and 3000),
  details          text check (char_length(details) <= 2000),
  reference_url    text check (reference_url ~ '^https?://'),
  status           text not null default 'new'
                     check (status in ('new', 'in_progress', 'awaiting_payment', 'confirmed', 'completed', 'cancelled')),
  admin_notes      text check (char_length(admin_notes) <= 2000),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index custom_quotes_created_idx on public.custom_quotes (created_at desc);
create index custom_quotes_status_idx  on public.custom_quotes (status);
create trigger custom_quotes_updated_at before update on public.custom_quotes
  for each row execute function public.set_updated_at();

-- Cliques para iniciar conversa no WhatsApp. NÃO são vendas.
create table public.whatsapp_clicks (
  id         uuid primary key default gen_random_uuid(),
  kind       text not null check (kind in ('product', 'artwork', 'service', 'quote', 'general')),
  ref_id     uuid,
  label      text check (char_length(label) <= 200),
  created_at timestamptz not null default now()
);
create index whatsapp_clicks_created_idx on public.whatsapp_clicks (created_at desc);
create index whatsapp_clicks_ref_idx     on public.whatsapp_clicks (kind, ref_id);

-- ---------- Configurações da loja (linha única) ----------------------
create table public.store_settings (
  id                       smallint primary key default 1 check (id = 1),
  store_name               text not null default 'Maq Sublimática' check (char_length(store_name) between 2 and 80),
  whatsapp_number          text check (whatsapp_number ~ '^[1-9][0-9]{9,14}$'),
  logo_url                 text,
  default_whatsapp_message text not null default 'Olá! Gostaria de mais informações sobre os produtos da Maq Sublimática.'
                             check (char_length(default_whatsapp_message) <= 500),
  social_links             jsonb not null default '{}'::jsonb check (jsonb_typeof(social_links) = 'object'),
  contact_information      jsonb not null default '{}'::jsonb check (jsonb_typeof(contact_information) = 'object'),
  about_text               text check (char_length(about_text) <= 8000),
  policies_text            text check (char_length(policies_text) <= 12000),
  updated_at               timestamptz not null default now()
);
create trigger store_settings_updated_at before update on public.store_settings
  for each row execute function public.set_updated_at();

insert into public.store_settings (id, about_text, policies_text) values (
  1,
  'A Maq Sublimática oferece equipamentos, insumos, artes e serviços para sublimação e personalização. Edite este texto em Admin → Configurações.',
  E'Pedidos, pagamento e frete são combinados diretamente pelo WhatsApp.\nEdite as políticas da loja em Admin → Configurações.'
);
