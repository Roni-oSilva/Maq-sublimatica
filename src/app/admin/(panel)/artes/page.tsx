import Image from "next/image";
import Link from "next/link";
import { deleteRowAction, toggleActiveAction } from "@/app/admin/actions";
import { ToggleActive } from "@/components/admin/forms";
import { PageTitle, TableWrap, td, th } from "@/components/admin/shared";
import { ConfirmDelete } from "@/components/ui/confirm";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/admin";
import type { Artwork } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Artes prontas" };

export default async function ArtworksAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("artworks").select("*, category:categories(id, name, slug)").order("created_at", { ascending: false });
  const items = (data ?? []) as Artwork[];
  return (
    <>
      <PageTitle title="Artes prontas" subtitle={`${items.length} cadastradas`} action={{ href: "/admin/artes/novo", label: "Nova arte" }} />
      {items.length === 0 ? (
        <EmptyState title="Nenhuma arte cadastrada" />
      ) : (
        <TableWrap>
          <thead className="border-b border-line bg-paper"><tr><th className={th}>Arte</th><th className={th}>Código</th><th className={th}>Preço</th><th className={th}>Status</th><th className={th}><span className="sr-only">Ações</span></th></tr></thead>
          <tbody className="divide-y divide-line">
            {items.map((a) => (
              <tr key={a.id}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 overflow-hidden rounded-lg bg-paper">{a.image_url && <Image src={a.image_url} alt="" fill sizes="48px" className="object-cover" unoptimized />}</div>
                    <Link href={`/admin/artes/${a.id}`} className="font-semibold hover:text-brand">{a.name}</Link>
                  </div>
                </td>
                <td className={`${td} font-mono`}>{a.code}</td>
                <td className={td}>{formatPrice(a.price, a.price_on_request)}</td>
                <td className={td}><Badge tone={a.active ? "success" : "neutral"}>{a.active ? "Ativa" : "Inativa"}</Badge></td>
                <td className={td}>
                  <div className="flex items-center justify-end gap-2">
                    <ToggleActive active={a.active} action={toggleActiveAction.bind(null, "artworks", a.id)} />
                    <Link href={`/admin/artes/${a.id}`} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-paper">Editar</Link>
                    <ConfirmDelete iconOnly title={`Excluir “${a.name}”?`} action={deleteRowAction.bind(null, "artworks", a.id)} />
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
