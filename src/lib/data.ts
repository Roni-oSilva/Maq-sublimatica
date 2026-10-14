import { createPublicClient } from "./supabase/public";
import { escapeLike } from "./utils";
import {
  DEFAULT_SETTINGS,
  type Artwork,
  type Banner,
  type Category,
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

export async function getSettings(): Promise<StoreSettings> {
  const db = createPublicClient();
  if (!db) return DEFAULT_SETTINGS;
  const res = await db.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const row = unwrap(res, null);
  return row ? ({ ...DEFAULT_SETTINGS, ...row } as StoreSettings) : DEFAULT_SETTINGS;
}

export async function getBanners(): Promise<Banner[]> {
  const db = createPublicClient();
  if (!db) return [];
  return unwrap(await db.from("banners").select("*").eq("active", true).order("display_order").order("created_at"), []);
}

export async function getCategories(kind: CategoryKind = "product"): Promise<Category[]> {
  const db = createPublicClient();
  if (!db) return [];
  return unwrap(
    await db.from("categories").select("*").eq("kind", kind).eq("active", true).order("display_order").order("name"),
    [],
  );
}

export type ProductSort = "relevance" | "price_asc" | "price_desc" | "newest";

export async function getProducts(opts: {
  categorySlug?: string;
  q?: string;
  sort?: ProductSort;
  featured?: boolean;
  limit?: number;
} = {}): Promise<Product[]> {
  const db = createPublicClient();
  if (!db) return [];

  let categoryId: string | undefined;
  if (opts.categorySlug) {
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

export async function getProductBySlug(slug: string): Promise<(Product & { images: ProductImage[] }) | null> {
  const db = createPublicClient();
  if (!db) return null;
  const product = unwrap(
    await db.from("products").select(PRODUCT_SELECT).eq("slug", slug).eq("active", true).maybeSingle(),
    null,
  ) as Product | null;
  if (!product) return null;
  const images = unwrap(
    await db.from("product_images").select("*").eq("product_id", product.id).order("display_order"),
    [],
  ) as ProductImage[];
  return { ...product, images };
}

/** Mais procurados = mais cliques/pedidos recentes; completa com os destaques. */
export async function getPopularProducts(limit = 4): Promise<Product[]> {
  const db = createPublicClient();
  if (!db) return [];
  const ids = unwrap(await db.rpc("popular_products", { p_limit: limit }), [] as string[]) as string[];
  let popular: Product[] = [];
  if (ids.length) {
    const rows = unwrap(await db.from("products").select(PRODUCT_SELECT).in("id", ids).eq("active", true), []) as Product[];
    popular = ids.map((id) => rows.find((r) => r.id === id)).filter((p): p is Product => Boolean(p));
  }
  if (popular.length >= limit) return popular;
  const featured = await getProducts({ featured: true, limit: limit * 2 });
  const seen = new Set(popular.map((p) => p.id));
  return [...popular, ...featured.filter((p) => !seen.has(p.id))].slice(0, limit);
}

export async function getArtworks(opts: { categorySlug?: string; q?: string; limit?: number } = {}): Promise<Artwork[]> {
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

export async function getServices(): Promise<Service[]> {
  const db = createPublicClient();
  if (!db) return [];
  return unwrap(
    await db.from("services").select("*, category:categories(id, name, slug)").eq("active", true).order("created_at"),
    [],
  ) as Service[];
}
