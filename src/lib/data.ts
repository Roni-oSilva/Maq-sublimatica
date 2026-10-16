import { unstable_cache } from "next/cache";
import { cache } from "react";
import { DEFAULT_CONTENT, mergeContent, type SiteContent } from "./content";
import { createPublicClient } from "./supabase/public";
import { escapeLike } from "./utils";
import {
  DEFAULT_SETTINGS,
  type Artwork,
  type Banner,
  type Category,
  type Client,
  type CategoryKind,
  type Product,
  type ProductImage,
  type Service,
  type StoreSettings,
} from "./types";

/** Consultas públicas (somente conteúdo ativo; o RLS garante o mesmo no banco). */

const PRODUCT_SELECT = "*, category:categories(id, name, slug)";

function unwrap<T>(res: { data: T | null; error: { message: string } | null }, fallback: T): T {
  if (res.error) throw new Error(res.error.message);
  return res.data ?? fallback;
}

/** Textos, links, imagens e cores editáveis (padrões + valores salvos). Nunca derruba o site. */
async function getContentRaw(): Promise<SiteContent> {
  const db = createPublicClient();
  if (!db) return DEFAULT_CONTENT;
  const { data, error } = await db.from("site_content").select("key, value");
  if (error) {
    console.error("[site_content]", error.message);
    return DEFAULT_CONTENT;
  }
  return mergeContent(data);
}

async function getSettingsRaw(): Promise<StoreSettings> {
  const db = createPublicClient();
  if (!db) return DEFAULT_SETTINGS;
  const res = await db.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const row = unwrap(res, null);
  return row ? ({ ...DEFAULT_SETTINGS, ...row } as StoreSettings) : DEFAULT_SETTINGS;
}

async function getBannersRaw(): Promise<Banner[]> {
  const db = createPublicClient();
  if (!db) return [];
  return unwrap(await db.from("banners").select("*").eq("active", true).order("display_order").order("created_at"), []);
}

async function getClientsRaw(): Promise<Client[]> {
  const db = createPublicClient();
  if (!db) return [];
  return unwrap(await db.from("clients").select("*").eq("active", true).order("display_order").order("created_at"), []);
}

async function getCategoriesRaw(kind: CategoryKind = "product"): Promise<Category[]> {
  const db = createPublicClient();
  if (!db) return [];
  return unwrap(
    await db.from("categories").select("*").eq("kind", kind).eq("active", true).order("display_order").order("name"),
    [],
  );
}

export type ProductSort = "relevance" | "price_asc" | "price_desc" | "newest";

async function getProductsRaw(opts: {
  categorySlug?: string;
  /** Id da categoria já conhecido: evita a consulta extra para achar o slug. */
  categoryId?: string;
  q?: string;
  sort?: ProductSort;
  featured?: boolean;
  limit?: number;
} = {}): Promise<Product[]> {
  const db = createPublicClient();
  if (!db) return [];

  let categoryId: string | undefined = opts.categoryId;
  if (!categoryId && opts.categorySlug) {
    const cat = unwrap(
      await db.from("categories").select("id").eq("kind", "product").eq("slug", opts.categorySlug).eq("active", true).maybeSingle(),
      null,
    );
    if (!cat) return [];
    categoryId = (cat as { id: string }).id;
  }

  let query = db.from("products").select(PRODUCT_SELECT).eq("active", true);
  if (categoryId) query = query.eq("category_id", categoryId);
  if (opts.featured) query = query.eq("featured", true);
  if (opts.q?.trim()) query = query.ilike("name", `%${escapeLike(opts.q.trim().slice(0, 80))}%`);

  switch (opts.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true, nullsFirst: false });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false, nullsFirst: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("featured", { ascending: false }).order("created_at", { ascending: false });
  }
  if (opts.limit) query = query.limit(opts.limit);
  return unwrap(await query, []) as Product[];
}

