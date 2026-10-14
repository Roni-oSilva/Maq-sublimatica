import type { Metadata } from "next";
import Link from "next/link";
import { ArtworkCard, PageHero } from "@/components/site/cards";
import { EmptyState } from "@/components/ui/misc";
import { getArtworks, getCategories, getSettings } from "@/lib/data";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Artes Prontas",
  description: "Galeria de artes prontas para sublimação e personalização. Escolha e fale com a gente pelo WhatsApp.",
  alternates: { canonical: "/artes-prontas" },
};

export default async function ArtworksPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const { categoria } = await searchParams;
  const [settings, categories, artworks] = await Promise.all([
    getSettings(),
    getCategories("artwork"),
    getArtworks({ categorySlug: categoria }),
  ]);
  const ctx = { whatsappNumber: settings.whatsapp_number, storeName: settings.store_name };
  return (
    <>
      <PageHero eyebrow="Artes prontas" title="Artes disponíveis para personalização ou aquisição">
        Encontrou uma arte? Informe o código pelo WhatsApp e combine formato de arquivo e personalização.
      </PageHero>
      <div className="container mt-8">
        {categories.length > 0 && (
          <nav aria-label="Categorias de artes" className="flex gap-2 overflow-x-auto pb-1">
            <Link href="/artes-prontas" className={cn("shrink-0 rounded-full border px-4 py-2 text-sm font-semibold", !categoria ? "border-ink bg-ink text-white" : "border-line bg-white")}>
              Todas
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
            <EmptyState title="Nenhuma arte disponível no momento">
              Precisa de uma arte exclusiva? <Link href="/personalizar" className="font-semibold text-brand-text underline">Peça um orçamento</Link>.
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
