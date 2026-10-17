"use client";

import { Menu, MessageCircle, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackGeneralClickAction } from "@/app/actions/public";
import { buildWhatsappUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { useScrolled } from "./motion";

/** Altura reservada pelo cabeçalho (pílula + respiro). As páginas começam por baixo dele. */
export const HEADER_OFFSET = "4.25rem";

export function Header({
  storeName,
  logoUrl,
  whatsappNumber,
  defaultMessage,
  nav,
  whatsappLabel,
}: {
  storeName: string;
  logoUrl: string | null;
  whatsappNumber: string | null;
  defaultMessage: string;
  nav: { href: string; label: string }[];
  whatsappLabel: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const scrolled = useScrolled(24);
  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname.startsWith(href));
  const isHome = pathname === "/";
  const slotRef = useRef<HTMLAnchorElement>(null);
  const flyRef = useRef<HTMLAnchorElement>(null);
  const [flying, setFlying] = useState(false);

  // Na home, a logo começa grande no hero e, ao rolar, "volta" para o canto do menu.
  useEffect(() => {
    if (!isHome) {
      setFlying(false);
      return;
    }
    if (!flying) {
      setFlying(true);
      return;
    }
    let raf = 0;
    const update = () => {
      raf = 0;
      const slot = slotRef.current;
      const fly = flyRef.current;
      if (!slot || !fly) return;
      const r = slot.getBoundingClientRect();
      const p = Math.min(Math.max(window.scrollY / 170, 0), 1);
      const e = 1 - Math.pow(1 - p, 3);
      const bigW = Math.min(window.innerWidth * 0.72, 340);
      const s = 1 + (bigW / r.width - 1) * (1 - e);
      const x0 = (window.innerWidth - bigW) / 2;
      const y0 = 92;
      const x = x0 + (r.left - x0) * e;
      const y = y0 + (r.top - y0) * e;
      fly.style.width = `${r.width}px`;
      fly.style.transform = `translate(${x}px, ${y}px) scale(${s})`;
      fly.style.opacity = "1";
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [isHome, flying]);

  const wa = whatsappNumber ? buildWhatsappUrl(whatsappNumber, defaultMessage) : null;

  return (
    <header className="sticky top-3 z-40 px-3 pt-3 sm:px-5" style={{ height: HEADER_OFFSET }}>
      <div
        className={cn(
          "mx-auto flex h-14 max-w-[1280px] items-center justify-between gap-3 rounded-full border bg-white/60 backdrop-blur-xl pl-5 pr-2 transition-shadow duration-300",
          scrolled ? "border-line shadow-[0_12px_32px_-14px_rgba(23,23,23,0.35)]" : "border-white shadow-[0_4px_18px_-12px_rgba(23,23,23,0.25)]",
        )}
      >
        <Link
          ref={slotRef}
          href="/"
          className={cn("flex shrink-0 items-center", flying && "invisible")}
          aria-label={`${storeName} — página inicial`}
          tabIndex={flying ? -1 : undefined}
        >
          {logoUrl ? (
            <Image src={logoUrl} alt={storeName} width={160} height={40} className="h-8 w-auto max-w-[170px] object-contain" />
          ) : (
            <Logo className="h-8 w-auto" />
          )}
        </Link>

        <nav aria-label="Principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition hover:text-ink",
                    isActive(item.href) ? "bg-ink/[0.06] font-semibold text-ink" : "text-ink-soft",
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
              className="inline-flex h-10 items-center gap-2 rounded-full bg-ink px-5 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-ink-soft"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">{whatsappLabel}</span>
            </a>
          )}
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-line bg-white lg:hidden"
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {flying && (
        <Link
          ref={flyRef}
          href="/"
          aria-label={`${storeName} — página inicial`}
          className="fixed left-0 top-0 z-50 block origin-top-left opacity-0 will-change-transform"
        >
          {logoUrl ? (
            <Image src={logoUrl} alt={storeName} width={160} height={40} className="h-auto w-full object-contain" />
          ) : (
            <Logo className="h-auto w-full" />
          )}
        </Link>
      )}

      {open && (
        <nav id="menu-mobile" aria-label="Menu mobile" className="mx-auto mt-2 max-w-[1280px] rounded-3xl glass p-2 shadow-xl lg:hidden">
          <ul className="grid gap-1">
            {nav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "flex min-h-12 items-center rounded-2xl px-4 text-base font-semibold",
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
