import { z } from "zod";
import { normalizeWhatsappNumber } from "./whatsapp";
import { parseMoney, slugify } from "./utils";

/** Remove caracteres de controle (exceto quebras de linha e tabs) e espaços nas pontas. */
export function cleanText(value: string): string {
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
}

const text = (min: number, max: number, label: string) =>
  z
    .string({ message: `${label} é obrigatório.` })
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(min, min <= 1 ? `${label} é obrigatório.` : `${label} deve ter ao menos ${min} caracteres.`)
        .max(max, `${label} deve ter no máximo ${max} caracteres.`),
    );

const optionalText = (max: number, label: string) =>
  z
    .string()
    .transform(cleanText)
    .pipe(z.string().max(max, `${label} deve ter no máximo ${max} caracteres.`))
    .optional()
    .transform((v) => v || undefined);

const optionalPhone = z
  .string()
  .transform((v) => v.replace(/\D/g, ""))
  .pipe(z.string().regex(/^(\d{8,15})?$/, "Telefone inválido. Informe DDD + número."))
  .optional()
  .transform((v) => v || undefined);

const optionalUrl = z
  .string()
  .transform(cleanText)
  .pipe(
    z.string().refine((v) => v === "" || /^https?:\/\/[^\s]+$/i.test(v), "Informe um link começando com http:// ou https://."),
  )
  .optional()
  .transform((v) => v || undefined);

// ---------- Público ----------
export const quoteSchema = z.object({
  customerName: text(2, 120, "Nome"),
  customerPhone: optionalPhone,
  productType: text(2, 160, "Produto ou serviço desejado"),
  quantity: optionalText(60, "Quantidade"),
  deadline: optionalText(120, "Prazo desejado"),
  description: text(10, 1500, "Descrição"),
  details: optionalText(800, "Detalhes"),
  referenceUrl: optionalUrl,
});
export type QuoteInput = z.infer<typeof quoteSchema>;

export const orderItemSchema = z.object({
  kind: z.enum(["product", "artwork", "service"]),
  id: z.guid(),
  quantity: z.number().int().min(1).max(999).default(1),
});

// ---------- Admin ----------
const id = z.guid().optional().or(z.literal("").transform(() => undefined));
const bool = z.preprocess((v) => v === "on" || v === "true" || v === true, z.boolean());
const money = z.preprocess(
  (v) => (typeof v === "string" ? parseMoney(v) : null),
  z.number().min(0).max(99999999).nullable(),
);
const intOrNull = z.preprocess((v) => {
  if (typeof v !== "string" || v.trim() === "") return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}, z.number().int().min(0).max(1000000).nullable());
const imageUrl = z
  .string()
  .optional()
  .transform((v) => (v ? cleanText(v) : null))
  .pipe(z.string().url("URL de imagem inválida.").nullable());

function priceRule<T extends { price: number | null; price_on_request: boolean }>(v: T, ctx: z.RefinementCtx) {
  if (!v.price_on_request && v.price === null) {
    ctx.addIssue({ code: "custom", path: ["price"], message: "Informe o preço ou marque “Preço sob consulta”." });
  }
}

export const categorySchema = z.object({
  id,
  kind: z.enum(["product", "artwork", "service"]),
  name: text(2, 80, "Nome"),
  slug: z.string().optional(),
  description: optionalText(500, "Descrição"),
  active: bool,
  display_order: z.preprocess((v) => Number(v) || 0, z.number().int().min(-9999).max(9999)),
});

export const productSchema = z
  .object({
    id,
    name: text(2, 160, "Nome"),
    slug: z.string().optional(),
    description: optionalText(5000, "Descrição"),
    specifications: optionalText(5000, "Especificações"),
    price: money,
    price_on_request: bool,
    category_id: id,
    image_url: imageUrl,
    gallery: z.string().optional(),
    active: bool,
    featured: bool,
    available: bool,
    track_stock: bool,
    stock_quantity: intOrNull,
    low_stock_threshold: intOrNull,
  })
  .superRefine(priceRule)
  .superRefine((v, ctx) => {
    if (v.track_stock && v.stock_quantity === null) {
      ctx.addIssue({ code: "custom", path: ["stock_quantity"], message: "Informe a quantidade em estoque." });
    }
  });

export const artworkSchema = z
  .object({
    id,
    name: text(2, 160, "Nome"),
    code: text(1, 40, "Código"),
    description: optionalText(2000, "Descrição"),
    category_id: id,
    image_url: imageUrl,
    price: money,
    price_on_request: bool,
    active: bool,
  })
  .superRefine(priceRule);

export const serviceSchema = z
  .object({
    id,
    name: text(2, 160, "Nome"),
    description: optionalText(3000, "Descrição"),
    specifications: optionalText(3000, "Especificações"),
    lead_time: optionalText(120, "Prazo"),
    category_id: id,
    image_url: imageUrl,
    price: money,
    price_on_request: bool,
    active: bool,
  })
  .superRefine(priceRule);

export const bannerSchema = z.object({
  id,
  title: text(2, 120, "Título"),
  subtitle: optionalText(300, "Subtítulo"),
  image_url: imageUrl,
  cta_label: optionalText(40, "Texto do botão"),
  cta_href: z
    .string()
    .optional()
    .transform((v) => (v ? cleanText(v) : undefined))
    .pipe(z.string().regex(/^(\/|https?:\/\/)\S*$/, "Use um caminho (/loja) ou um link completo.").optional()),
  display_order: z.preprocess((v) => Number(v) || 0, z.number().int().min(-9999).max(9999)),
  active: bool,
});

const socialUrl = z
  .string()
  .optional()
  .transform((v) => (v ? cleanText(v) : undefined))
  .pipe(z.string().regex(/^https?:\/\/\S+$/i, "Informe um link completo (https://…).").optional());

export const settingsSchema = z.object({
  store_name: text(2, 80, "Nome comercial"),
  whatsapp_number: z
    .string()
    .optional()
    .transform((v, ctx) => {
      if (!v || !v.trim()) return null;
      const r = normalizeWhatsappNumber(v);
      if (!r.ok) {
        ctx.addIssue({ code: "custom", message: r.error });
        return z.NEVER;
      }
      return r.value;
    }),
  logo_url: imageUrl,
  default_whatsapp_message: text(5, 500, "Mensagem padrão"),
  instagram: socialUrl,
  facebook: socialUrl,
  tiktok: socialUrl,
  youtube: socialUrl,
  email: z
    .string()
    .optional()
    .transform((v) => (v ? cleanText(v) : undefined))
    .pipe(z.string().email("E-mail inválido.").optional()),
  phone: optionalText(40, "Telefone"),
  address: optionalText(300, "Endereço"),
  hours: optionalText(200, "Horário de atendimento"),
  about_text: optionalText(8000, "Sobre a empresa"),
  policies_text: optionalText(12000, "Políticas da loja"),
});

export const recordUpdateSchema = z.object({
  id: z.guid(),
  table: z.enum(["orders", "custom_quotes"]),
  status: z.enum(["new", "in_progress", "awaiting_payment", "confirmed", "completed", "cancelled"]),
  admin_notes: optionalText(2000, "Observações"),
  total_amount: money.optional(),
});

export function ensureSlug(slug: string | undefined, name: string): string {
  return slugify(slug && slug.trim() ? slug : name) || "item";
}

export type FieldErrors = Record<string, string>;

export function flattenErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "_");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
