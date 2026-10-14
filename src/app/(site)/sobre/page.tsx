import type { Metadata } from "next";
import { PageHero } from "@/components/site/cards";
import { WhatsAppLink } from "@/components/site/whatsapp-buttons";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Sobre", description: "Conheça a Maq Sublimática.", alternates: { canonical: "/sobre" } };
export const revalidate = 60;

export default async function AboutPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero eyebrow="Sobre" title={`Conheça a ${s.store_name}`} />
      <div className="container mt-10 max-w-3xl">
        <p className="whitespace-pre-line text-lg leading-relaxed text-ink-soft">
          {s.about_text ?? "Informações institucionais em breve."}
        </p>
        <WhatsAppLink number={s.whatsapp_number} message={s.default_whatsapp_message} size="lg" className="mt-8" label="Página Sobre" />
      </div>
    </>
  );
}
