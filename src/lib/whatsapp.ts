import { DEFAULT_CONTENT, fill } from "./content";
import { formatBRL } from "./utils";

export type PhoneResult = { ok: true; value: string } | { ok: false; error: string };

/**
 * Normaliza um número para o formato internacional (somente dígitos, ex.: 5511999999999).
 * Números com 10–11 dígitos são tratados como brasileiros (DDD + número) e recebem o DDI 55.
 */
export function normalizeWhatsappNumber(input: string): PhoneResult {
  let digits = (input ?? "").replace(/\D/g, "");
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (!digits) return { ok: false, error: "Informe o número do WhatsApp." };
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
  if (!/^[1-9]\d{9,14}$/.test(digits)) {
    return { ok: false, error: "Número inválido. Use DDI + DDD + número, ex.: 5511999999999." };
  }
  if (digits.startsWith("55") && (digits.length < 12 || digits.length > 13)) {
    return { ok: false, error: "Número brasileiro inválido. Use 55 + DDD + número (12 ou 13 dígitos)." };
  }
  return { ok: true, value: digits };
}

export function isValidWhatsappNumber(value: string | null | undefined): value is string {
  if (!value) return false;
  const r = normalizeWhatsappNumber(value);
  return r.ok && r.value === value;
}

export function buildWhatsappUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

function priceLine(price: number | null, onRequest: boolean): string {
  return onRequest || price === null ? "Preço sob consulta." : `${formatBRL(price)}.`;
}

function oneLine(text: string, max: number): string {
  const flat = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join("; ");
  return flat.length > max ? `${flat.slice(0, max - 1).trimEnd()}…` : flat;
}

const store = (i: { storeName?: string }) => i.storeName ?? "Maq Sublimática";

function withProtocol(lines: string[], protocol?: string | null): string {
  if (protocol) lines.push(`Protocolo: ${protocol}`);
  return lines.join("\n");
}

export type ProductMessageInput = {
  storeName?: string;
  /** Frases editáveis no painel; aceitam {loja}. */
  intro?: string;
  closing?: string;
  name: string;
  categoryName?: string | null;
  price: number | null;
  priceOnRequest: boolean;
  specifications?: string | null;
  url: string;
};

export function buildProductMessage(i: ProductMessageInput, protocol?: string | null): string {
  const lines = [
    fill(i.intro ?? DEFAULT_CONTENT.msg_product_intro, { loja: store(i) }),
    `Produto: ${i.name}.`,
  ];
  if (i.categoryName) lines.push(`Categoria: ${i.categoryName}.`);
  lines.push(`Preço anunciado: ${priceLine(i.price, i.priceOnRequest)}`);
  if (i.specifications?.trim()) lines.push(`Especificações: ${oneLine(i.specifications, 400)}`);
  lines.push(fill(i.closing ?? DEFAULT_CONTENT.msg_product_closing, { loja: store(i) }));
  lines.push(`Link do produto: ${i.url}`);
  return withProtocol(lines, protocol);
}

export type ArtworkMessageInput = {
  storeName?: string;
  intro?: string;
  closing?: string;
  name: string;
  code: string;
  price: number | null;
  priceOnRequest: boolean;
};

export function buildArtworkMessage(i: ArtworkMessageInput, protocol?: string | null): string {
  return withProtocol(
    [
      fill(i.intro ?? DEFAULT_CONTENT.msg_artwork_intro, { loja: store(i) }),
      `Arte: ${i.name}`,
      `Código: ${i.code}`,
      `Preço anunciado: ${i.priceOnRequest || i.price === null ? "Sob consulta" : formatBRL(i.price)}`,
      fill(i.closing ?? DEFAULT_CONTENT.msg_artwork_closing, { loja: store(i) }),
    ],
    protocol,
  );
}

export type ServiceMessageInput = {
  storeName?: string;
  intro?: string;
  closing?: string;
  name: string;
  price: number | null;
  priceOnRequest: boolean;
  leadTime?: string | null;
};

export function buildServiceMessage(i: ServiceMessageInput, protocol?: string | null): string {
  const lines = [
    fill(i.intro ?? DEFAULT_CONTENT.msg_service_intro, { loja: store(i), servico: i.name }),
    `Valor anunciado: ${i.priceOnRequest || i.price === null ? "Sob consulta" : formatBRL(i.price)}`,
  ];
  if (i.leadTime?.trim()) lines.push(`Prazo informado: ${i.leadTime.trim()}`);
  lines.push(fill(i.closing ?? DEFAULT_CONTENT.msg_service_closing, { loja: store(i), servico: i.name }));
  return withProtocol(lines, protocol);
}

export type QuoteMessageInput = {
  storeName?: string;
  intro?: string;
  closing?: string;
  name: string;
  phone?: string | null;
  productType: string;
  quantity?: string | null;
  deadline?: string | null;
  description: string;
  details?: string | null;
  referenceUrl?: string | null;
};

export function buildQuoteMessage(i: QuoteMessageInput, protocol?: string | null): string {
  const lines = [
    fill(i.intro ?? DEFAULT_CONTENT.msg_quote_intro, { loja: store(i) }),
    `Nome: ${i.name}`,
    `Produto ou serviço: ${i.productType}`,
  ];
  if (i.phone?.trim()) lines.push(`Contato: ${i.phone.trim()}`);
  if (i.quantity?.trim()) lines.push(`Quantidade: ${i.quantity.trim()}`);
  if (i.deadline?.trim()) lines.push(`Prazo desejado: ${i.deadline.trim()}`);
  lines.push("Descrição da personalização:", i.description.trim());
  if (i.details?.trim()) lines.push("Cores, tamanhos, materiais e outros detalhes:", i.details.trim());
  if (i.referenceUrl?.trim()) lines.push("Referência:", i.referenceUrl.trim());
  lines.push(fill(i.closing ?? DEFAULT_CONTENT.msg_quote_closing, { loja: store(i) }));
  return withProtocol(lines, protocol);
}
