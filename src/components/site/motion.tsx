"use client";

import { useEffect, useRef, useState } from "react";

/** Barra de progresso de leitura no topo da página. */
export function ScrollProgress() {
  const bar = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const h = document.documentElement;
      const p = h.scrollHeight - h.clientHeight > 0 ? h.scrollTop / (h.scrollHeight - h.clientHeight) : 0;
      if (bar.current) bar.current.style.transform = `scaleX(${p})`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update); };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1" aria-hidden>
      <div ref={bar} className="h-full origin-left scale-x-0 bg-brand will-change-transform" />
    </div>
  );
}

/** Retorna true depois que a página rolou além do limite (para encolher o cabeçalho). */
export function useScrolled(threshold = 16) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > threshold);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, [threshold]);
  return scrolled;
}

/** Parallax: filhos com data-depth se movem conforme o mouse. */
export function Parallax({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const layers = Array.from(el.querySelectorAll<HTMLElement>("[data-depth]"));
    let raf = 0;
    let tx = 0, ty = 0;
    const apply = () => {
      raf = 0;
      for (const l of layers) {
        const d = Number(l.dataset.depth ?? 1);
        l.style.transform = `translate3d(${tx * d * 14}px, ${ty * d * 14}px, 0)`;
      }
    };
    const move = (e: MouseEvent) => {
      const r = el.getBoundingClientRect();
      tx = (e.clientX - (r.left + r.width / 2)) / (r.width / 2);
      ty = (e.clientY - (r.top + r.height / 2)) / (r.height / 2);
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const leave = () => { tx = 0; ty = 0; if (!raf) raf = requestAnimationFrame(apply); };
    window.addEventListener("mousemove", move, { passive: true });
    el.addEventListener("mouseleave", leave);
    return () => { window.removeEventListener("mousemove", move); el.removeEventListener("mouseleave", leave); if (raf) cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className={className}>{children}</div>;
}
