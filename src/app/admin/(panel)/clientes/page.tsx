import Image from "next/image";
import Link from "next/link";
import { deleteRowAction, toggleActiveAction } from "@/app/admin/actions";
import { ToggleActive } from "@/components/admin/forms";
import { PageTitle, TableWrap, td, th } from "@/components/admin/shared";
import { ConfirmDelete } from "@/components/ui/confirm";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/admin";
import type { Client } from "@/lib/types";

export const metadata = { title: "Clientes" };

export default async function ClientsAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("clients").select("*").order("display_order").order("created_at");
  const items = (data ?? []) as Client[];
  return (
    <>
      <PageTitle title="Clientes" subtitle="Aparecem na barra rolante “Nossos clientes” da página inicial. Sem logotipo, o nome é exibido." action={{ href: "/admin/clientes/novo", label: "Novo cliente" }} />
      {items.length === 0 ? (
        <EmptyState title="Nenhum cliente cadastrado">A seção “Nossos clientes” fica oculta enquanto não houver clientes ativos.</EmptyState>
      ) : (
        <TableWrap>
          <thead className="border-b border-line bg-paper"><tr><th className={th}>Cliente</th><th className={th}>Ordem</th><th className={th}>Status</th><th className={th}><span className="sr-only">Ações</span></th></tr></thead>
          <tbody className="divide-y divide-line">
            {items.map((c) => (
              <tr key={c.id}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-10 w-16 overflow-hidden rounded-lg bg-paper">{c.logo_url && <Image src={c.logo_url} alt="" fill sizes="64px" className="object-contain" unoptimized />}</div>
                    <Link href={`/admin/clientes/${c.id}`} className="font-semibold hover:text-brand-text">{c.name}</Link>
                  </div>
                </td>
                <td className={td}>{c.display_order}</td>
                <td className={td}><Badge tone={c.active ? "success" : "neutral"}>{c.active ? "Ativo" : "Inativo"}</Badge></td>
                <td className={td}>
                  <div className="flex items-center justify-end gap-2">
                    <ToggleActive active={c.active} action={toggleActiveAction.bind(null, "clients", c.id)} />
                    <Link href={`/admin/clientes/${c.id}`} className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold hover:bg-paper">Editar</Link>
                    <ConfirmDelete iconOnly title={`Excluir “${c.name}”?`} action={deleteRowAction.bind(null, "clients", c.id)} />
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
