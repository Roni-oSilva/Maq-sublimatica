import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, ServiceCard } from "@/components/site/cards";
import { EmptyState } from "@/components/ui/misc";
import { getServices, getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "Serviços",
  description: "Personalização de produtos, criação de artes, impressão para sublimação e serviços sob orçamento.",
  alternates: { canonical: "/servicos" },
};

export const revalidate = 60;

export default async function ServicesPage() {
  const [settings, services] = await Promise.all([getSettings(), getServices()]);
  const ctx = { whatsappNumber: settings.whatsapp_number, storeName: settings.store_name };
  const groups = new Map<string, typeof services>();
  for (const s of services) {
    const key = s.category?.name ?? "Serviços";
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  return (
    <>
      <PageHero eyebrow="Serviços" title="Personalização e produção sob medida">
        Solicite atendimento direto pelo WhatsApp com o serviço já identificado na mensagem.
      </PageHero>
      <div className="container mt-10 space-y-12">
        {services.length === 0 ? (
          <EmptyState title="Serviços em breve">
            Enquanto isso, <Link href="/personalizar" className="font-semibold text-brand-text underline">descreva o que você precisa</Link> e receba um orçamento.
          </EmptyState>
        ) : (
          [...groups.entries()].map(([name, list]) => (
            <section key={name} aria-labelledby={`g-${name}`}>
              <h2 id={`g-${name}`} className="section-title mb-6">{name}</h2>
              <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
                {list.map((s) => (
                  <ServiceCard key={s.id} service={s} ctx={ctx} />
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </>
  );
}
