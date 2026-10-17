import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/cards";
import { MediaImage } from "@/components/site/media";
import { WhatsAppLink } from "@/components/site/whatsapp-buttons";
import { fill } from "@/lib/content";
import { getContent, getSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return { title: c.nav_about, alternates: { canonical: "/sobre" } };
}
export const revalidate = 60;

export default async function AboutPage() {
  const [s, c] = await Promise.all([getSettings(), getContent()]);
  const loja = s.store_name;
  return (
    <>
      <PageHero eyebrow={c.about_eyebrow} title={fill(c.about_title, { loja })} image={c.about_header_image || null}>
        {c.about_subtitle && fill(c.about_subtitle, { loja })}
      </PageHero>
      <div className="container mt-10 grid items-start gap-10 lg:grid-cols-[1fr_420px]">
        <div className="max-w-3xl">
          <p className="whitespace-pre-line text-lg leading-relaxed text-ink-soft">{s.about_text ?? "Informações institucionais em breve."}</p>
          <WhatsAppLink number={s.whatsapp_number} message={s.default_whatsapp_message} size="lg" className="mt-8" label="Página Sobre">
            {c.about_cta_label}
          </WhatsAppLink>
        </div>
        <div className="relative mx-auto aspect-[4/5] w-full max-w-[420px] overflow-hidden rounded-[2rem] border border-white bg-gradient-to-b from-white to-paper-2">
          {c.about_image ? (
            <Image src={c.about_image} alt={loja} fill sizes="420px" className="object-cover" unoptimized />
          ) : (
            <>
              <div className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgb(var(--c-brand)/0.5),transparent)]" aria-hidden />
              <div className="absolute inset-0 p-6">
                <div className="relative h-full w-full">
                  <MediaImage src={c.mascot_image || "/mascote-myck.png"} alt={`${c.mascot_name}, o mascote da ${loja}`} fit="contain" sizes="420px" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
