import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/site/cards";
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
        {c.about_image && (
          <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-line">
            <Image src={c.about_image} alt={loja} fill sizes="420px" className="object-cover" unoptimized />
          </div>
        )}
      </div>
    </>
  );
}