async function getProductBySlugRaw(slug: string): Promise<(Product & { images: ProductImage[] }) | null> {
  const db = createPublicClient();
  if (!db) return null;
  // Produto, categoria e galeria em UMA consulta (antes eram duas, em sequência).
  const row = unwrap(
    await db.from("products").select(`${PRODUCT_SELECT}, images:product_images(*)`).eq("slug", slug).eq("active", true).maybeSingle(),
    null,
  ) as (Product & { images?: ProductImage[] }) | null;
  if (!row) return null;
  const images = [...(row.images ?? [])].sort((x, y) => x.display_order - y.display_order);
  return { ...row, images };
}

/** Mais procurados = mais cliques/pedidos recentes; completa com os destaques. */
async function getPopularProductsRaw(limit = 4): Promise<Product[]> {
  const db = createPublicClient();
  if (!db) return [];
  const ids = unwrap(await db.rpc("popular_products", { p_limit: limit }), [] as string[]) as string[];
  let popular: Product[] = [];
  if (ids.length) {
    const rows = unwrap(await db.from("products").select(PRODUCT_SELECT).in("id", ids).eq("active", true), []) as Product[];
    popular = ids.map((id) => rows.find((r) => r.id === id)).filter((p): p is Product => Boolean(p));
  }
  if (popular.length >= limit) return popular;
  const featured = await getProductsRaw({ featured: true, limit: limit * 2 });
  const seen = new Set(popular.map((p) => p.id));
  return [...popular, ...featured.filter((p) => !seen.has(p.id))].slice(0, limit);
}

async function getArtworksRaw(opts: { categorySlug?: string; q?: string; limit?: number } = {}): Promise<Artwork[]> {
  const db = createPublicClient();
  if (!db) return [];
  let query = db.from("artworks").select("*, category:categories(id, name, slug)").eq("active", true);
  if (opts.categorySlug) {
    const cat = unwrap(
      await db.from("categories").select("id").eq("kind", "artwork").eq("slug", opts.categorySlug).maybeSingle(),
      null,
    ) as { id: string } | null;
    if (!cat) return [];
    query = query.eq("category_id", cat.id);
  }
  if (opts.q?.trim()) query = query.ilike("name", `%${escapeLike(opts.q.trim().slice(0, 80))}%`);
  query = query.order("created_at", { ascending: false });
  if (opts.limit) query = query.limit(opts.limit);
  return unwrap(await query, []) as Artwork[];
}

async function getServicesRaw(): Promise<Service[]> {
  const db = createPublicClient();
  if (!db) return [];
  return unwrap(
    await db.from("services").select("*, category:categories(id, name, slug)").eq("active", true).order("created_at"),
    [],
  ) as Service[];
}


// ---------------------------------------------------------------------------
// Cache: as leituras públicas são iguais para todos os visitantes, então ficam guardadas
// por 60 s (em vez de consultar o Supabase a cada visita). O painel invalida a tag "site"
// ao salvar qualquer coisa, então as mudanças aparecem na hora.
// ---------------------------------------------------------------------------
export const SITE_CACHE_TAG = "site";
export const SITE_CACHE_SECONDS = 60;

function cached<A extends unknown[], R>(name: string, fn: (...args: A) => Promise<R>) {
  return unstable_cache(fn, ["site-data", name], { revalidate: SITE_CACHE_SECONDS, tags: [SITE_CACHE_TAG] });
}

export const getContent = cache(cached("content", getContentRaw));
export const getSettings = cache(cached("settings", getSettingsRaw));
export const getBanners = cached("banners", getBannersRaw);
export const getClients = cached("clients", getClientsRaw);
export const getCategories = cached("categories", getCategoriesRaw);
export const getProducts = cached("products", getProductsRaw);
export const getProductBySlug = cached("product-by-slug", getProductBySlugRaw);
export const getPopularProducts = cached("popular", getPopularProductsRaw);
export const getArtworks = cached("artworks", getArtworksRaw);
export const getServices = cached("services", getServicesRaw);
