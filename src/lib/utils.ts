import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

/** "R$ 850,00" (com espaço comum, seguro para mensagens de WhatsApp). */
export function formatBRL(value: number): string {
  return brl.format(value).replace(/ /g, " ");
}

/** Preço para exibição: valor ou "Sob consulta". */
export function formatPrice(price: number | null | undefined, onRequest: boolean): string {
  if (onRequest || price === null || price === undefined) return "Sob consulta";
  return formatBRL(price);
}

/** Converte "1.234,56" / "850" / "850.5" em número; retorna null se vazio/inválido. */
export function parseMoney(input: string | null | undefined): number | null {
  if (input === null || input === undefined) return null;
  let s = String(input).replace(/[^\d.,-]/g, "").trim();
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  else if ((s.match(/\./g) ?? []).length > 1) s = s.replace(/\./g, "");
  const n = Number(s);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : null;
}

export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

const MONTHS = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];

/** "2026-03" → "mar/26" */
export function monthLabel(ym: string): string {
  const [y, m] = ym.split("-");
  const idx = Number(m) - 1;
  if (!y || idx < 0 || idx > 11) return ym;
  return `${MONTHS[idx]}/${y.slice(2)}`;
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
}

/** Escapa curingas do LIKE para buscas por texto digitado pelo usuário. */
export function escapeLike(term: string): string {
  return term.replace(/[\\%_]/g, (c) => `\\${c}`);
}

export function siteUrl(): string {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (env) return env;
  if (typeof window !== "undefined") return window.location.origin;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}
