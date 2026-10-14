import { ArrowRight, Brush, Coffee, Frame, Layers, MessageCircle, PackageCheck, Palette, Printer, Shirt, Sparkles } from "lucide-react";
import Link from "next/link";
import { ArtworkCard, ProductCard, SectionHeader, ServiceCard } from "@/components/site/cards";
import { Chevrons } from "@/components/site/logo";
import { MediaImage } from "@/components/site/media";
import { WhatsAppLink } from "@/components/site/whatsapp-buttons";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { getArtworks, getBanners, getCategories, getPopularProducts, getProducts, getServices, getSettings } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/supabase/public";
import { cn } from "@/lib/utils";

export const revalidate = 60;

const BENEFITS = [
  { icon: MessageCircle, title: "Atendimento direto", text: "Tire dúvidas e feche seu pedido conversando pelo WhatsApp." },
  { icon: Brush, title: "Orçamento sob medida", text: "Descreva livremente o que deseja personalizar e receba uma proposta." },
  { icon: Palette, title: "Artes prontas", text: "Galeria de artes disponíveis para personalização ou aquisição." },
  { icon: PackageCheck, title: "Pedido sem burocracia", text: "Disponibilidade, pagamento e frete combinados na própria conversa." },
];

const CATEGORY_ICONS = [Printer, Layers, Sparkles, Palette, Brush, PackageCheck];

