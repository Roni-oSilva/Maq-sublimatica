import { describe, expect, it } from "vitest";
import { detectImageType, validateImage, MAX_IMAGE_BYTES } from "@/lib/images";
import { formatPrice, monthLabel, parseMoney, slugify, escapeLike } from "@/lib/utils";
import { artworkSchema, productSchema, quoteSchema, settingsSchema } from "@/lib/validation";

describe("utils", () => {
  it("parseMoney entende formato brasileiro", () => {
    expect(parseMoney("850")).toBe(850);
    expect(parseMoney("1.234,56")).toBe(1234.56);
    expect(parseMoney("R$ 850,5")).toBe(850.5);
    expect(parseMoney("")).toBeNull();
    expect(parseMoney("abc")).toBeNull();
  });
  it("formatPrice", () => {
    expect(formatPrice(850, false)).toBe("R$ 850,00");
    expect(formatPrice(850, true)).toBe("Sob consulta");
    expect(formatPrice(null, false)).toBe("Sob consulta");
  });
  it("slugify remove acentos", () => {
    expect(slugify("Prensa Térmica 38x38!")).toBe("prensa-termica-38x38");
  });
  it("monthLabel", () => {
    expect(monthLabel("2026-03")).toBe("mar/26");
  });
  it("escapeLike", () => {
    expect(escapeLike("100%_a")).toBe("100\\%\\_a");
  });
});

describe("quoteSchema", () => {
  const valid = { customerName: "Ana", productType: "Canecas", description: "Quero 50 canecas personalizadas" };
  it("aceita o mínimo obrigatório", () => {
    expect(quoteSchema.safeParse(valid).success).toBe(true);
  });
  it("exige nome, tipo e descrição", () => {
    const r = quoteSchema.safeParse({ customerName: "", productType: "", description: "curta" });
    expect(r.success).toBe(false);
  });
  it("valida link e telefone", () => {
    expect(quoteSchema.safeParse({ ...valid, referenceUrl: "javascript:alert(1)" }).success).toBe(false);
    expect(quoteSchema.safeParse({ ...valid, referenceUrl: "https://exemplo.com/x" }).success).toBe(true);
    expect(quoteSchema.safeParse({ ...valid, customerPhone: "123" }).success).toBe(false);
    const ok = quoteSchema.safeParse({ ...valid, customerPhone: "(11) 98888-7777" });
    expect(ok.success && ok.data.customerPhone).toBe("11988887777");
  });
  it("remove caracteres de controle e preserva quebras de linha", () => {
    const r = quoteSchema.safeParse({ ...valid, description: "linha 1\nlinha 2\u0000 ok" });
    expect(r.success && r.data.description).toBe("linha 1\nlinha 2 ok");
  });
});

describe("schemas administrativos", () => {
  it("produto exige preço ou sob consulta", () => {
    const base = { name: "Prensa", price: "", price_on_request: "" };
    expect(productSchema.safeParse(base).success).toBe(false);
    expect(productSchema.safeParse({ ...base, price: "850,00" }).success).toBe(true);
    expect(productSchema.safeParse({ ...base, price_on_request: "on" }).success).toBe(true);
  });
  it("produto com estoque exige quantidade", () => {
    const r = productSchema.safeParse({ name: "Prensa", price: "10", track_stock: "on", stock_quantity: "" });
    expect(r.success).toBe(false);
  });
  it("arte exige código", () => {
    expect(artworkSchema.safeParse({ name: "Floral", code: "", price_on_request: "on" }).success).toBe(false);
    expect(artworkSchema.safeParse({ name: "Floral", code: "A1", price_on_request: "on" }).success).toBe(true);
  });
  it("configurações normalizam e validam o WhatsApp", () => {
    const base = { store_name: "Maq", default_whatsapp_message: "Olá, tudo bem?" };
    const ok = settingsSchema.safeParse({ ...base, whatsapp_number: "(11) 99999-9999" });
    expect(ok.success && ok.data.whatsapp_number).toBe("5511999999999");
    expect(settingsSchema.safeParse({ ...base, whatsapp_number: "12" }).success).toBe(false);
    const empty = settingsSchema.safeParse({ ...base, whatsapp_number: "" });
    expect(empty.success && empty.data.whatsapp_number).toBeNull();
    expect(settingsSchema.safeParse({ ...base, instagram: "instagram.com/x" }).success).toBe(false);
  });
});

describe("validação de imagens", () => {
  const png = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0, 0, 0, 0]);
  it("detecta o tipo pelos bytes", () => {
    expect(detectImageType(png)).toBe("image/png");
    expect(detectImageType(new Uint8Array([0xff, 0xd8, 0xff, 0xe0]))).toBe("image/jpeg");
    expect(detectImageType(new TextEncoder().encode("RIFF0000WEBPVP8 "))).toBe("image/webp");
    expect(detectImageType(new TextEncoder().encode("<svg onload=alert(1)>"))).toBeNull();
  });
  it("rejeita vazio, grande demais e tipo inválido", () => {
    expect(validateImage(new Uint8Array()).ok).toBe(false);
    const big = new Uint8Array(MAX_IMAGE_BYTES + 1);
    big.set(png);
    expect(validateImage(big).ok).toBe(false);
    expect(validateImage(new TextEncoder().encode("GIF89a....")).ok).toBe(false);
    expect(validateImage(png).ok).toBe(true);
  });
});

import { newPasswordSchema } from "@/lib/validation";

describe("nova senha", () => {
  it("exige 8+ caracteres, letras e números, e confirmação igual", () => {
    expect(newPasswordSchema.safeParse({ password: "abc12", confirm: "abc12" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "somenteletras", confirm: "somenteletras" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "12345678", confirm: "12345678" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "senha1234", confirm: "senha9999" }).success).toBe(false);
    expect(newPasswordSchema.safeParse({ password: "Maq@2026ok", confirm: "Maq@2026ok" }).success).toBe(true);
  });
});
