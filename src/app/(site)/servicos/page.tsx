import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, ServiceCard } from "@/components/site/cards";
import { EmptyState } from "@/components/ui/misc";
import { getContent, getServices, getSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return { title: c.nav_services, description: c.services_page_subtitle.slice(0, 160), alternates: { canonical: "/servicos" } };
}

export const revalidate = 60;

export default async function ServicesPage() {
  const [settings, c, services] = await Promise.all([getSettings(), getContent(), getServices()]);
  const ctx = { whatsappNumber: settings.whatsapp_number, storeName: settings.store_name, t: c };
  const groups = new Map<string, typeof services>();
  for (const s of services) {
    const key = s.category?.name ?? "Serviços";
    groups.set(key, [...(groups.get(key) ?? []), s]);
  }
  return (
    <>
      <PageHero eyebrow={c.services_page_eyebrow} title={c.services_page_title} image={c.services_page_header_image || null}>
        {c.services_page_subtitle}
      </PageHero>
      <div className="container mt-10 space-y-12">
        {services.length === 0 ? (
          <EmptyState title={c.services_empty_title}>
            <Link href="/personalizar" className="font-semibold text-brand-text underline">{c.services_empty_text}</Link>
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
