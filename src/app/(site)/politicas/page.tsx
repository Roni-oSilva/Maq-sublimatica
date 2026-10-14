import type { Metadata } from "next";
import { PageHero } from "@/components/site/cards";
import { getContent, getSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return { title: c.policies_title, alternates: { canonical: "/politicas" } };
}
export const revalidate = 60;

export default async function PoliciesPage() {
  const [s, c] = await Promise.all([getSettings(), getContent()]);
  return (
    <>
      <PageHero eyebrow={c.policies_eyebrow} title={c.policies_title} />
      <div className="container mt-10 max-w-3xl">
        <p className="whitespace-pre-line leading-relaxed text-ink-soft">{s.policies_text ?? "Políticas em breve."}</p>
      </div>
    </>
  );
}
