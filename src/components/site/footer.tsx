import { Clock, ExternalLink, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type { StoreSettings } from "@/lib/types";
import { navItems } from "./nav";
import { Logo } from "./logo";
import { WhatsAppLink } from "./whatsapp-buttons";

const SOCIAL_LABELS: Record<string, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  youtube: "YouTube",
};

export function Footer({ settings, t }: { settings: StoreSettings; t: Record<string, string> }) {
  const c = settings.contact_information;
  const payments = (settings.payment_methods ?? "").split("\n").map((m) => m.trim()).filter(Boolean);
  const socials = Object.entries(settings.social_links).filter(([, v]) => v);
  return (
    <footer className="grain mt-24 overflow-hidden rounded-t-[2.5rem] bg-ink text-white/80">
      <div className="h-2 bg-brand" aria-hidden />
      <div className="container grid gap-10 py-14 md:grid-cols-4">
        <div className="md:col-span-1">
          {settings.logo_url ? (
            <span className="inline-flex rounded-xl bg-cream p-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={settings.logo_url} alt={settings.store_name} className="h-9 w-auto max-w-[180px] object-contain" />
            </span>
          ) : (
            <Logo light className="h-11 w-auto" />
          )}
          <p className="mt-4 text-sm leading-relaxed">
            {t.footer_about}
          </p>
          <WhatsAppLink number={settings.whatsapp_number} message={settings.default_whatsapp_message} className="mt-5" label="Rodapé">
            {t.footer_whatsapp_label}
          </WhatsAppLink>
        </div>

        <nav aria-label="Rodapé">
          <h2 className="font-display text-lg uppercase tracking-wide text-brand">{t.footer_nav_title}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {navItems(t).map((n) => (
              <li key={n.href}>
                <Link href={n.href} className="hover:text-white">
                  {n.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h2 className="font-display text-lg uppercase tracking-wide text-brand">{t.footer_contact_title}</h2>
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
          <h2 className="font-display text-lg uppercase tracking-wide text-brand">{t.footer_social_title}</h2>
          {socials.length > 0 && (
            <ul className="mt-4 flex flex-wrap gap-2">
              {socials.map(([key, url]) => (
                <li key={key}>
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-3.5 py-1.5 text-sm transition hover:-translate-y-0.5 hover:bg-white/10"
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
                {t.footer_policies_label}
              </Link>
            </li>
            <li>
              <Link href="/personalizar" className="hover:text-white">
                {t.footer_quote_label}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      {payments.length > 0 && (
        <div className="border-t border-white/10 py-6">
          <div className="container flex flex-col items-center gap-3 text-center">
            <h2 className="font-display text-lg uppercase tracking-wide text-brand">{t.footer_payments_title}</h2>
            <ul className="flex flex-wrap justify-center gap-2">
              {payments.map((m) => (
                <li key={m} className="rounded-full border border-white/20 bg-white/5 px-4 py-1.5 text-sm font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-white/10">{m}</li>
              ))}
            </ul>
            <p className="text-xs text-white/50">{t.footer_payments_note}</p>
          </div>
        </div>
      )}
      <div className="border-t border-white/10 py-5 text-center text-xs text-white/60">
        © {new Date().getFullYear()} {settings.store_name}. {t.footer_copyright}
      </div>
    </footer>
  );
}
