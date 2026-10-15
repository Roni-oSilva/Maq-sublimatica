-- =====================================================================
-- MAQ SUBLIMÁTICA — instalação completa do banco (gerado automaticamente)
-- Cole este arquivo inteiro no Supabase → SQL Editor e clique em Run.
-- Rode UMA vez, em um projeto novo. Não edite: regenere com `npm run db:bundle`.
-- =====================================================================
-- ---------- 20260101000000_schema.sql ----------
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

-- ---------- 20260101000100_rls.sql ----------
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

-- ---------- 20260101000200_functions.sql ----------
-- =====================================================================
-- Funções (RPC)
-- O visitante NUNCA envia preço, total ou status: tudo é calculado aqui.
-- =====================================================================

create or replace function public.register_order(
  p_customer_name  text,
  p_customer_phone text,
  p_items          jsonb,
  p_source         text default 'product'
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item     jsonb;
  v_kind     text;
  v_id       uuid;
  v_qty      integer;
  v_name     text;
  v_ref      text;
  v_price    numeric(12, 2);
  v_on_req   boolean;
  v_snapshot jsonb := '[]'::jsonb;
  v_total    numeric(12, 2) := 0;
  v_unpriced boolean := false;
  v_number   text;
  v_first_id uuid;
  v_first_nm text;
  v_phone    text := nullif(regexp_replace(coalesce(p_customer_phone, ''), '\D', '', 'g'), '');
  v_source   text := coalesce(p_source, 'product');
begin
  if v_source not in ('product', 'artwork', 'service') then
    raise exception 'invalid_source' using errcode = '22023';
  end if;
  if p_items is null or jsonb_typeof(p_items) <> 'array'
     or jsonb_array_length(p_items) not between 1 and 20 then
    raise exception 'invalid_items' using errcode = '22023';
  end if;
  if v_phone is not null and v_phone !~ '^[0-9]{8,15}$' then
    raise exception 'invalid_phone' using errcode = '22023';
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_kind := v_item ->> 'kind';
    v_id   := (v_item ->> 'id')::uuid;
    v_qty  := coalesce((v_item ->> 'quantity')::integer, 1);
    v_name := null;
    if v_qty not between 1 and 999 then
      raise exception 'invalid_quantity' using errcode = '22023';
    end if;

    if v_kind = 'product' then
      select name, slug, price, price_on_request into v_name, v_ref, v_price, v_on_req
        from public.products where id = v_id and active;
    elsif v_kind = 'artwork' then
      select name, code, price, price_on_request into v_name, v_ref, v_price, v_on_req
        from public.artworks where id = v_id and active;
    elsif v_kind = 'service' then
      select name, null::text, price, price_on_request into v_name, v_ref, v_price, v_on_req
        from public.services where id = v_id and active;
    else
      raise exception 'invalid_kind' using errcode = '22023';
    end if;
    if v_name is null then
      raise exception 'item_not_found' using errcode = 'P0002';
    end if;

    if v_on_req or v_price is null then
      v_unpriced := true;
      v_price := null;
    else
      v_total := v_total + v_price * v_qty;
    end if;

    v_snapshot := v_snapshot || jsonb_build_object(
      'kind', v_kind, 'id', v_id, 'name', v_name, 'ref', v_ref,
      'quantity', v_qty, 'unit_price', v_price, 'price_on_request', coalesce(v_on_req, false));
    if v_first_id is null then v_first_id := v_id; v_first_nm := v_name; end if;
  end loop;

  v_number := 'PED-' || to_char(now() at time zone 'America/Sao_Paulo', 'YYYY') || '-'
              || lpad(nextval('public.order_number_seq')::text, 6, '0');

  insert into public.orders (order_number, customer_name, customer_phone, items, total_amount, has_unpriced_items, source)
  values (v_number, nullif(left(trim(coalesce(p_customer_name, '')), 120), ''), v_phone, v_snapshot,
          case when v_total > 0 or not v_unpriced then v_total end, v_unpriced, v_source);

  insert into public.whatsapp_clicks (kind, ref_id, label) values (v_source, v_first_id, left(v_first_nm, 200));

  return jsonb_build_object('order_number', v_number);
end;
$$;

create or replace function public.register_quote(
  p_customer_name  text,
  p_customer_phone text,
  p_product_type   text,
  p_quantity       text,
  p_deadline       text,
  p_description    text,
  p_details        text,
  p_reference_url  text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_number text;
  v_phone  text := nullif(regexp_replace(coalesce(p_customer_phone, ''), '\D', '', 'g'), '');
  v_ref    text := nullif(trim(coalesce(p_reference_url, '')), '');
begin
  if char_length(trim(coalesce(p_customer_name, ''))) < 2 then raise exception 'invalid_name' using errcode = '22023'; end if;
  if char_length(trim(coalesce(p_product_type, ''))) < 2 then raise exception 'invalid_product_type' using errcode = '22023'; end if;
  if char_length(trim(coalesce(p_description, ''))) < 10 then raise exception 'invalid_description' using errcode = '22023'; end if;
  if v_phone is not null and v_phone !~ '^[0-9]{8,15}$' then raise exception 'invalid_phone' using errcode = '22023'; end if;
  if v_ref is not null and v_ref !~ '^https?://' then raise exception 'invalid_reference_url' using errcode = '22023'; end if;

  v_number := 'ORC-' || to_char(now() at time zone 'America/Sao_Paulo', 'YYYY') || '-'
              || lpad(nextval('public.quote_number_seq')::text, 6, '0');

  insert into public.custom_quotes (protocol_number, customer_name, customer_phone, product_type, quantity,
                                    desired_deadline, description, details, reference_url)
  values (v_number, left(trim(p_customer_name), 120), v_phone, left(trim(p_product_type), 160),
          nullif(left(trim(coalesce(p_quantity, '')), 60), ''), nullif(left(trim(coalesce(p_deadline, '')), 120), ''),
          trim(p_description), nullif(left(trim(coalesce(p_details, '')), 2000), ''), v_ref);

  insert into public.whatsapp_clicks (kind, label) values ('quote', left(trim(p_product_type), 200));

  return jsonb_build_object('protocol_number', v_number);
end;
$$;

create or replace function public.track_whatsapp_click(p_kind text, p_label text default null, p_ref uuid default null)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if p_kind not in ('product', 'artwork', 'service', 'quote', 'general') then
    raise exception 'invalid_kind' using errcode = '22023';
  end if;
  insert into public.whatsapp_clicks (kind, ref_id, label) values (p_kind, p_ref, left(p_label, 200));
end;
$$;

-- Produtos mais procurados = mais cliques/pedidos nos últimos 90 dias.
create or replace function public.popular_products(p_limit integer default 8)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  select c.ref_id
    from public.whatsapp_clicks c
    join public.products p on p.id = c.ref_id and p.active
   where c.kind = 'product' and c.created_at > now() - interval '90 days'
   group by c.ref_id
   order by count(*) desc, max(c.created_at) desc
   limit least(greatest(p_limit, 1), 24);
$$;

-- Série mensal para o dashboard (meses sem dados aparecem com zero).
create or replace function public.admin_monthly_stats(p_months integer default 12)
returns table (month text, registered integer, confirmed integer, completed integer, quotes integer, clicks integer)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_months integer := least(greatest(coalesce(p_months, 12), 1), 36);
  v_tz constant text := 'America/Sao_Paulo';
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  return query
  with months as (
    select generate_series(
             date_trunc('month', now() at time zone v_tz) - ((v_months - 1) * interval '1 month'),
             date_trunc('month', now() at time zone v_tz),
             interval '1 month') as m
  )
  select to_char(months.m, 'YYYY-MM'),
    (select count(*)::int from public.orders o where date_trunc('month', o.created_at at time zone v_tz) = months.m),
    (select count(*)::int from public.orders o where o.status = 'confirmed' and date_trunc('month', o.created_at at time zone v_tz) = months.m),
    (select count(*)::int from public.orders o where o.status = 'completed' and date_trunc('month', o.created_at at time zone v_tz) = months.m),
    (select count(*)::int from public.custom_quotes q where date_trunc('month', q.created_at at time zone v_tz) = months.m),
    (select count(*)::int from public.whatsapp_clicks w where date_trunc('month', w.created_at at time zone v_tz) = months.m)
  from months
  order by months.m;
end;
$$;

create or replace function public.admin_dashboard_counters()
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
begin
  if not public.is_admin() then
    raise exception 'forbidden' using errcode = '42501';
  end if;
  return jsonb_build_object(
    'total_orders',    (select count(*) from public.orders),
    'new_orders',      (select count(*) from public.orders where status = 'new'),
    'total_quotes',    (select count(*) from public.custom_quotes),
    'new_quotes',      (select count(*) from public.custom_quotes where status = 'new'),
    'active_products', (select count(*) from public.products where active),
    'low_stock',       (select count(*) from public.products
                         where active and track_stock and stock_quantity <= low_stock_threshold),
    'total_clicks',    (select count(*) from public.whatsapp_clicks)
  );
end;
$$;

-- Permissões de execução: remove o padrão (PUBLIC) e concede só o necessário.
revoke execute on function public.register_order(text, text, jsonb, text) from public;
revoke execute on function public.register_quote(text, text, text, text, text, text, text, text) from public;
revoke execute on function public.track_whatsapp_click(text, text, uuid) from public;
revoke execute on function public.popular_products(integer) from public;
revoke execute on function public.admin_monthly_stats(integer) from public;
revoke execute on function public.admin_dashboard_counters() from public;

grant execute on function public.register_order(text, text, jsonb, text) to anon, authenticated;
grant execute on function public.register_quote(text, text, text, text, text, text, text, text) to anon, authenticated;
grant execute on function public.track_whatsapp_click(text, text, uuid) to anon, authenticated;
grant execute on function public.popular_products(integer) to anon, authenticated;
grant execute on function public.admin_monthly_stats(integer) to authenticated;
grant execute on function public.admin_dashboard_counters() to authenticated;

-- ---------- 20260101000300_storage.sql ----------
-- Bucket público "media" para imagens (produtos, artes, serviços, banners, logotipo).
-- Limite de 4 MB e apenas imagens; somente administradores escrevem.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('media', 'media', true, 4194304, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

create policy media_public_read on storage.objects for select to anon, authenticated
  using (bucket_id = 'media');
create policy media_admin_insert on storage.objects for insert to authenticated
  with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_update on storage.objects for update to authenticated
  using (bucket_id = 'media' and public.is_admin()) with check (bucket_id = 'media' and public.is_admin());
create policy media_admin_delete on storage.objects for delete to authenticated
  using (bucket_id = 'media' and public.is_admin());

-- ---------- 20260101000400_clients_banners.sql ----------
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

-- ---------- 20260101000500_initial_content.sql ----------
-- Conteúdo inicial vindo do site anterior. Tudo é editável em Admin (Configurações, Banners, Clientes).

update public.store_settings
   set contact_information = jsonb_build_object(
         'phone',   '(91) 98108-6722',
         'address', 'Rua Vitória, 157B - Resende 2, Ulianópolis - PA, 68632-000',
         'hours',   'Segunda a sábado, das 8h às 18h'),
       payment_methods = E'Visa\nMastercard\nAmerican Express\nBoleto\nPayPal\nMercado Pago\nPagSeguro'
 where id = 1;

insert into public.banners (title, subtitle, cta_label, cta_href, display_order, placement)
select * from (values
  ('Presentes para todas as épocas do ano!', 'Presenteie quem você ama.', 'Ver presentes', '/loja', 1, 'promo'),
  ('Personalizados com seus personagens favoritos.', 'Infinitas possibilidades.', 'Quero personalizar', '/personalizar', 2, 'promo')
) as v(title, subtitle, cta_label, cta_href, display_order, placement)
where not exists (select 1 from public.banners);

insert into public.clients (name, display_order)
select * from (values
  ('Ipiranga', 1), ('Symplá', 2), ('Rede Inova Drogarias', 3), ('Pagrisa', 4), ('Solar Maxx', 5)
) as v(name, display_order)
where not exists (select 1 from public.clients);

-- ---------- 20260101000600_site_content.sql ----------
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

-- ---------- 20260101000700_client_logos.sql ----------
-- Logotipos dos clientes iniciais (arquivos em /public/clients). Editáveis em Admin → Clientes.
update public.clients set logo_url = '/clients/ipiranga.png'              where name = 'Ipiranga'             and logo_url is null;
update public.clients set logo_url = '/clients/sympla.png'                where name = 'Symplá'               and logo_url is null;
update public.clients set logo_url = '/clients/rede-inova-drogarias.png'  where name = 'Rede Inova Drogarias' and logo_url is null;
update public.clients set logo_url = '/clients/pagrisa.png'               where name = 'Pagrisa'              and logo_url is null;
update public.clients set logo_url = '/clients/solar-maxx.png'            where name = 'Solar Maxx'           and logo_url is null;
