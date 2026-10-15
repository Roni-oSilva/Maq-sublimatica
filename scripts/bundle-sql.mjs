// Junta todas as migrações em um único arquivo para colar de uma vez no SQL Editor do Supabase.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

export function buildBundle(root = process.cwd()) {
  const dir = join(root, "supabase/migrations");
  const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
  const header = [
    "-- =====================================================================",
    "-- MAQ SUBLIMÁTICA — instalação completa do banco (gerado automaticamente)",
    "-- Cole este arquivo inteiro no Supabase → SQL Editor e clique em Run.",
    "-- Rode UMA vez, em um projeto novo. Não edite: regenere com `npm run db:bundle`.",
    "-- =====================================================================",
    "",
  ].join("\n");
  return header + files.map((f) => `-- ---------- ${f} ----------\n${readFileSync(join(dir, f), "utf8").trim()}\n`).join("\n");
}

if (import.meta.url === `file://${process.argv[1]}`) {
  writeFileSync(join(process.cwd(), "supabase/setup-completo.sql"), buildBundle());
  console.log("supabase/setup-completo.sql atualizado");
}
