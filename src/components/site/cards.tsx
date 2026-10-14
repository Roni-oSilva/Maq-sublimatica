import { Clock } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/misc";
import { buttonVariants } from "@/components/ui/button";
import type { Artwork, Product, Service } from "@/lib/types";
import { cn, formatPrice } from "@/lib/utils";
import { MediaImage } from "./media";
import { OrderButton } from "./whatsapp-buttons";

import type { SiteContent } from "@/lib/content";

export type Ctx = { whatsappNumber: string | null; storeName: string; t: SiteContent };

export function isProductAvailable(p: Pick<Product, "available" | "track_stock" | "stock_quantity">): boolean {
  return p.available && !(p.track_stock && (p.stock_quantity ?? 0) <= 0);
}

export function PriceTag({ price, onRequest, className }: { price: number | null; onRequest: boolean; className?: string }) {
  const unknown = onRequest || price === null;
  return (
    <p className={cn("font-display font-extrabold", unknown ? "text-base text-ink-muted" : "text-xl text-ink", className)}>
      {formatPrice(price, onRequest)}
    </p>
  );
}

export function ProductCard({ product, ctx }: { product: Product; ctx: Ctx }) {
  const available = isProductAvailable(product);
  const href = `/loja/${product.slug}`;
  return (
    <article data-reveal className="card-lift flex flex-col overflow-hidden rounded-3xl border border-line bg-white">
      <Link href={href} className="relative block aspect-square overflow-hidden bg-paper" aria-label={`Ver ${product.name}`}>
        <MediaImage src={product.image_url} alt={product.name} className="transition duration-700 hover:scale-110" />
        <div className="absolute left-3 top-3 flex flex-col gap-1.5">
          {product.featured && <Badge tone="brand">Destaque</Badge>}
          {!available && <Badge tone="warning">Consulte disponibilidade</Badge>}
        </div>
      </Link>
      <div className="flex flex-1 flex-col p-4">
        {product.category && <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{product.category.name}</p>}
        <h3 className="mt-1 line-clamp-2 min-h-[2.75rem] text-[17px]">
          <Link href={href} className="hover:text-brand-text">
            {product.name}
          </Link>
        </h3>
        <PriceTag price={product.price} onRequest={product.price_on_request} className="mt-2" />
        <div className="mt-4 grid gap-2">
          <OrderButton
            whatsappNumber={ctx.whatsappNumber}
            label={product.price_on_request || product.price === null ? ctx.t.product_quote_label : ctx.t.product_order_label}
            payload={{
              kind: "product",
              id: product.id,
              path: href,
              input: {
                storeName: ctx.storeName,
                intro: ctx.t.msg_product_intro,
                closing: ctx.t.msg_product_closing,
                name: product.name,
                categoryName: product.category?.name ?? null,
                price: product.price,
                priceOnRequest: product.price_on_request,
                specifications: product.specifications,
              },
            }}
          />
          <Link href={href} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
            {ctx.t.product_details_label}
          </Link>
        </div>
      </div>
    </article>
  );
}

