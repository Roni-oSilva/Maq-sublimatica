import { ArrowRight, Brush, Layers, MessageCircle, PackageCheck, Palette, Printer, Sparkles } from "lucide-react";
import Link from "next/link";
import { ArtworkCard, ProductCard, SectionHeader, ServiceCard } from "@/components/site/cards";
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
      <section className="relative overflow-hidden bg-ink text-white">
        <div className="pointer-events-none absolute -right-24 -top-24 h-96 w-96 rounded-full bg-brand/40 blur-3xl" aria-hidden />
        <div className="pointer-events-none absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-cyan-brand/30 blur-3xl" aria-hidden />
        <div className="container relative grid items-center gap-10 py-14 sm:py-20 lg:grid-cols-2">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-cyan-300">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Sublimação & personalização
            </p>
            <h1 className="mt-5 text-4xl font-extrabold leading-[1.08] sm:text-5xl lg:text-6xl">
              {hero?.title ?? "Tudo para sublimar e personalizar do seu jeito"}
            </h1>
            <p className="mt-5 max-w-xl text-lg text-white/75">
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
              <Link href="/personalizar" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-white/25 bg-transparent text-white hover:bg-white/10")}>
                Pedir orçamento
              </Link>
            </div>
          </div>
          <div className="relative mx-auto hidden aspect-square w-full max-w-md lg:block" aria-hidden={!hero?.image_url}>
            {hero?.image_url ? (
              <div className="relative h-full w-full overflow-hidden rounded-3xl border border-white/10 shadow-2xl">
                <MediaImage src={hero.image_url} alt={hero.title} sizes="448px" priority />
              </div>
            ) : (
              <div className="grid h-full w-full grid-cols-2 gap-4">
                {["bg-cyan-brand", "bg-brand", "bg-amber-400", "bg-white"].map((c, i) => (
                  <div key={c} className={cn("rounded-3xl opacity-90 shadow-xl", c, i % 3 === 0 ? "rounded-tl-[4rem]" : "rounded-br-[4rem]")} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section className="border-b border-line bg-white" aria-label="Diferenciais">
        <ul className="container grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <div>
                <h2 className="text-sm font-bold">{title}</h2>
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
                  <span className="mt-2 inline-block text-sm font-semibold text-cyan-300">{b.cta_label ?? "Saiba mais"} →</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <section className="container mt-16">
          <SectionHeader eyebrow="Explore" title="Categorias em destaque" href="/loja" hrefLabel="Ver toda a loja" />
          <ul className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((c, i) => {
              const Icon = CATEGORY_ICONS[i % CATEGORY_ICONS.length];
              return (
                <li key={c.id}>
                  <Link
                    href={`/loja?categoria=${c.slug}`}
                    className="card-lift flex h-full flex-col items-center gap-3 rounded-2xl border border-line bg-white p-5 text-center"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-light text-brand">
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
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-ink p-8 text-white sm:p-12">
          <h2 className="max-w-xl text-3xl font-extrabold">Não encontrou o que procura?</h2>
          <p className="mt-3 max-w-xl text-white/85">Conte para nós o que você quer produzir ou personalizar e receba um orçamento pelo WhatsApp.</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/personalizar" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "border-0")}>
              Solicitar orçamento
            </Link>
            <WhatsAppLink number={settings.whatsapp_number} message={settings.default_whatsapp_message} size="lg" label="Chamada final da página inicial" />
          </div>
        </div>
      </section>
    </>
  );
}
