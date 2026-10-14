import Image from "next/image";
import Link from "next/link";
import { deleteRowAction, toggleActiveAction } from "@/app/admin/actions";
import { ToggleActive } from "@/components/admin/forms";
import { PageTitle, TableWrap, td, th } from "@/components/admin/shared";
import { ConfirmDelete } from "@/components/ui/confirm";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/admin";
import type { Service } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Serviços" };

export default async function ServicesAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("services").select("*, category:categories(id, name, slug)").order("created_at", { ascending: false });
  const items = (data ?? []) as Service[];
  return (
    <>
      <PageTitle title="Serviços" subtitle={`${items.length} cadastrados`} action={{ href: "/admin/servicos/novo", label: "Novo serviço" }} />
      {items.length === 0 ? (
        <EmptyState title="Nenhum serviço cadastrado" />
      ) : (
        <TableWrap>
          <thead className="border-b border-line bg-paper"><tr><th className={th}>Serviço</th><th className={th}>Categoria</th><th className={th}>Preço</th><th className={th}>Prazo</th><th className={th}>Status</th><th className={th}><span className="sr-only">Ações</span></th></tr></thead>
          <tbody className="divide-y divide-line">
            {items.map((s) => (
              <tr key={s.id}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-paper">{s.image_url && <Image src={s.image_url} alt="" fill sizes="48px" className="object-cover" unoptimized />}</div>
                    <Link href={`/admin/servicos/${s.id}`} className="font-semibold hover:text-brand-text">{s.name}</Link>
                  </div>
                </td>
                <td className={td}>{s.category?.name ?? "—"}</td>
                <td className={td}>{formatPrice(s.price, s.price_on_request)}</td>
                <td className={td}>{s.lead_time ?? "—"}</td>
                <td className={td}><Badge tone={s.active ? "success" : "neutral"}>{s.active ? "Ativo" : "Inativo"}</Badge></td>
                <td className={td}>
                  <div className="flex items-center justify-end gap-2">
                    <ToggleActive active={s.active} action={toggleActiveAction.bind(null, "services", s.id)} />
                    <Link href={`/admin/servicos/${s.id}`} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-paper">Editar</Link>
                    <ConfirmDelete iconOnly title={`Excluir “${s.name}”?`} action={deleteRowAction.bind(null, "services", s.id)} />
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
