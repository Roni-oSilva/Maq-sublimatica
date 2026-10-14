import { MessageCircle } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { WhatsAppLink } from "@/components/site/whatsapp-buttons";
import { getSettings } from "@/lib/data";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  return (
    <>
      <a href="#conteudo" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
        Ir para o conteúdo
      </a>
      <Header
        storeName={settings.store_name}
        logoUrl={settings.logo_url}
        whatsappNumber={settings.whatsapp_number}
        defaultMessage={settings.default_whatsapp_message}
      />
      <main id="conteudo">{children}</main>
      <Footer settings={settings} />
      {settings.whatsapp_number && (
        <div className="fixed bottom-4 right-4 z-30 sm:bottom-6 sm:right-6">
          <WhatsAppLink
            number={settings.whatsapp_number}
            message={settings.default_whatsapp_message}
            size="icon"
            className="h-14 w-14 rounded-full shadow-xl shadow-black/20"
            label="Falar no WhatsApp (botão flutuante)"
          >
            <MessageCircle className="h-7 w-7" aria-hidden />
          </WhatsAppLink>
        </div>
      )}
    </>
  );
}
