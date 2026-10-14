import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const products = await getProducts({ sort: "newest" }).catch(() => []);
  const pages = ["", "/loja", "/artes-prontas", "/servicos", "/personalizar", "/sobre", "/politicas"];
  return [
    ...pages.map((p) => ({ url: `${base}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.7 })),
    ...products.map((p) => ({ url: `${base}/loja/${p.slug}`, lastModified: p.updated_at, changeFrequency: "weekly" as const, priority: 0.6 })),
  ];
}
