import Image from "next/image";
import Link from "next/link";
import { deleteRowAction, toggleActiveAction } from "@/app/admin/actions";
import { ToggleActive } from "@/components/admin/forms";
import { PageTitle, TableWrap, td, th } from "@/components/admin/shared";
import { ConfirmDelete } from "@/components/ui/confirm";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/admin";
import type { Banner } from "@/lib/types";

export const metadata = { title: "Banners" };

export default async function BannersAdminPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("banners").select("*").order("display_order").order("created_at");
  const items = (data ?? []) as Banner[];
  return (
    <>
      <PageTitle title="Banners" subtitle="O primeiro banner ativo vira o destaque principal da página inicial; os demais aparecem como promoções." action={{ href: "/admin/banners/novo", label: "Novo banner" }} />
      {items.length === 0 ? (
        <EmptyState title="Nenhum banner">Sem banners, a página inicial usa o destaque padrão.</EmptyState>
      ) : (
        <TableWrap>
          <thead className="border-b border-line bg-paper"><tr><th className={th}>Banner</th><th className={th}>Ordem</th><th className={th}>Link</th><th className={th}>Status</th><th className={th}><span className="sr-only">Ações</span></th></tr></thead>
          <tbody className="divide-y divide-line">
            {items.map((b) => (
              <tr key={b.id}>
                <td className={td}>
                  <div className="flex items-center gap-3">
                    <div className="relative h-12 w-16 overflow-hidden rounded-lg bg-paper">{b.image_url && <Image src={b.image_url} alt="" fill sizes="64px" className="object-cover" unoptimized />}</div>
                    <Link href={`/admin/banners/${b.id}`} className="font-semibold hover:text-brand">{b.title}</Link>
                  </div>
                </td>
                <td className={td}>{b.display_order}</td>
                <td className={`${td} text-xs`}>{b.cta_href ?? "—"}</td>
                <td className={td}><Badge tone={b.active ? "success" : "neutral"}>{b.active ? "Ativo" : "Inativo"}</Badge></td>
                <td className={td}>
                  <div className="flex items-center justify-end gap-2">
                    <ToggleActive active={b.active} action={toggleActiveAction.bind(null, "banners", b.id)} />
                    <Link href={`/admin/banners/${b.id}`} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-paper">Editar</Link>
                    <ConfirmDelete iconOnly title={`Excluir “${b.title}”?`} action={deleteRowAction.bind(null, "banners", b.id)} />
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
