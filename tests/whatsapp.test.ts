import { describe, expect, it } from "vitest";
import {
  buildArtworkMessage,
  buildProductMessage,
  buildQuoteMessage,
  buildServiceMessage,
  buildWhatsappUrl,
  isValidWhatsappNumber,
  normalizeWhatsappNumber,
} from "@/lib/whatsapp";

describe("normalizeWhatsappNumber", () => {
  it("adiciona o DDI 55 a números nacionais", () => {
    expect(normalizeWhatsappNumber("(11) 99999-9999")).toEqual({ ok: true, value: "5511999999999" });
    expect(normalizeWhatsappNumber("11 3333-4444")).toEqual({ ok: true, value: "551133334444" });
  });
  it("aceita formato internacional", () => {
    expect(normalizeWhatsappNumber("+55 (11) 99999-9999")).toEqual({ ok: true, value: "5511999999999" });
    expect(normalizeWhatsappNumber("00351912345678")).toEqual({ ok: true, value: "351912345678" });
  });
  it("rejeita números inválidos", () => {
    expect(normalizeWhatsappNumber("").ok).toBe(false);
    expect(normalizeWhatsappNumber("123").ok).toBe(false);
    expect(normalizeWhatsappNumber("5511999").ok).toBe(false);
    expect(normalizeWhatsappNumber("551199999999999").ok).toBe(false);
  });
  it("isValidWhatsappNumber exige formato já normalizado", () => {
    expect(isValidWhatsappNumber("5511999999999")).toBe(true);
    expect(isValidWhatsappNumber("(11) 99999-9999")).toBe(false);
    expect(isValidWhatsappNumber(null)).toBe(false);
  });
});

describe("buildWhatsappUrl", () => {
  it("usa wa.me e codifica a mensagem preservando acentos, quebras e símbolos", () => {
    const msg = "Olá! Preço: R$ 850,00 & cia\nLinha 2 #1";
    const url = buildWhatsappUrl("5511999999999", msg);
    expect(url.startsWith("https://wa.me/5511999999999?text=")).toBe(true);
    expect(url).not.toMatch(/[\n ]/);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(msg);
  });
});

describe("mensagens", () => {
  const base = {
    name: "Prensa Térmica 38x38",
    categoryName: "Equipamentos para Sublimação",
    price: 850,
    priceOnRequest: false,
    specifications: "Área de prensagem: 38x38 cm\nVoltagem: 220V",
    url: "https://maq.example/loja/prensa-termica-38x38",
  };

  it("monta a mensagem de produto com dados reais", () => {
    const m = buildProductMessage(base);
    expect(m).toContain("Olá! Tenho interesse neste produto da Maq Sublimática.");
    expect(m).toContain("Produto: Prensa Térmica 38x38.");
    expect(m).toContain("Categoria: Equipamentos para Sublimação.");
    expect(m).toContain("Preço anunciado: R$ 850,00.");
    expect(m).toContain("Especificações: Área de prensagem: 38x38 cm; Voltagem: 220V");
    expect(m).toContain("Link do produto: https://maq.example/loja/prensa-termica-38x38");
    expect(m).not.toContain("Protocolo");
  });

  it("não inventa preço quando é sob consulta", () => {
    const m = buildProductMessage({ ...base, price: null, priceOnRequest: true });
    expect(m).toContain("Preço sob consulta.");
    expect(m).not.toMatch(/R\$/);
    expect(buildProductMessage({ ...base, price: 100, priceOnRequest: true })).not.toMatch(/R\$/);
  });

  it("inclui protocolo e omite campos vazios", () => {
    const m = buildProductMessage({ ...base, categoryName: null, specifications: "  " }, "PED-2026-000001");
    expect(m).not.toContain("Categoria");
    expect(m).not.toContain("Especificações");
    expect(m.endsWith("Protocolo: PED-2026-000001")).toBe(true);
  });

  it("limita especificações muito longas", () => {
    const m = buildProductMessage({ ...base, specifications: "x".repeat(2000) });
    expect(m.length).toBeLessThan(900);
  });

  it("mensagem de arte", () => {
    const m = buildArtworkMessage({ name: "Floral", code: "ART-01", price: null, priceOnRequest: true });
    expect(m).toContain("Arte: Floral");
    expect(m).toContain("Código: ART-01");
    expect(m).toContain("Preço anunciado: Sob consulta");
  });

  it("mensagem de serviço com prazo", () => {
    const m = buildServiceMessage({ name: "Criação de arte", price: 120, priceOnRequest: false, leadTime: "3 dias úteis" });
    expect(m).toContain('"Criação de arte"');
    expect(m).toContain("Valor anunciado: R$ 120,00");
    expect(m).toContain("Prazo informado: 3 dias úteis");
  });

  it("mensagem de orçamento preserva o texto livre do cliente", () => {
    const description = "Quero 50 canecas\ncom a logo & slogan “Feito à mão” 100%";
    const m = buildQuoteMessage({ name: "Ana", productType: "Canecas", quantity: "50", deadline: "20/12", description, referenceUrl: "https://x.com/a?b=1&c=2" }, "ORC-2026-000007");
    expect(m).toContain("Nome: Ana");
    expect(m).toContain("Produto ou serviço: Canecas");
    expect(m).toContain("Quantidade: 50");
    expect(m).toContain(`Descrição da personalização:\n${description}`);
    expect(m).toContain("Referência:\nhttps://x.com/a?b=1&c=2");
    expect(m).toContain("Protocolo: ORC-2026-000007");
    const url = buildWhatsappUrl("5511999999999", m);
    expect(decodeURIComponent(url.split("?text=")[1])).toBe(m);
  });
});
