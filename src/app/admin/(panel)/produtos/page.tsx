import Link from "next/link";
import Image from "next/image";
import { deleteRowAction, toggleActiveAction } from "@/app/admin/actions";
import { PageTitle, TableWrap, td, th } from "@/components/admin/shared";
import { ToggleActive } from "@/components/admin/forms";
import { Badge, EmptyState } from "@/components/ui/misc";
import { ConfirmDelete } from "@/components/ui/confirm";
import { requireAdmin } from "@/lib/admin";
import type { Product } from "@/lib/types";
import { formatPrice } from "@/lib/utils";

export const metadata = { title: "Produtos" };

export default async function ProductsAdminPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase.from("products").select("*, category:categories(id, name, slug)").order("created_at", { ascending: false });
  const products = (data ?? []) as Product[];
  return (
    <>
      <PageTitle title="Produtos" subtitle={`${products.length} cadastrados`} action={{ href: "/admin/produtos/novo", label: "Novo produto" }} />
      {error && <p role="alert" className="mb-4 text-sm text-red-700">{error.message}</p>}
      {products.length === 0 ? (
        <EmptyState title="Nenhum produto cadastrado">Cadastre o primeiro produto para exibi-lo na loja.</EmptyState>
      ) : (
        <TableWrap>
          <thead className="border-b border-line bg-paper">
            <tr><th className={th}>Produto</th><th className={th}>Categoria</th><th className={th}>Preço</th><th className={th}>Estoque</th><th className={th}>Status</th><th className={th}><span className="sr-only">Ações</span></th></tr>
          </thead>
          <tbody className="divide-y divide-line">
            {products.map((p) => {
              const low = p.track_stock && (p.stock_quantity ?? 0) <= p.low_stock_threshold;
              return (
                <tr key={p.id}>
                  <td className={td}>
                    <div className="flex items-center gap-3">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-paper">
                        {p.image_url && <Image src={p.image_url} alt="" fill sizes="48px" className="object-cover" unoptimized />}
                      </div>
                      <div>
                        <Link href={`/admin/produtos/${p.id}`} className="font-semibold hover:text-brand">{p.name}</Link>
                        <p className="text-xs text-ink-muted">/loja/{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className={td}>{p.category?.name ?? "—"}</td>
                  <td className={td}>{formatPrice(p.price, p.price_on_request)}</td>
                  <td className={td}>{p.track_stock ? <Badge tone={low ? "warning" : "neutral"}>{p.stock_quantity} un.{low ? " · baixo" : ""}</Badge> : "—"}</td>
                  <td className={td}>
                    <div className="flex flex-wrap gap-1.5">
                      <Badge tone={p.active ? "success" : "neutral"}>{p.active ? "Publicado" : "Inativo"}</Badge>
                      {p.featured && <Badge tone="brand">Destaque</Badge>}
                      {!p.available && <Badge tone="warning">Indisponível</Badge>}
                    </div>
                  </td>
                  <td className={td}>
                    <div className="flex items-center justify-end gap-2">
                      <ToggleActive active={p.active} action={toggleActiveAction.bind(null, "products", p.id)} />
                      <Link href={`/admin/produtos/${p.id}`} className="rounded-lg border border-line px-3 py-1.5 text-sm font-semibold hover:bg-paper">Editar</Link>
                      <ConfirmDelete iconOnly title={`Excluir “${p.name}”?`} description="O produto e suas imagens serão removidos permanentemente. Prefira “Desativar” se quiser apenas ocultá-lo da loja." action={deleteRowAction.bind(null, "products", p.id)} />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </TableWrap>
      )}
    </>
  );
}
