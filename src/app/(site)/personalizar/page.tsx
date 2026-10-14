import type { Metadata } from "next";
import { PageHero } from "@/components/site/cards";
import { QuoteForm } from "@/components/site/quote-form";
import { getContent, getSettings } from "@/lib/data";

export async function generateMetadata(): Promise<Metadata> {
  const c = await getContent();
  return { title: c.custom_title, description: c.custom_subtitle.slice(0, 160), alternates: { canonical: "/personalizar" } };
}
export const revalidate = 60;

export default async function CustomizePage() {
  const [s, c] = await Promise.all([getSettings(), getContent()]);
  return (
    <>
      <PageHero eyebrow={c.custom_eyebrow} title={c.custom_title} image={c.custom_header_image || null}>
        {c.custom_subtitle}
      </PageHero>
      <div className="container mt-8 max-w-3xl">
        <QuoteForm
          whatsappNumber={s.whatsapp_number}
          storeName={s.store_name}
          texts={{
            name: c.custom_label_name,
            phone: c.custom_label_phone,
            type: c.custom_label_type,
            quantity: c.custom_label_quantity,
            deadline: c.custom_label_deadline,
            description: c.custom_label_description,
            details: c.custom_label_details,
            reference: c.custom_label_reference,
            submit: c.custom_submit,
            attach: c.custom_attach_note,
            successTitle: c.custom_success_title,
            successText: c.custom_success_text,
            intro: c.msg_quote_intro,
            closing: c.msg_quote_closing,
          }}
        />
      </div>
    </>
  );
}
