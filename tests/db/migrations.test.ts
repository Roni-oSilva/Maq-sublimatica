import { PGlite } from "@electric-sql/pglite";
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { beforeAll, describe, expect, it } from "vitest";

/**
 * Executa as migrações reais em um PostgreSQL em memória (PGlite), com stubs mínimos
 * dos schemas `auth` e `storage` do Supabase, e verifica RLS, RPCs e constraints.
 */
const ADMIN = "00000000-0000-0000-0000-0000000000aa";
const USER = "00000000-0000-0000-0000-0000000000bb";

let db: PGlite;

async function as(role: "anon" | "authenticated" | "postgres", uid: string | null, fn: () => Promise<void>) {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false);`);
  if (role !== "postgres") await db.exec(`set role ${role};`);
  try {
    await fn();
  } finally {
    await db.exec("reset role;");
  }
}

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin; create role authenticated nologin;
    create schema auth; create schema storage;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint, allowed_mime_types text[]);
    create table storage.objects (id uuid default gen_random_uuid(), bucket_id text, name text);
    alter table storage.objects enable row level security;
    grant usage on schema public, auth, storage to anon, authenticated;
    alter default privileges in schema public grant all on tables to anon, authenticated;
    alter default privileges in schema public grant all on sequences to anon, authenticated;
    alter default privileges in schema public grant execute on functions to anon, authenticated, public;
    grant select, insert, update, delete on storage.objects to authenticated; grant select on storage.objects to anon;
    insert into auth.users values ('${ADMIN}'), ('${USER}');
  `);
  const dir = join(process.cwd(), "supabase/migrations");
  for (const f of readdirSync(dir).filter((f) => f.endsWith(".sql")).sort()) {
    await db.exec(readFileSync(join(dir, f), "utf8"));
  }
  await db.exec(`insert into public.admins values ('${ADMIN}');
    insert into public.categories (id, name, slug) values ('11111111-1111-1111-1111-111111111111', 'Equipamentos', 'equipamentos');
    insert into public.products (id, name, slug, price, category_id) values
      ('22222222-2222-2222-2222-222222222222', 'Prensa Térmica 38x38', 'prensa-termica-38x38', 850.00, '11111111-1111-1111-1111-111111111111');
    insert into public.products (id, name, slug, price_on_request) values
      ('33333333-3333-3333-3333-333333333333', 'Impressora', 'impressora', true);
    insert into public.products (id, name, slug, price, active) values
      ('44444444-4444-4444-4444-444444444444', 'Inativo', 'inativo', 10, false);`);
}, 60_000);

describe("RLS", () => {
  it("visitante lê só produtos ativos", async () => {
    await as("anon", null, async () => {
      const r = await db.query<{ slug: string }>("select slug from public.products order by slug");
      expect(r.rows.map((x) => x.slug)).toEqual(["impressora", "prensa-termica-38x38"]);
    });
  });

  it("visitante não acessa pedidos, orçamentos, cliques nem admins", async () => {
    await as("anon", null, async () => {
      for (const t of ["orders", "custom_quotes", "whatsapp_clicks", "admins"]) {
        await expect(db.query(`select * from public.${t}`)).rejects.toThrow(/permission denied/);
      }
    });
  });

  it("visitante não altera produtos nem configurações", async () => {
    await as("anon", null, async () => {
      await expect(db.query("update public.products set price = 1")).rejects.toThrow(/permission denied/);
      await expect(db.query("update public.store_settings set store_name = 'x'")).rejects.toThrow(/permission denied/);
      await expect(
        db.query("insert into public.orders (order_number, status) values ('X', 'confirmed')"),
      ).rejects.toThrow(/permission denied/);
    });
  });

  it("usuário autenticado que não é admin não escreve nem lê pedidos", async () => {
    await as("authenticated", USER, async () => {
      const upd = await db.query("update public.products set price = 1 returning id");
      expect(upd.rows).toHaveLength(0);
      const orders = await db.query("select * from public.orders");
      expect(orders.rows).toHaveLength(0);
      await expect(db.query("select * from public.admin_monthly_stats(12)")).rejects.toThrow(/forbidden/);
      await expect(
        db.query("insert into public.products (name, slug, price) values ('Hack', 'hack', 1)"),
      ).rejects.toThrow(/row-level security/);
    });
  });

  it("administrador enxerga inclusive produtos inativos e edita", async () => {
    await as("authenticated", ADMIN, async () => {
      const r = await db.query("select count(*)::int as n from public.products");
      expect((r.rows[0] as { n: number }).n).toBe(3);
      const u = await db.query("update public.products set featured = true where slug = 'impressora' returning featured");
      expect(u.rows).toHaveLength(1);
    });
  });
});