export default async function HomePage() {
  const [settings, banners, categories, popular, newest, artworks, services] = await Promise.all([
    getSettings(),
    getBanners(),
    getCategories("product"),
    getPopularProducts(4),
    getProducts({ sort: "newest", limit: 4 }),
    getArtworks({ limit: 4 }),
    getServices(),
  ]);
  const ctx = { whatsappNumber: settings.whatsapp_number, storeName: settings.store_name };
  const hero = banners[0];
  const promos = banners.slice(1);
  const empty = !popular.length && !newest.length && !artworks.length && !services.length;

  return (
    <>
      {/* Hero */}
      <section className="grain relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute -right-32 top-0 hidden h-full w-1/2 skew-x-[-12deg] bg-gradient-to-b from-brand/25 to-transparent lg:block" aria-hidden />
        <div className="container relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-[1.15fr_1fr]">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 bg-lime px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-ink">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Sublimação & personalização
            </p>
            {hero ? (
              <h1 className="mt-5 text-[clamp(2.75rem,8vw,5.75rem)] leading-[0.95] text-cream">
                <span className="text-brand italic">{hero.title.split(" ")[0]}</span> {hero.title.split(" ").slice(1).join(" ")}
              </h1>
            ) : (
              <h1 className="mt-5 text-[clamp(2.75rem,8vw,5.75rem)] leading-[0.95] text-cream">
                <span className="block text-brand italic">Tudo para</span>
                <span className="block">
                  sublimar <span className="font-script text-[1.15em] normal-case text-lime">e</span>
                </span>
                <span className="block">personalizar</span>
              </h1>
            )}
            <p className="mt-6 max-w-xl text-lg text-white/75">
              {hero?.subtitle ??
                "Equipamentos, insumos, artes prontas e serviços sob medida. Escolha o que precisa e feche seu pedido direto no WhatsApp."}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={hero?.cta_href ?? "/loja"}
                className={cn(buttonVariants({ variant: "primary", size: "lg" }))}
                {...(hero?.cta_href?.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              >
                {hero?.cta_label ?? "Conhecer a loja"} <ArrowRight className="h-5 w-5" aria-hidden />
              </Link>
              <Link href="/personalizar" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-cream/40 bg-transparent text-cream hover:bg-cream/10")}>
                Pedir orçamento
              </Link>
            </div>
          </div>

          <div className="relative mx-auto hidden w-full max-w-md md:block lg:max-w-none" aria-hidden={!hero?.image_url}>
            {hero?.image_url ? (
              <div className="relative aspect-square overflow-hidden border-2 border-cream/20">
                <MediaImage src={hero.image_url} alt={hero.title} sizes="480px" priority />
              </div>
            ) : (
              <div className="grid aspect-square grid-cols-2 grid-rows-[1fr_auto_1fr] gap-3">
                <div className="flex items-center justify-center bg-brand"><Coffee className="h-24 w-24 text-ink" strokeWidth={1.5} /></div>
                <div className="flex items-center justify-center bg-cream"><Shirt className="h-24 w-24 text-ink" strokeWidth={1.5} /></div>
                <div className="col-span-2 flex items-center justify-between bg-lime px-5 py-3 text-ink">
                  <span className="font-display text-2xl uppercase">Do seu jeito</span>
                  <Chevrons className="h-7 w-auto" color="#171717" />
                </div>
                <div className="flex items-center justify-center border-2 border-cream/40"><Frame className="h-24 w-24 text-cream" strokeWidth={1.5} /></div>
                <div className="flex items-center justify-center bg-brand/90"><span className="font-script text-5xl text-ink">feito pra você</span></div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Faixa */}
      <div className="overflow-hidden bg-brand py-3 text-ink" aria-hidden>
        <div className="flex w-max animate-marquee gap-8 whitespace-nowrap font-display text-xl uppercase">
          {[0, 1].map((k) => (
            <div key={k} className="flex gap-8">
              {["Sublimação", "Personalização", "Canecas", "Camisetas", "Quadros", "Brindes", "Artes prontas"].map((w) => (
                <span key={`${k}-${w}`} className="flex items-center gap-8">{w} <Sparkles className="h-4 w-4" /></span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Benefícios */}
      <section className="border-b border-line bg-white" aria-label="Diferenciais">
        <ul className="container grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center bg-ink text-lime">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="font-sans text-sm font-bold normal-case tracking-normal">{title}</h2>
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
          <div className="grid gap-4 md:grid-cols-2">
            {promos.map((b) => (
              <Link key={b.id} href={b.cta_href ?? "/loja"} className="card-lift group relative flex min-h-40 items-end overflow-hidden rounded-2xl bg-ink p-6 text-white">
                {b.image_url && <MediaImage src={b.image_url} alt="" className="opacity-50 transition group-hover:scale-105" sizes="50vw" />}
                <div className="relative">
                  <h3 className="text-xl font-extrabold">{b.title}</h3>
                  {b.subtitle && <p className="mt-1 text-sm text-white/80">{b.subtitle}</p>}
                  <span className="mt-2 inline-block text-sm font-semibold text-lime">{b.cta_label ?? "Saiba mais"} →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="container mt-16">
          <SectionHeader eyebrow="Explore" title="Categorias em destaque" href="/loja" hrefLabel="Ver toda a loja" />
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.slice(0, 10).map((c, i) => {
              const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
              return (
                <li key={c.id}>
                  <Link
                    href={`/loja?categoria=${c.slug}`}
                    className="card-lift group flex h-full items-center gap-3 rounded-2xl border border-line bg-white p-4"
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
        <section className="container mt-16">
          <SectionHeader eyebrow="Em alta" title="Produtos mais procurados" href="/loja" />
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {popular.map((p) => (
              <ProductCard key={p.id} product={p} ctx={ctx} />
            ))}
          </div>
        </section>
      )}

      {newest.length > 0 && (
        <section className="container mt-16">
          <SectionHeader eyebrow="Novidades" title="Recém-cadastrados" href="/loja?ordem=newest" />
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {newest.map((p) => (
              <ProductCard key={p.id} product={p} ctx={ctx} />
            ))}
          </div>
        </section>
      )}

      {artworks.length > 0 && (
        <section className="container mt-16">
          <SectionHeader eyebrow="Criatividade" title="Artes prontas" href="/artes-prontas" />
          <div className="grid grid-cols-1 gap-5 min-[480px]:grid-cols-2 lg:grid-cols-4">
            {artworks.map((a) => (
              <ArtworkCard key={a.id} artwork={a} ctx={ctx} />
            ))}
          </div>
        </section>
      )}

      {services.length > 0 && (
        <section className="container mt-16">
          <SectionHeader eyebrow="Personalização" title="Nossos serviços" href="/servicos" />
          <div className="grid gap-5 md:grid-cols-3">
            {services.slice(0, 3).map((s) => (
              <ServiceCard key={s.id} service={s} ctx={ctx} />
            ))}
          </div>
        </section>
      )}

      {empty && isSupabaseConfigured() && (
        <div className="container mt-12">
          <EmptyState title="Catálogo em preparação">Em breve novos produtos, artes e serviços. Enquanto isso, fale com a gente pelo WhatsApp.</EmptyState>
        </div>
      )}

      {/* CTA final */}
      <section className="container mt-20">
        <div className="grain relative overflow-hidden bg-brand p-8 text-ink sm:p-12">
          <Chevrons className="absolute -right-4 top-6 hidden h-32 w-auto opacity-20 sm:block" color="#171717" />
          <h2 className="max-w-2xl text-4xl leading-none sm:text-6xl">Não encontrou o que procura?</h2>
          <p className="mt-4 max-w-xl text-lg font-medium">Conte para nós o que você quer produzir ou personalizar e receba um orçamento pelo WhatsApp.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href="/personalizar" className={cn(buttonVariants({ variant: "dark", size: "lg" }))}>
              Solicitar orçamento
            </Link>
            <WhatsAppLink number={settings.whatsapp_number} message={settings.default_whatsapp_message} size="lg" label="Chamada final da página inicial" />
          </div>
        </div>
      </section>
    </>
  );
}
