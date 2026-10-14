import { ChevronRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { isProductAvailable, PriceTag, ProductCard, SectionHeader } from "@/components/site/cards";
import { Gallery } from "@/components/site/gallery";
import { OrderButton } from "@/components/site/whatsapp-buttons";
import { Badge } from "@/components/ui/misc";
import { getProductBySlug, getProducts, getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";

export const revalidate = 60;

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado" };
  const description = (product.description ?? `${product.name} — peça pelo WhatsApp.`).slice(0, 160);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/loja/${product.slug}` },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: `/loja/${product.slug}`,
      images: product.image_url ? [{ url: product.image_url }] : undefined,
    },
  };
}

function parseSpecs(text: string | null): { label?: string; value: string }[] {
  return (text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const i = l.indexOf(":");
      return i > 0 && i < 40 ? { label: l.slice(0, i).trim(), value: l.slice(i + 1).trim() } : { value: l };
    });
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const related = product.category_id
    ? (await getProducts({ categorySlug: product.category?.slug, limit: 5 })).filter((p) => p.id !== product.id).slice(0, 4)
    : [];
  const ctx = { whatsappNumber: settings.whatsapp_number, storeName: settings.store_name };
  const available = isProductAvailable(product);
  const specs = parseSpecs(product.specifications);
  const images = [product.image_url, ...product.images.map((i) => i.image_url)].filter((u): u is string => Boolean(u));
  const path = `/loja/${product.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description ?? undefined,
    image: images,
    sku: product.id,
    url: `${siteUrl()}${path}`,
    ...(product.price !== null && !product.price_on_request
      ? {
          offers: {
            "@type": "Offer",
            priceCurrency: "BRL",
            price: product.price,
            availability: available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
            url: `${siteUrl()}${path}`,
          },
        }
      : {}),
  };

  return (
    <div className="container py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <nav aria-label="Trilha" className="mb-6 flex flex-wrap items-center gap-1 text-sm text-ink-muted">
        <Link href="/loja" className="hover:text-brand-text">Loja</Link>
        {product.category && (
          <>
            <ChevronRight className="h-4 w-4" aria-hidden />
            <Link href={`/loja?categoria=${product.category.slug}`} className="hover:text-brand-text">{product.category.name}</Link>
          </>
        )}
        <ChevronRight className="h-4 w-4" aria-hidden />
        <span className="font-semibold text-ink">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2">
        <Gallery images={images} alt={product.name} />
        <div>
          <div className="flex flex-wrap gap-2">
            {product.featured && <Badge tone="brand">Destaque</Badge>}
            <Badge tone={available ? "success" : "warning"}>{available ? "Disponível" : "Consulte a disponibilidade"}</Badge>
            {product.track_stock && available && (product.stock_quantity ?? 0) <= product.low_stock_threshold && (
              <Badge tone="warning">Poucas unidades</Badge>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold sm:text-4xl">{product.name}</h1>
          {product.category && <p className="mt-1 text-sm font-semibold text-ink-muted">{product.category.name}</p>}
          <PriceTag price={product.price} onRequest={product.price_on_request} className="mt-5 !text-3xl" />
          {(product.price_on_request || product.price === null) && (
            <p className="mt-1 text-sm text-ink-muted">Valor informado mediante consulta pelo WhatsApp.</p>
          )}

          <OrderButton
            className="mt-6 w-full sm:w-auto"
            size="lg"
            whatsappNumber={ctx.whatsappNumber}
            label={product.price_on_request || product.price === null ? "Solicitar valor pelo WhatsApp" : "Pedir pelo WhatsApp"}
            payload={{
              kind: "product",
              id: product.id,
              path,
              input: {
                storeName: ctx.storeName,
                name: product.name,
                categoryName: product.category?.name ?? null,
                price: product.price,
                priceOnRequest: product.price_on_request,
                specifications: product.specifications,
              },
            }}
          />
          <p className="mt-3 text-xs text-ink-muted">
            O WhatsApp abrirá com a mensagem pronta. Você confirma o envio por lá; disponibilidade, pagamento e frete são combinados na conversa.
          </p>

          {product.description && (
            <section className="mt-8">
              <h2 className="text-lg font-bold">Descrição</h2>
              <p className="mt-2 whitespace-pre-line leading-relaxed text-ink-soft">{product.description}</p>
            </section>
          )}
          {specs.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold">Especificações técnicas</h2>
              <dl className="mt-3 divide-y divide-line overflow-hidden rounded-xl border border-line bg-white text-sm">
                {specs.map((s, i) => (
                  <div key={i} className="grid grid-cols-[minmax(0,40%)_1fr] gap-3 px-4 py-2.5">
                    <dt className="font-semibold">{s.label ?? "•"}</dt>
                    <dd className="text-ink-soft">{s.value}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>

      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeader title="Produtos relacionados" href="/loja" />
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} ctx={ctx} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
