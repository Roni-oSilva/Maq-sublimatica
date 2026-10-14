"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";

/**
 * Anima elementos com [data-reveal] ao entrarem na tela (com atraso escalonado entre irmãos).
 * Sem JavaScript o conteúdo permanece visível: a classe `reveal-ready` só é aplicada aqui.
 */
export function RevealObserver() {
  const pathname = usePathname();
  useLayoutEffect(() => {
    const root = document.documentElement;
    root.classList.add("reveal-ready");
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          const el = e.target as HTMLElement;
          const idx = Array.from(el.parentElement?.children ?? []).filter((c) => c.hasAttribute("data-reveal")).indexOf(el);
          el.style.setProperty("--d", `${Math.min(Math.max(idx, 0), 7) * 70}ms`);
          el.classList.add("in");
          io.unobserve(el);
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    const scan = (node: ParentNode) => node.querySelectorAll<HTMLElement>("[data-reveal]:not(.in)").forEach((el) => io.observe(el));
    scan(document);
    const mo = new MutationObserver(() => scan(document));
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);
  return null;
}
