import type { Metadata } from "next";
import { PageHero } from "@/components/site/cards";
import { QuoteForm } from "@/components/site/quote-form";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Personalizar — solicite um orçamento",
  description: "Descreva livremente o que deseja personalizar e receba um orçamento pelo WhatsApp.",
  alternates: { canonical: "/personalizar" },
};
export const revalidate = 60;

export default async function CustomizePage() {
  const s = await getSettings();
  return (
    <>
      <PageHero eyebrow="Personalizar" title="Conte o que você quer criar">
        Escreva com suas palavras. Registramos a solicitação e abrimos o WhatsApp com tudo organizado para você enviar.
      </PageHero>
      <div className="container mt-8 max-w-3xl">
        <QuoteForm whatsappNumber={s.whatsapp_number} storeName={s.store_name} />
      </div>
    </>
  );
}
