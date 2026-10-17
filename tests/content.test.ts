import { describe, expect, it } from "vitest";
import { ALL_FIELDS, CONTENT_GROUPS, DEFAULT_CONTENT, fill, mergeContent, themeVars, validateField } from "@/lib/content";
import { buildArtworkMessage, buildProductMessage, buildQuoteMessage, buildServiceMessage } from "@/lib/whatsapp";

describe("catálogo de conteúdo editável", () => {
  it("chaves únicas, válidas para o banco e com padrão coerente", () => {
    const keys = ALL_FIELDS.map((f) => f.key);
    expect(new Set(keys).size).toBe(keys.length);
    for (const f of ALL_FIELDS) {
      expect(f.key).toMatch(/^[a-z0-9_]{2,80}$/);
      expect(validateField(f, f.default)).toBeNull();
    }
    expect(CONTENT_GROUPS.length).toBeGreaterThan(8);
    expect(ALL_FIELDS.length).toBeGreaterThan(120);
  });

  it("mescla valores salvos sobre os padrões e ignora chaves desconhecidas ou vazias", () => {
    const c = mergeContent([
      { key: "hero_tagline", value: "Oi gente" },
      { key: "nav_shop", value: "" },
      { key: "chave_inexistente", value: "x" },
    ]);
    expect(c.hero_tagline).toBe("Oi gente");
    expect(c.nav_shop).toBe(DEFAULT_CONTENT.nav_shop);
    expect("chave_inexistente" in c).toBe(false);
    expect(mergeContent(null)).toEqual(DEFAULT_CONTENT);
  });

  it("valida links, imagens, cores e tamanho", () => {
    const f = (k: string) => ALL_FIELDS.find((x) => x.key === k)!;
    expect(validateField(f("hero_cta_href"), "/loja")).toBeNull();
    expect(validateField(f("hero_cta_href"), "https://exemplo.com/x")).toBeNull();
    expect(validateField(f("hero_cta_href"), "javascript:alert(1)")).not.toBeNull();
    expect(validateField(f("hero_image"), "https://x.supabase.co/a.png")).toBeNull();
    expect(validateField(f("hero_image"), "http://inseguro/a.png")).not.toBeNull();
    expect(validateField(f("color_brand"), "#0a7f9c")).toBeNull();
    expect(validateField(f("color_brand"), "azul")).not.toBeNull();
    expect(validateField(f("hero_tagline"), "x".repeat(500))).not.toBeNull();
  });

  it("fill substitui apenas variáveis conhecidas", () => {
    expect(fill("Olá {loja} {x}", { loja: "Maq" })).toBe("Olá Maq {x}");
  });

  it("themeVars gera canais RGB e usa o padrão se a cor for inválida", () => {
    const v = themeVars({ ...DEFAULT_CONTENT, color_brand: "#0a7f9c", color_ink: "invalida" });
    expect(v["--c-brand"]).toBe("10 127 156");
    expect(v["--c-ink"]).toBe("23 23 23");
  });
});

describe("frases editáveis das mensagens do WhatsApp", () => {
  it("usam o texto customizado com {loja} e {servico}", () => {
    expect(buildProductMessage({ name: "Caneca", price: 10, priceOnRequest: false, url: "https://x/y", storeName: "Maq", intro: "Oi! Quero da {loja}.", closing: "Valeu!" })).toMatch(/^Oi! Quero da Maq\.\n[\s\S]*\nValeu!\nLink do produto: https:\/\/x\/y$/);
    expect(buildServiceMessage({ name: "Arte", price: null, priceOnRequest: true, storeName: "Maq", intro: "Serviço {servico} na {loja}", closing: "Obrigado" })).toContain("Serviço Arte na Maq");
    expect(buildArtworkMessage({ name: "A", code: "1", price: null, priceOnRequest: true, intro: "Arte!" })).toMatch(/^Arte!/);
    expect(buildQuoteMessage({ name: "Ana", productType: "X", description: "descrição longa", closing: "Fim" })).toContain("\nFim");
  });
});
