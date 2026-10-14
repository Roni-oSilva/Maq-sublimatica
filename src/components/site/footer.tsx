import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type { StoreSettings } from "@/lib/types";
import { NAV } from "./nav";
import { Logo } from "./logo";
import { WhatsAppLink } from "./whatsapp-buttons";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export function Footer({ settings }: { settings: StoreSettings }) {
  const c = settings.contact_information;
  const socials = Object.entries(settings.social_links).filter(([, v]) => v);
  return (
    <footer className="mt-24 bg-ink text-white/80">
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          <div className="flex items-center gap-2.5 font-display text-xl font-extrabold text-white">
            <Logo /> {settings.store_name}
          </div>
          <p className="mt-4 text-sm leading-relaxed">
            Equipamentos, insumos, artes e serviços de sublimação e personalização. Pedidos e orçamentos pelo WhatsApp.
          </p>
          <WhatsAppLink number={settings.whatsapp_number} message={settings.default_whatsapp_message} className="mt-5" label="Rodapé" />
        </div>

        <nav aria-label="Rodapé">
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Navegação</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Contato</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {c.phone && (
              <li className="flex gap-2">
                <Phone className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {c.phone}
              </li>
            )}
            {c.email && (
              <li className="flex gap-2">
                <Mail className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <a href={`mailto:${c.email}`} className="hover:text-white">
                  {c.email}
                </a>
              </li>
            )}
            {c.address && (
              <li className="flex gap-2">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {c.address}
              </li>
            )}
            {c.hours && (
              <li className="flex gap-2">
                <Clock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> {c.hours}
              </li>
            )}
            {!c.phone && !c.email && !c.address && !c.hours && <li>Atendimento pelo WhatsApp.</li>}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-white">Redes e políticas</h2>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/20 px-3 py-1.5 text-sm hover:bg-white/10"
                  >
                    {SOCIAL_LABELS[key] ?? key} <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link href="/politicas" className="hover:text-white">
                Políticas da loja
              </Link>
            </li>
            <li>
              <Link href="/personalizar" className="hover:text-white">
                Solicitar orçamento
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {settings.store_name}. Todos os direitos reservados.
      </div>
    </footer>
  );
}
