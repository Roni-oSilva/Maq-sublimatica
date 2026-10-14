import { Search } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, ProductCard } from "@/components/site/cards";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/misc";
import { getCategories, getContent, getProducts, getSettings, type ProductSort } from "@/lib/data";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return { title: c.shop_title, description: c.shop_subtitle.slice(0, 160), alternates: { canonical: "/loja" } };
}

const SORTS: { value: ProductSort; label: string }[] = [
  { value: "relevance", label: "Relevância" },
  { value: "newest", label: "Mais recentes" },
  { value: "price_asc", label: "Menor preço" },
  { value: "price_desc", label: "Maior preço" },
];

type SP = Promise<{ categoria?: string; q?: string; ordem?: string }>;

export default async function ShopPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const sort = SORTS.some((s) => s.value === sp.ordem) ? (sp.ordem as ProductSort) : "relevance";
  const [settings, c, categories, products] = await Promise.all([
    getSettings(),
    getContent(),
    getCategories("product"),
    getProducts({ categorySlug: sp.categoria, q: sp.q, sort }),
  ]);
  const ctx = { whatsappNumber: settings.whatsapp_number, storeName: settings.store_name, t: c };
  const qs = (cat?: string) => {
    const p = new URLSearchParams();
    if (cat) p.set("categoria", cat);
    if (sp.q) p.set("q", sp.q);
    if (sort !== "relevance") p.set("ordem", sort);
    const s = p.toString();
    return `/loja${s ? `?${s}` : ""}`;
  };
  const filtered = Boolean(sp.q || sp.categoria);

  return (
    <>
      <PageHero eyebrow={c.shop_eyebrow} title={c.shop_title} image={c.shop_header_image || null}>
        {c.shop_subtitle}
      </PageHero>

      <div className="container mt-8">
        <form method="get" action="/loja" role="search" className="grid gap-3 rounded-3xl border border-line bg-white p-4 sm:grid-cols-[1fr_auto_auto] sm:items-end">
          {sp.categoria && <input type="hidden" name="categoria" value={sp.categoria} />}
          <div>
            <label htmlFor="q" className="mb-1.5 block text-sm font-semibold">{c.shop_search_label}</label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden />
              <Input id="q" name="q" defaultValue={sp.q ?? ""} placeholder={c.shop_search_placeholder} className="pl-10" maxLength={80} />
            </div>
          </div>
          <div>
            <label htmlFor="ordem" className="mb-1.5 block text-sm font-semibold">{c.shop_sort_label}</label>
            <Select id="ordem" name="ordem" defaultValue={sort}>
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
          </div>
          <Button type="submit" variant="dark">{c.shop_apply}</Button>
        </form>

        {categories.length > 0 && (
          <nav aria-label="Categorias" className="mt-4 flex gap-2 overflow-x-auto pb-1">
            <Link href={qs()} aria-current={!sp.categoria ? "true" : undefined} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", !sp.categoria ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}>
              {c.shop_all}
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={qs(c.slug)} aria-current={sp.categoria === c.slug ? "true" : undefined} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", sp.categoria === c.slug ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink/40")}>
                {c.name}
              </Link>
            ))}
          </nav>
        )}

        <p className="mt-6 text-sm text-ink-muted" aria-live="polite">
          {products.length} {products.length === 1 ? "produto encontrado" : "produtos encontrados"}
        </p>

        {products.length === 0 ? (
          <div className="mt-4">
            <EmptyState title={filtered ? "Nenhum produto encontrado" : c.shop_empty_title}>
              {filtered ? (
                <>Tente outra busca ou <Link href="/loja" className="font-semibold text-brand-text underline">limpe os filtros</Link>.</>
              ) : (
                c.shop_empty_text
              )}
            </EmptyState>
          </div>
        ) : (
          <div className="mt-4 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} ctx={ctx} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