describe("constraints", () => {
  it("exige preço quando não é sob consulta", async () => {
    await as("postgres", null, async () => {
      await expect(db.query("insert into public.products (name, slug) values ('Sem preço', 'sem-preco')")).rejects.toThrow(
        /products_price_rule/,
      );
      await expect(
        db.query("insert into public.products (name, slug, price) values ('Slug ruim', 'Slug Ruim', 1)"),
      ).rejects.toThrow();
    });
  });

  it("valida o número de WhatsApp em formato internacional", async () => {
    await as("postgres", null, async () => {
      await expect(db.query("update public.store_settings set whatsapp_number = '(11) 99999-9999'")).rejects.toThrow();
      await db.query("update public.store_settings set whatsapp_number = '5511999999999'");
    });
  });
});

describe("register_order", () => {
  it("calcula preço no servidor, gera protocolo e registra o clique", async () => {
    await as("anon", null, async () => {
      const r = await db.query<{ res: { order_number: string } }>(
        `select public.register_order('Maria', '(11) 98888-7777',
          '[{"kind":"product","id":"22222222-2222-2222-2222-222222222222","quantity":2,"unit_price":0.01}]'::jsonb, 'product') as res`,
      );
      expect(r.rows[0].res.order_number).toMatch(/^PED-\d{4}-\d{6}$/);
    });
    await as("postgres", null, async () => {
      const o = await db.query<{ total_amount: string; status: string; customer_phone: string; items: { unit_price: number }[] }>(
        "select * from public.orders",
      );
      expect(o.rows).toHaveLength(1);
      expect(Number(o.rows[0].total_amount)).toBe(1700);
      expect(o.rows[0].status).toBe("new");
      expect(o.rows[0].customer_phone).toBe("11988887777");
      expect(Number(o.rows[0].items[0].unit_price)).toBe(850);
      const c = await db.query("select * from public.whatsapp_clicks where kind = 'product'");
      expect(c.rows).toHaveLength(1);
    });
  });

  it("marca itens sob consulta e rejeita itens inexistentes/inativos", async () => {
    await as("anon", null, async () => {
      await db.query(
        `select public.register_order(null, null, '[{"kind":"product","id":"33333333-3333-3333-3333-333333333333","quantity":1}]'::jsonb, 'product')`,
      );
      await expect(
        db.query(
          `select public.register_order(null, null, '[{"kind":"product","id":"44444444-4444-4444-4444-444444444444","quantity":1}]'::jsonb, 'product')`,
        ),
      ).rejects.toThrow(/item_not_found/);
      await expect(db.query(`select public.register_order(null, null, '[]'::jsonb, 'product')`)).rejects.toThrow(/invalid_items/);
    });
    await as("postgres", null, async () => {
      const o = await db.query<{ has_unpriced_items: boolean }>(
        "select has_unpriced_items from public.orders order by created_at desc limit 1",
      );
      expect(o.rows[0].has_unpriced_items).toBe(true);
    });
  });
});

describe("register_quote", () => {
  it("registra orçamento válido e rejeita inválidos", async () => {
    await as("anon", null, async () => {
      const r = await db.query<{ res: { protocol_number: string } }>(
        `select public.register_quote('João', '11977776666', 'Canecas', '50', '15 dias', 'Quero 50 canecas com a logo da empresa', 'azul', 'https://exemplo.com/ref') as res`,
      );
      expect(r.rows[0].res.protocol_number).toMatch(/^ORC-\d{4}-\d{6}$/);
      await expect(
        db.query(`select public.register_quote('J', null, 'Canecas', null, null, 'Quero 50 canecas', null, null)`),
      ).rejects.toThrow(/invalid_name/);
      await expect(
        db.query(`select public.register_quote('João', null, 'Canecas', null, null, 'curto', null, null)`),
      ).rejects.toThrow(/invalid_description/);
      await expect(
        db.query(`select public.register_quote('João', null, 'Canecas', null, null, 'descrição válida', null, 'javascript:alert(1)')`),
      ).rejects.toThrow(/invalid_reference_url/);
    });
  });
});

describe("dashboard", () => {
  it("retorna 12 meses com zeros e dados reais", async () => {
    await as("authenticated", ADMIN, async () => {
      const r = await db.query<{ month: string; registered: number; quotes: number; clicks: number }>(
        "select * from public.admin_monthly_stats(12)",
      );
      expect(r.rows).toHaveLength(12);
      const last = r.rows[11];
      expect(last.registered).toBe(2);
      expect(last.quotes).toBe(1);
      expect(last.clicks).toBeGreaterThanOrEqual(3);
      expect(r.rows.slice(0, 11).every((m) => m.registered === 0 && m.quotes === 0)).toBe(true);
      const c = await db.query<{ j: { total_orders: number; active_products: number } }>(
        "select public.admin_dashboard_counters() as j",
      );
      expect(c.rows[0].j.total_orders).toBe(2);
    });
  });

  it("popular_products ordena por cliques", async () => {
    await as("anon", null, async () => {
      await db.query("select public.track_whatsapp_click('product', 'Prensa', '22222222-2222-2222-2222-222222222222')");
      const r = await db.query<{ popular_products: string }>("select * from public.popular_products(5)");
      expect(r.rows[0].popular_products).toBe("22222222-2222-2222-2222-222222222222");
    });
  });
});
