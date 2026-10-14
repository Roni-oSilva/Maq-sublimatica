import { saveSettingsAction } from "@/app/admin/actions";
import { ActionForm, F, ImageField } from "@/components/admin/forms";
import { PageTitle, Panel } from "@/components/admin/shared";
import { Input, Textarea } from "@/components/ui/form";
import { requireAdmin } from "@/lib/admin";
import { DEFAULT_SETTINGS, type StoreSettings } from "@/lib/types";

export const metadata = { title: "Configurações" };

export default async function SettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("store_settings").select("*").eq("id", 1).maybeSingle();
  const s = { ...DEFAULT_SETTINGS, ...(data ?? {}) } as StoreSettings;
  return (
    <>
      <PageTitle title="Configurações da loja" subtitle="Alterações são salvas no banco e refletem no site em instantes." />
      <Panel className="max-w-3xl">
        <ActionForm action={saveSettingsAction} successMessage="Configurações salvas.">
          <h2 className="text-lg font-bold">Identidade</h2>
          <F name="store_name" label="Nome comercial" required><Input id="store_name" name="store_name" defaultValue={s.store_name} maxLength={80} required /></F>
          <ImageField name="logo_url" label="Logotipo" folder="logo" defaultValue={s.logo_url} />

          <h2 className="pt-4 text-lg font-bold">WhatsApp</h2>
          <F name="whatsapp_number" label="Número do WhatsApp" hint="Com DDI e DDD, ex.: 5511999999999 (o formato “(11) 99999-9999” também é aceito e convertido). É validado antes de ser salvo.">
            <Input id="whatsapp_number" name="whatsapp_number" inputMode="tel" defaultValue={s.whatsapp_number ?? ""} placeholder="5511999999999" />
          </F>
          <F name="default_whatsapp_message" label="Mensagem padrão de atendimento" required hint="Usada nos botões gerais de contato (cabeçalho, rodapé, botão flutuante).">
            <Textarea id="default_whatsapp_message" name="default_whatsapp_message" rows={3} defaultValue={s.default_whatsapp_message} maxLength={500} required />
          </F>

          <h2 className="pt-4 text-lg font-bold">Contato</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F name="email" label="E-mail"><Input id="email" name="email" type="email" defaultValue={s.contact_information.email ?? ""} /></F>
            <F name="phone" label="Telefone"><Input id="phone" name="phone" defaultValue={s.contact_information.phone ?? ""} maxLength={40} /></F>
          </div>
          <F name="address" label="Endereço"><Input id="address" name="address" defaultValue={s.contact_information.address ?? ""} maxLength={300} /></F>
          <F name="hours" label="Horário de atendimento"><Input id="hours" name="hours" defaultValue={s.contact_information.hours ?? ""} maxLength={200} /></F>

          <F name="payment_methods" label="Formas de pagamento aceitas" hint="Uma por linha. Aparecem no rodapé.">
            <Textarea id="payment_methods" name="payment_methods" rows={4} defaultValue={s.payment_methods ?? ""} maxLength={600} />
          </F>

          <h2 className="pt-4 text-lg font-bold">Redes sociais</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <F name="instagram" label="Instagram"><Input id="instagram" name="instagram" type="url" defaultValue={s.social_links.instagram ?? ""} placeholder="https://instagram.com/…" /></F>
            <F name="facebook" label="Facebook"><Input id="facebook" name="facebook" type="url" defaultValue={s.social_links.facebook ?? ""} /></F>
            <F name="tiktok" label="TikTok"><Input id="tiktok" name="tiktok" type="url" defaultValue={s.social_links.tiktok ?? ""} /></F>
            <F name="youtube" label="YouTube"><Input id="youtube" name="youtube" type="url" defaultValue={s.social_links.youtube ?? ""} /></F>
          </div>

          <h2 className="pt-4 text-lg font-bold">Textos institucionais</h2>
          <F name="about_text" label="Sobre a empresa"><Textarea id="about_text" name="about_text" rows={6} defaultValue={s.about_text ?? ""} maxLength={8000} /></F>
          <F name="policies_text" label="Políticas da loja" hint="Trocas, prazos, pagamento, frete…"><Textarea id="policies_text" name="policies_text" rows={6} defaultValue={s.policies_text ?? ""} maxLength={12000} /></F>
        </ActionForm>
      </Panel>
    </>
  );
}
