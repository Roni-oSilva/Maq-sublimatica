import Link from "next/link";
import { deleteRowAction, toggleActiveAction } from "@/app/admin/actions";
import { ToggleActive } from "@/components/admin/forms";
import { PageTitle, TableWrap, td, th } from "@/components/admin/shared";
import { ConfirmDelete } from "@/components/ui/confirm";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";

export const metadata = { title: "Categorias" };
const KIND: Record<string, string> = { product: "Produtos", artwork: "Artes", service: "Serviços" };

export default async function CategoriesAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("categories").select("*").order("kind").order("display_order").order("name");
  const items = (data ?? []) as Category[];
  return (
    <>
      <PageTitle title="Categorias" subtitle="Organize produtos, artes e serviços." action={{ href: "/admin/categorias/novo", label: "Nova categoria" }} />
      {items.length === 0 ? (
        <EmptyState title="Nenhuma categoria cadastrada">Crie categorias para organizar o catálogo e habilitar os filtros da loja.</EmptyState>
      ) : (
        <TableWrap>
          <thead className="border-b border-line bg-paper"><tr><th className={th}>Nome</th><th className={th}>Tipo</th><th className={th}>Slug</th><th className={th}>Status</th><th className={th}><span className="sr-only">Ações</span></th></tr></thead>
          <tbody className="divide-y divide-line">
            {items.map((c) => (
              <tr key={c.id}>
                <td className={`${td} font-semibold`}><Link href={`/admin/categorias/${c.id}`} className="hover:text-brand-text">{c.name}</Link></td>
                <td className={td}>{KIND[c.kind]}</td>
                <td className={`${td} font-mono text-xs`}>{c.slug}</td>
                <td className={td}><Badge tone={c.active ? "success" : "neutral"}>{c.active ? "Ativa" : "Inativa"}</Badge></td>
                <td className={td}>
                  <div className="flex items-center justify-end gap-2">
                    <ToggleActive active={c.active} action={toggleActiveAction.bind(null, "categories", c.id)} />
                    <Link href={`/admin/categorias/${c.id}`} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-paper">Editar</Link>
                    <ConfirmDelete iconOnly title={`Excluir “${c.name}”?`} description="Itens desta categoria ficarão sem categoria." action={deleteRowAction.bind(null, "categories", c.id)} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
