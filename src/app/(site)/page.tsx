import { ArrowRight, BadgePercent, Brush, Clock, Coffee, Frame, Layers, MessageCircle, PackageCheck, Palette, Printer, Shirt, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { AccentTitle, ArtworkCard, ProductCard, SectionHeader, ServiceCard } from "@/components/site/cards";
import { Chevrons } from "@/components/site/logo";
import { Parallax } from "@/components/site/motion";
import { MediaImage } from "@/components/site/media";
import { WhatsAppLink } from "@/components/site/whatsapp-buttons";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { getArtworks, getBanners, getCategories, getClients, getContent, getPopularProducts, getProducts, getServices, getSettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import { cn } from "@/lib/utils";

export const revalidate = 60;

const CATEGORY_ICONS = [Printer, Layers, Sparkles, Palette, Brush, PackageCheck];

export default async function HomePage() {
  const [settings, c, banners, categories, popular, newest, artworks, services, clients] = await Promise.all([
    getSettings(),
    getContent(),
    getBanners(),
    getCategories("product"),
    getPopularProducts(4),
    getProducts({ sort: "newest", limit: 4 }),
    getArtworks({ limit: 4 }),
    getServices(),
    getClients(),
  ]);
  const ctx = { whatsappNumber: settings.whatsapp_number, storeName: settings.store_name, t: c };
  const hero = banners.find((b) => b.placement === "hero");
  const promos = banners.filter((b) => b.placement === "promo");
  const BENEFITS = [
    { icon: Store, title: c.benefit1_title, text: c.benefit1_text },
    { icon: BadgePercent, title: c.benefit2_title, text: c.benefit2_text },
    { icon: Clock, title: c.benefit3_title, text: c.benefit3_text },
    { icon: MessageCircle, title: c.benefit4_title, text: c.benefit4_text },
  ];
  const empty = !popular.length && !newest.length && !artworks.length && !services.length;

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute -right-32 top-0 hidden h-full w-1/2 skew-x-[-12deg] bg-gradient-to-b from-brand/25 to-transparent lg:block" aria-hidden />
        <div className="orb -left-24 top-10 h-72 w-72 bg-brand/30" aria-hidden />
        <div className="orb bottom-0 left-1/3 h-60 w-60 bg-lime/15 [animation-delay:-6s]" aria-hidden />
        <div className="container relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div>
            <p className="pop inline-flex items-center gap-2 rounded-full bg-lime px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-ink" style={{ "--i": 0 } as React.CSSProperties}>
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> {c.hero_eyebrow}
            </p>
            {hero ? (
              <h1 className="mt-5 text-[clamp(3rem,8.5vw,6.25rem)] leading-[0.95] text-cream">
                <span className="line"><span className="text-brand italic" style={{ "--i": 1 } as React.CSSProperties}>{hero.title.split(" ")[0]}</span></span>
                <span className="line"><span style={{ "--i": 2 } as React.CSSProperties}>{hero.title.split(" ").slice(1).join(" ")}</span></span>
              </h1>
            ) : (
              <h1 className="mt-5 text-[clamp(3rem,8.5vw,6.25rem)] leading-[0.95] text-cream">
                <span className="line"><span className="text-brand italic" style={{ "--i": 1 } as React.CSSProperties}>{c.hero_line1}</span></span>
                <span className="line">
                  <span style={{ "--i": 2 } as React.CSSProperties}>
                    {c.hero_line2} <span className="font-script text-[1.15em] normal-case text-lime">{c.hero_script}</span>
                  </span>
                </span>
                <span className="line"><span style={{ "--i": 3 } as React.CSSProperties}>{c.hero_line3}</span></span>
              </h1>
            )}
            <p className="rise mt-6 max-w-xl text-lg text-white/75" style={{ "--i": 4 } as React.CSSProperties}>
              {hero?.subtitle ?? c.hero_subtitle}
            </p>
            <div className="rise mt-8 flex flex-wrap gap-3" style={{ "--i": 5 } as React.CSSProperties}>
              <Link
                href={hero?.cta_href ?? c.hero_cta_href}
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                {...(hero?.cta_href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {hero?.cta_label ?? c.hero_cta_label} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" aria-hidden />
              </Link>
              <Link href={c.hero_cta2_href} className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-cream/40 bg-transparent text-cream hover:bg-cream/10")}>
                {c.hero_cta2_label}
              </Link>
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-md md:block lg:max-w-none" aria-hidden={!(hero?.image_url || c.hero_image)}>
            {hero?.image_url || c.hero_image ? (
              <div className="relative aspect-square overflow-hidden rounded-[2rem] border-2 border-cream/20">
                <MediaImage src={hero?.image_url ?? c.hero_image} alt={hero?.title ?? c.hero_line1} sizes="480px" priority />
              </div>
            ) : (
              <Parallax className="grid aspect-square grid-cols-2 grid-rows-[1fr_auto_1fr] gap-4">
                <div data-depth="1.2" className="pop" style={{ "--i": 2 } as React.CSSProperties}>
                  <div className="float-a flex h-full items-center justify-center rounded-[2rem] bg-brand transition hover:rotate-3 hover:scale-105"><Coffee className="h-24 w-24 text-ink" strokeWidth={1.5} /></div>
                </div>
                <div data-depth="0.7" className="pop" style={{ "--i": 3 } as React.CSSProperties}>
                  <div className="float-b flex h-full items-center justify-center rounded-[2rem] bg-cream transition hover:-rotate-3 hover:scale-105"><Shirt className="h-24 w-24 text-ink" strokeWidth={1.5} /></div>
                </div>
                <div data-depth="0.9" className="pop col-span-2" style={{ "--i": 4 } as React.CSSProperties}>
                  <div className="group flex items-center justify-between rounded-full bg-lime px-7 py-3 text-ink">
                    <span className="font-display text-2xl uppercase">{c.hero_tile_strip}</span>
                    <Chevrons className="h-7 w-auto text-ink transition-transform duration-300 group-hover:translate-x-2" />
                  </div>
                </div>
                <div data-depth="0.5" className="pop" style={{ "--i": 5 } as React.CSSProperties}>
                  <div className="float-c flex h-full items-center justify-center rounded-[2rem] border-2 border-cream/40 transition hover:rotate-3 hover:scale-105"><Frame className="h-24 w-24 text-cream" strokeWidth={1.5} /></div>
                </div>
                <div data-depth="1.5" className="pop" style={{ "--i": 6 } as React.CSSProperties}>
                  <div className="float-a flex h-full items-center justify-center rounded-[2rem] bg-brand/90 transition hover:-rotate-3 hover:scale-105"><span className="font-script text-5xl text-ink">{c.hero_tile_script}</span></div>
                </div>
              </Parallax>
            )}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="border-b border-line bg-white" aria-label="Diferenciais">
        <ul className="container grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} data-reveal="scale" className="group flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-lime transition group-hover:animate-wiggle group-hover:bg-brand group-hover:text-ink">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h3 className="text-[15px]">{title}</h3>
                <p className="mt-0.5 text-sm text-ink-muted">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {!isSupabaseConfigured() && (
        <div className="container mt-10">
          <EmptyState title="Banco de dados não configurado">
            Defina as variáveis <code>NEXT_PUBLIC_SUPABASE_URL</code> e <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> (veja o README).
          </EmptyState>
        </div>
      )}

      {promos.length > 0 && (
        <section className="container mt-12" aria-label="Promoções">
          <div className="grid gap-5 md:grid-cols-2">
            {promos.map((b, i) => {
              const dark = i % 2 === 1;
              return (
                <Link
                  key={b.id}
                  href={b.cta_href ?? "/loja"}
                  data-reveal="scale"
                  {...(b.cta_href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={cn(
                    "card-lift group relative flex min-h-[260px] flex-col justify-end overflow-hidden rounded-[2rem] p-7 sm:p-9",
                    dark ? "bg-ink text-cream" : "bg-brand text-ink",
                  )}
                >
                  {b.image_url ? (
                    <>
                      <MediaImage src={b.image_url} alt="" className="transition duration-700 group-hover:scale-110" sizes="(min-width: 768px) 50vw, 100vw" />
                      <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/40 to-transparent" aria-hidden />
                    </>
                  ) : (
                    <>
                      <div className={cn("float-b absolute -right-10 -top-10 h-52 w-52 rounded-full", dark ? "bg-brand" : "bg-cream/70")} aria-hidden />
                      <div className={cn("float-c absolute right-24 top-24 h-16 w-16 rounded-2xl", dark ? "bg-lime" : "bg-ink")} aria-hidden />
                      <Chevrons className="absolute right-7 top-7 h-9 w-auto text-ink transition-transform duration-300 group-hover:translate-x-2" />
                    </>
                  )}
                  <div className={cn("relative z-10", b.image_url && "text-white")}>
                    <h3 className="max-w-md font-display text-4xl font-normal uppercase leading-[0.98] tracking-tight sm:text-5xl">{b.title}</h3>
                    {b.subtitle && <p className="mt-3 max-w-sm text-base font-medium opacity-90">{b.subtitle}</p>}
                    <span className={cn("mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold transition group-hover:gap-3", dark && !b.image_url ? "bg-lime text-ink" : "bg-ink text-white")}>
                      {b.cta_label ?? "Saiba mais"} <ArrowRight className="h-4 w-4" aria-hidden />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section data-reveal className="container mt-16">
          <SectionHeader eyebrow={c.cat_eyebrow} title={c.cat_title} href="/loja" hrefLabel={c.cat_link} />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.slice(0, 10).map((c, i) => {
              const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
              return (
                <li key={c.id} data-reveal>
                  <Link
                    href={`/loja?categoria=${c.slug}`}
                    className="card-lift group flex h-full items-center gap-3 rounded-3xl border border-line bg-white p-4"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand-text">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <span className="text-sm font-bold leading-tight">{c.name}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {popular.length > 0 && (
        <section data-reveal className="container mt-16">
          <SectionHeader eyebrow={c.popular_eyebrow} title={c.popular_title} href="/loja" hrefLabel={c.see_all} />
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} ctx={ctx} />
            ))}
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section data-reveal className="container mt-16">
          <SectionHeader eyebrow={c.newest_eyebrow} title={c.newest_title} href="/loja?ordem=newest" hrefLabel={c.see_all} />
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} ctx={ctx} />
            ))}
          </div>
        </section>
      )}

      {artworks.length > 0 && (
        <section data-reveal className="container mt-16">
          <SectionHeader eyebrow={c.artworks_eyebrow} title={c.artworks_title} href="/artes-prontas" hrefLabel={c.see_all} />
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {artworks.map((a) => (
              <ArtworkCard key={a.id} artwork={a} ctx={ctx} />
            ))}
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section data-reveal className="container mt-16">
          <SectionHeader eyebrow={c.services_eyebrow} title={c.services_title} href="/servicos" hrefLabel={c.see_all} />
          <div className="grid gap-5 md:grid-cols-3">
            {services.slice(0, 3).map((s) => (
              <ServiceCard key={s.id} service={s} ctx={ctx} />
            ))}
          </div>
        </section>
      )}

      {empty && isSupabaseConfigured() && (
        <div className="container mt-12">
          <EmptyState title={c.home_empty_title}>{c.home_empty_text}</EmptyState>
        </div>
      )}

      {clients.length > 0 && (
        <section className="mt-20" aria-label="Nossos clientes">
          <div className="container">
            <SectionHeader eyebrow={c.clients_eyebrow} title={c.clients_title} />
          </div>
          <div className="marquee-pause overflow-hidden py-2 [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]">
            {(() => {
              const reps = Math.max(1, Math.ceil(8 / clients.length));
              const track = Array.from({ length: reps }, () => clients).flat();
              return (
                <div className="flex w-max animate-marquee gap-4" style={{ animationDuration: `${Math.max(track.length * 4, 24)}s` }}>
                  {[0, 1].map((copy) => (
                    <ul key={copy} className="flex gap-4" aria-hidden={copy === 1}>
                      {track.map((c, i) => (
                        <li key={`${copy}-${i}`} className="group flex h-28 w-56 shrink-0 items-center justify-center rounded-3xl border border-line bg-white px-4 transition duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg sm:h-32 sm:w-72">
                          {c.logo_url ? (
                            <span className="relative block h-full w-full">
                              <MediaImage src={c.logo_url} alt={copy === 0 ? c.name : ""} fit="contain" sizes="240px" className="p-5 opacity-80 transition duration-300 group-hover:scale-105 group-hover:opacity-100" />
                            </span>
                          ) : (
                            <span className="text-center font-display text-2xl uppercase leading-none text-ink-muted transition group-hover:text-ink">{c.name}</span>
                          )}
                        </li>
                      ))}
                    </ul>
                  ))}
                </div>
              );
            })()}
          </div>
        </section>
      )}

      {/* CTA final */}
      <section className="container mt-20">
        <div data-reveal="scale" className="grain relative overflow-hidden rounded-[2.5rem] bg-brand p-8 text-ink sm:p-12">
          <Chevrons className="float-b absolute -right-4 top-6 hidden h-32 w-auto text-ink opacity-20 sm:block" />
          <h2 className="max-w-2xl text-5xl sm:text-7xl"><AccentTitle text={c.cta_title} onDark /></h2>
          <p className="mt-4 max-w-xl text-lg font-medium">{c.cta_text}</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={c.cta_btn1_href} className={cn(buttonVariants({ variant: "dark", size: "lg" }))}>
              {c.cta_btn1_label}
            </Link>
            <WhatsAppLink number={settings.whatsapp_number} message={settings.default_whatsapp_message} size="lg" label="Chamada final da página inicial">
              {c.cta_btn2_label}
            </WhatsAppLink>
          </div>
        </div>
      </section>
    </>
  );
}
