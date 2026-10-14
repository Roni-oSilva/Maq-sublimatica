import type { Metadata } from "next";
import { PageHero } from "@/components/site/cards";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Políticas da loja", alternates: { canonical: "/politicas" } };
export const revalidate = 60;

export default async function PoliciesPage() {
  const s = await getSettings();
  return (
    <>
      <PageHero eyebrow="Políticas" title="Políticas da loja" />
      <div className="container mt-10 max-w-3xl">
        <p className="whitespace-pre-line leading-relaxed text-ink-soft">{s.policies_text ?? "Políticas em breve."}</p>
      </div>
    </>
  );
}
