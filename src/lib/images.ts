export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"] as const;
const EXT: Record<string, string> = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/avif": "avif" };

/** Detecta o tipo real do arquivo pelos primeiros bytes (não confia no nome nem no Content-Type enviado). */
export function detectImageType(b: Uint8Array): (typeof ALLOWED_IMAGE_TYPES)[number] | null {
  if (b.length >= 3 && b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return "image/jpeg";
  if (b.length >= 8 && b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 && b[4] === 0x0d && b[5] === 0x0a && b[6] === 0x1a && b[7] === 0x0a) return "image/png";
  const ascii = (from: number, len: number) => String.fromCharCode(...b.slice(from, from + len));
  if (b.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") return "image/webp";
  if (b.length >= 12 && ascii(4, 4) === "ftyp" && /^(avif|avis)$/.test(ascii(8, 4))) return "image/avif";
  return null;
}

export function extensionFor(type: string): string {
  return EXT[type] ?? "bin";
}

export type ImageCheck = { ok: true; type: (typeof ALLOWED_IMAGE_TYPES)[number] } | { ok: false; error: string };

export function validateImage(bytes: Uint8Array): ImageCheck {
  if (bytes.length === 0) return { ok: false, error: "Arquivo vazio." };
  if (bytes.length > MAX_IMAGE_BYTES) return { ok: false, error: "A imagem deve ter no máximo 4 MB." };
  const type = detectImageType(bytes);
  if (!type) return { ok: false, error: "Formato não suportado. Use JPG, PNG, WebP ou AVIF." };
  return { ok: true, type };
}
