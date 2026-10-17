import { MessageCircle } from "lucide-react";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { ScrollProgress } from "@/components/site/motion";
import { RevealObserver } from "@/components/site/reveal";
import { WhatsAppLink } from "@/components/site/whatsapp-buttons";
import { getContent, getSettings } from "@/lib/data";
import { navItems } from "@/components/site/nav";

export const revalidate = 60;

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, c] = await Promise.all([getSettings(), getContent()]);
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
        nav={navItems(c)}
        whatsappLabel={c.header_whatsapp_label}
      />
      <ScrollProgress />
      <RevealObserver />
      <main id="conteudo" className="-mt-[4.25rem]">{children}</main>
      <Footer settings={settings} t={c} />
      {settings.whatsapp_number && (
        <div className="pulse-ring fixed bottom-4 right-4 z-30 rounded-full sm:bottom-6 sm:right-6">
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