export function ArtworkCard({ artwork, ctx }: { artwork: Artwork; ctx: Ctx }) {
  return (
    <article data-reveal className="card-lift flex flex-col overflow-hidden rounded-3xl border border-line bg-white">
      <div className="relative aspect-[4/5] overflow-hidden bg-paper">
        <MediaImage src={artwork.image_url} alt={artwork.name} />
        <Badge className="absolute left-3 top-3 bg-white/95 font-mono">Cód. {artwork.code}</Badge>
      </div>
      <div className="flex flex-1 flex-col p-4">
        {artwork.category && <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">{artwork.category.name}</p>}
        <h3 className="mt-1 text-[17px]">{artwork.name}</h3>
        {artwork.description && <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{artwork.description}</p>}
        <PriceTag price={artwork.price} onRequest={artwork.price_on_request} className="mt-2" />
        <OrderButton
          className="mt-4"
          whatsappNumber={ctx.whatsappNumber}
          label={ctx.t.artwork_order_label}
          payload={{
            kind: "artwork",
            id: artwork.id,
            input: {
              storeName: ctx.storeName,
              intro: ctx.t.msg_artwork_intro,
              closing: ctx.t.msg_artwork_closing,
              name: artwork.name,
              code: artwork.code,
              price: artwork.price,
              priceOnRequest: artwork.price_on_request,
            },
          }}
        />
      </div>
    </article>
  );
}

export function ServiceCard({ service, ctx }: { service: Service; ctx: Ctx }) {
  const specs = (service.specifications ?? "").split("\n").map((s) => s.trim()).filter(Boolean);
  return (
    <article data-reveal className="card-lift flex flex-col overflow-hidden rounded-3xl border border-line bg-white">
      <div className="relative aspect-[16/10] overflow-hidden bg-paper">
        <MediaImage src={service.image_url} alt={service.name} sizes="(min-width: 1024px) 33vw, 100vw" />
        {service.category && <Badge className="absolute left-3 top-3 bg-white/95">{service.category.name}</Badge>}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="text-xl">{service.name}</h3>
        {service.description && <p className="mt-2 text-sm leading-relaxed text-ink-muted">{service.description}</p>}
        {specs.length > 0 && (
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-soft">
            {specs.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        )}
        <div className="mt-auto pt-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase text-ink-muted">Valor</p>
              <PriceTag price={service.price} onRequest={service.price_on_request} />
            </div>
            {service.lead_time && (
              <p className="flex items-center gap-1.5 text-sm text-ink-muted">
                <Clock className="h-4 w-4" aria-hidden /> {service.lead_time}
              </p>
            )}
          </div>
          <OrderButton
            className="mt-4 w-full"
            whatsappNumber={ctx.whatsappNumber}
            label={ctx.t.service_order_label}
            payload={{
              kind: "service",
              id: service.id,
              input: {
                storeName: ctx.storeName,
                intro: ctx.t.msg_service_intro,
                closing: ctx.t.msg_service_closing,
                name: service.name,
                price: service.price,
                priceOnRequest: service.price_on_request,
                leadTime: service.lead_time,
              },
            }}
          />
        </div>
      </div>
    </article>
  );
}

/** Destaca a última palavra do título em itálico laranja. */
export function AccentTitle({ text, onDark }: { text: string; onDark?: boolean }) {
  const words = text.trim().split(" ");
  if (words.length < 2) return <>{text}</>;
  const last = words.pop();
  return (
    <>
      {words.join(" ")} <span className={onDark ? "accent-on-dark" : "accent"}>{last}</span>
    </>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  href,
  hrefLabel = "Ver todos",
}: {
  eyebrow?: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div data-reveal="left" className="mb-8 flex flex-wrap items-end justify-between gap-3">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h2 className="section-title mt-2"><AccentTitle text={title} /></h2>
      </div>
      {href && (
        <Link href={href} className="link-draw pb-0.5 text-sm font-bold text-brand-text">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}

export function PageHero({ eyebrow, title, image, children }: { eyebrow: string; title: string; image?: string | null; children?: React.ReactNode }) {
  return (
    <section className="grain relative overflow-hidden rounded-b-[2.5rem] bg-ink text-white">
      {image && (
        <>
          <div className="absolute inset-0" aria-hidden><MediaImage src={image} alt="" sizes="100vw" priority /></div>
          <div className="absolute inset-0 bg-ink/75" aria-hidden />
        </>
      )}
      <div className="pointer-events-none absolute inset-y-0 right-0 hidden w-1/3 skew-x-[-14deg] translate-x-16 bg-brand sm:block" aria-hidden />
      <div className="pointer-events-none absolute bottom-0 right-[30%] hidden h-3 w-24 bg-lime sm:block" aria-hidden />
      <div className="container relative py-12 sm:py-16 animate-fade-up">
        <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.22em] text-lime"><span className="h-[3px] w-7 rounded-full bg-lime" aria-hidden />{eyebrow}</p>
        <h1 className="mt-3 max-w-3xl text-5xl text-cream sm:text-7xl"><AccentTitle text={title} onDark /></h1>
        {children && <div className="mt-4 max-w-xl text-white/75 sm:max-w-2xl">{children}</div>}
      </div>
    </section>
  );
}
