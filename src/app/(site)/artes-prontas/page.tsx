import type { Metadata } from "next";
import Link from "next/link";
import { ArtworkCard, PageHero } from "@/components/site/cards";
import { EmptyState } from "@/components/ui/misc";
import { getArtworks, getCategories, getContent, getSettings } from "@/lib/data";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return { title: c.nav_artworks, description: c.artworks_page_subtitle.slice(0, 160), alternates: { canonical: "/artes-prontas" } };
}

export default async function ArtworksPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [settings, c, categories, artworks] = await Promise.all([
    getSettings(),
    getContent(),
    getCategories("artwork"),
    getArtworks({ categorySlug: categoria }),
  ]);
  const ctx = { whatsappNumber: settings.whatsapp_number, storeName: settings.store_name, t: c };
  return (
    <>
      <PageHero eyebrow={c.artworks_page_eyebrow} title={c.artworks_page_title} image={c.artworks_page_header_image || null}>
        {c.artworks_page_subtitle}
      </PageHero>
      <div className="container mt-8">
        {categories.length > 0 && (
          <nav aria-label="Categorias de artes" className="flex gap-2 overflow-x-auto pb-1">
            <Link href="/artes-prontas" className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", !categoria ? "border-ink bg-ink text-white" : "border-line bg-white")}>
              {c.shop_all}
            </Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/artes-prontas?categoria=${c.slug}`} className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", categoria === c.slug ? "border-ink bg-ink text-white" : "border-line bg-white")}>
                {c.name}
              </Link>
            ))}
          </nav>
        )}
        {artworks.length === 0 ? (
          <div className="mt-6">
            <EmptyState title={c.artworks_empty_title}>
              <Link href="/personalizar" className="font-semibold text-brand-text underline">{c.artworks_empty_text}</Link>
            </EmptyState>
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {artworks.map((a) => (
              <ArtworkCard key={a.id} artwork={a} ctx={ctx} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
