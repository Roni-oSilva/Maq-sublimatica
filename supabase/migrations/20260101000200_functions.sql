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
