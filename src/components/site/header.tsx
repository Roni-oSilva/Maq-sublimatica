"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { trackGeneralClickAction } from "@/app/actions/public";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { NAV } from "./nav";

export function Header({
  storeName,
  logoUrl,
  whatsappNumber,
  defaultMessage,
}: {
  storeName: string;
  logoUrl: string | null;
  whatsappNumber: string | null;
  defaultMessage: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const wa = whatsappNumber ? buildWhatsappUrl(whatsappNumber, defaultMessage) : null;

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
      <div className="container flex h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex shrink-0 items-center" aria-label={`${storeName} — página inicial`}>
          {logoUrl ? (
            <Image src={logoUrl} alt={storeName} width={160} height={40} className="h-10 w-auto max-w-[180px] object-contain" />
          ) : (
            <Logo className="h-9 w-auto sm:h-10" />
          )}
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-lg px-3.5 py-2 text-sm font-semibold transition hover:bg-ink/5",
                    isActive(item.href) ? "bg-ink text-white" : "text-ink-soft",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Falar no WhatsApp"
              onClick={() => void trackGeneralClickAction({ label: "Cabeçalho" })}
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#128c4a] px-3.5 text-sm font-semibold text-white transition hover:bg-[#0e7a3f]"
            >
              <MessageCircle className="h-5 w-5" aria-hidden />
              <span className="hidden md:inline">WhatsApp</span>
            </a>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-line lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <nav id="menu-mobile" aria-label="Menu mobile" className="border-t border-line bg-white lg:hidden">
          <ul className="container grid gap-1 py-3">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center rounded-xl px-4 text-base font-semibold",
                    isActive(item.href) ? "bg-ink text-white" : "hover:bg-ink/5",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
