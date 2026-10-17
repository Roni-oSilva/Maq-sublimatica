import { ArrowRight, ArrowUpRight, BadgePercent, Brush, Clock, Coffee, Frame, Layers, MessageCircle, PackageCheck, Palette, Printer, Shirt, Sparkles, Store } from "lucide-react";
import Link from "next/link";
import { AccentTitle, ArtworkCard, ProductCard, SectionHeader, ServiceCard } from "@/components/site/cards";
import { Chevrons } from "@/components/site/logo";
import { HeroMug } from "@/components/site/hero-mug";
import { MediaImage } from "@/components/site/media";
import { WhatsAppLink } from "@/components/site/whatsapp-buttons";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { fill } from "@/lib/content";
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
  const heroImage = hero?.image_url ?? (c.hero_image || null);
  const wordmark = (c.hero_wordmark || settings.store_name).toUpperCase().split(" ");
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
      {/* Hero: cartão claro com o menu flutuante, nome gigante e produto sobreposto */}
      <section className="mx-3 sm:mx-5" aria-label="Destaque">
        <div className="relative mx-auto max-w-[1280px] overflow-hidden rounded-[2rem] border border-white bg-gradient-to-b from-white via-paper to-paper-2 pb-8 pt-48 shadow-[0_30px_70px_-45px_rgba(23,23,23,0.45)] sm:rounded-[2.75rem] sm:pb-10 sm:pt-52 lg:pb-0">
          {/* curvas suaves de fundo */}
          <div className="pointer-events-none absolute -left-40 top-1/3 h-[34rem] w-[60rem] rounded-[50%] border border-ink/[0.05]" aria-hidden />
          <div className="pointer-events-none absolute -right-52 top-1/4 h-[40rem] w-[56rem] rounded-[50%] border border-ink/[0.05]" aria-hidden />

          <div className="relative z-10 px-4 text-center sm:px-8">
            <p className="rise text-base text-ink-soft sm:text-xl" style={{ "--i": 0 } as React.CSSProperties}>
              {hero?.title ?? c.hero_tagline}
            </p>
            <h1
              className="rise mt-3 whitespace-nowrap text-[clamp(1.2rem,7.6vw,3rem)] leading-[1.05] text-ink sm:text-[clamp(2.4rem,8.6vw,4.6rem)] lg:text-[min(5.7vw,5.6rem)]"
              style={{ "--i": 1 } as React.CSSProperties}
            >
              {wordmark.length > 1 ? (
                <>
                  <span className="block text-brand lg:inline">{wordmark[0]}</span> <span className="block lg:inline">{wordmark.slice(1).join(" ")}</span>
                </>
              ) : (
                wordmark[0]
              )}
            </h1>
          </div>

          {/* produto sobreposto ao nome (com brilho laranja atrás) */}
          <div className="pointer-events-none absolute left-1/2 top-[44%] h-[26rem] w-[26rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--c-brand)/0.28),transparent)] sm:h-[34rem] sm:w-[34rem] lg:top-[40%]" aria-hidden />
          <div className="pop relative z-20 mx-auto -mt-2 w-[82%] max-w-[560px] sm:-mt-6 lg:-mt-14" style={{ "--i": 3 } as React.CSSProperties}>
            {heroImage ? (
              <div className="relative aspect-[4/3]">
                <MediaImage src={heroImage} alt={hero?.title ?? settings.store_name} fit="contain" sizes="(min-width: 1024px) 560px, 80vw" priority />
              </div>
            ) : (
              <HeroMug className="float-a h-auto w-full drop-shadow-[0_30px_30px_rgba(23,23,23,0.18)]" />
            )}
          </div>

          {/* rodapé do cartão: texto + botão (esquerda) | categorias + link (direita) */}
          <div className="relative z-30 mx-auto mt-4 grid max-w-[1180px] gap-8 px-6 sm:px-10 lg:absolute lg:inset-x-0 lg:bottom-12 lg:mt-0 lg:grid-cols-2 lg:items-end lg:gap-0 lg:px-14">
            <div className="rise mx-auto max-w-xs text-center lg:mx-0 lg:text-left" style={{ "--i": 4 } as React.CSSProperties}>
              <p className="text-sm leading-relaxed text-ink-soft">{hero?.subtitle ?? c.hero_subtitle}</p>
              <Link
                href={hero?.cta_href ?? c.hero_cta_href}
                {...(hero?.cta_href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="shine group relative mt-4 inline-flex h-12 items-center gap-3 overflow-hidden rounded-full bg-brand py-1.5 pl-6 pr-1.5 text-sm font-bold text-ink transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/30"
              >
                {hero?.cta_label ?? c.hero_cta_label}
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:rotate-45">
                  <ArrowUpRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            </div>

            <div className="rise flex flex-col items-center gap-3 lg:items-end" style={{ "--i": 5 } as React.CSSProperties}>
              {categories.length > 0 && (
                <ul className="flex flex-wrap justify-center gap-2 lg:max-w-[16rem] lg:justify-end">
                  {categories.slice(0, 3).map((cat, i) => (
                    <li key={cat.id}>
                      <Link
                        href={`/loja?categoria=${cat.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-ink/25 bg-white/60 px-3.5 py-1.5 text-xs font-medium text-ink transition hover:-translate-y-0.5 hover:border-ink hover:bg-white"
                      >
                        {i === 0 ? <Store className="h-3.5 w-3.5 text-brand-text" aria-hidden /> : <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />}
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
              <Link href={c.hero_cta2_href} className="link-draw pb-0.5 text-sm font-semibold text-ink decoration-brand">
                {c.hero_cta2_label}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="container mt-6" aria-label="Diferenciais">
        <ul className="grid gap-6 rounded-[2rem] glass p-6 shadow-sm sm:grid-cols-2 sm:p-8 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} data-reveal="scale" className="group flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink/10 bg-white text-ink transition group-hover:animate-wiggle group-hover:bg-brand group-hover:text-ink">
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
                    <h3 className="max-w-md font-display text-xl font-normal uppercase leading-[1.2] tracking-wide sm:text-2xl">{b.title}</h3>
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
                    className="card-lift glass group flex h-full items-center gap-3 rounded-3xl p-4"
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

      {/* Mascote */}
      <section id="mascote" className="container mt-20 scroll-mt-24" aria-label="Mascote Myck">
        <div data-reveal className="relative grid items-center gap-6 overflow-hidden rounded-[2.5rem] border border-white bg-gradient-to-br from-white via-paper to-paper-2 p-6 shadow-[0_30px_70px_-50px_rgba(23,23,23,0.45)] sm:p-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-10 lg:p-14">
          <div className="relative mx-auto flex w-full max-w-md items-end justify-center pt-8 lg:pt-0">
            <div className="pointer-events-none absolute left-1/2 top-1/2 h-[88%] w-[88%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--c-brand)/0.55),rgb(var(--c-brand)/0.18)_70%,transparent)]" aria-hidden />
            <span
              aria-hidden
              className="pointer-events-none absolute -top-2 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[clamp(3.2rem,15vw,6.5rem)] leading-none text-transparent opacity-70 [-webkit-text-stroke:2px_rgb(var(--c-brand))]"
            >
              {c.mascot_name}
            </span>
            <div className="float-b relative aspect-[1370/2122] w-[min(78%,19rem)] drop-shadow-[0_24px_24px_rgba(23,23,23,0.22)]">
              <MediaImage src={c.mascot_image || "/mascote-myck.png"} alt={`${c.mascot_name}, o mascote da ${settings.store_name}`} fit="contain" sizes="(min-width: 1024px) 304px, 70vw" />
            </div>
          </div>

          <div className="text-center lg:text-left">
            <p className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-3.5 py-1 text-xs font-medium text-ink-soft">
              <span className="h-1.5 w-1.5 rounded-full bg-brand" aria-hidden />
              {c.mascot_eyebrow}
            </p>
            <h2 className="mt-4 text-2xl sm:text-4xl"><AccentTitle text={c.mascot_title} /></h2>
            <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-ink-soft lg:mx-0 lg:text-lg">{fill(c.mascot_text, { loja: settings.store_name })}</p>
            <ul className="mt-5 flex flex-wrap justify-center gap-2 lg:justify-start" aria-label="Cores CMYK do mascote">
              {[
                ["Ciano", "#00aeef"],
                ["Magenta", "#ec008c"],
                ["Amarelo", "#ffe600"],
                ["Preto", "#171717"],
              ].map(([name, hex]) => (
                <li key={name} className="inline-flex items-center gap-2 rounded-full border border-ink/15 bg-white/70 px-3 py-1 text-xs font-medium">
                  <span className="h-3.5 w-3.5 rounded-full border border-ink/10" style={{ background: hex }} aria-hidden />
                  {name}
                </li>
              ))}
            </ul>
            <Link
              href={c.mascot_cta_href}
              className="shine group relative mt-7 inline-flex h-12 items-center gap-3 overflow-hidden rounded-full bg-brand py-1.5 pl-6 pr-1.5 text-sm font-bold text-ink transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-brand/30"
            >
              {c.mascot_cta_label}
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white transition-transform duration-300 group-hover:rotate-45">
                <ArrowUpRight className="h-4 w-4" aria-hidden />
              </span>
            </Link>
          </div>
        </div>
      </section>

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
                        <li key={`${copy}-${i}`} className="group flex h-28 w-56 shrink-0 items-center justify-center rounded-3xl glass px-4 transition duration-300 hover:-translate-y-1 hover:border-brand hover:shadow-lg sm:h-32 sm:w-72">
                          {c.logo_url ? (
                            <span className="relative block h-full w-full">
                              <MediaImage src={c.logo_url} alt={copy === 0 ? c.name : ""} fit="contain" sizes="240px" className="p-5 transition duration-300 group-hover:scale-105" />
                            </span>
                          ) : (
                            <span className="text-center font-display text-sm uppercase leading-tight text-ink-muted transition group-hover:text-ink">{c.name}</span>
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
        <div data-reveal="scale" className="relative overflow-hidden rounded-[2.5rem] bg-brand p-8 text-ink sm:p-14">
          <div className="pointer-events-none absolute -right-20 -top-20 h-80 w-80 rounded-full border border-ink/15" aria-hidden />
          <div className="pointer-events-none absolute -right-6 -top-6 h-80 w-80 rounded-full border border-ink/15" aria-hidden />
          <h2 className="relative max-w-2xl text-2xl sm:text-4xl"><AccentTitle text={c.cta_title} cream /></h2>
          <p className="relative mt-4 max-w-xl text-base font-medium text-ink/80 sm:text-lg">{c.cta_text}</p>
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
