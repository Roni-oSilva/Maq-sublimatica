import { notFound } from "next/navigation";
import { saveBannerAction } from "@/app/admin/actions";
import { ActionForm, F, ImageField } from "@/components/admin/forms";
import { PageTitle, Panel } from "@/components/admin/shared";
import { Checkbox, Input, Select } from "@/components/ui/form";
import { requireAdmin } from "@/lib/admin";
import type { Banner } from "@/lib/types";

export const metadata = { title: "Banner" };

export default async function BannerFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "novo";
  const res = isNew ? { data: null } : await supabase.from("banners").select("*").eq("id", id).maybeSingle();
  const b = res.data as Banner | null;
  if (!isNew && !b) notFound();
  return (
    <>
      <PageTitle title={isNew ? "Novo banner" : `Editar: ${b!.title}`} />
      <Panel className="max-w-xl">
        <ActionForm action={saveBannerAction} redirectTo="/admin/banners" successMessage="Banner salvo.">
          {b && <input type="hidden" name="id" value={b.id} />}
          <F name="placement" label="Onde exibir" hint="“Destaque” substitui o título principal da página inicial (usa o primeiro ativo). “Promoção” aparece como cartão abaixo do topo.">
            <Select id="placement" name="placement" defaultValue={b?.placement ?? "promo"}>
              <option value="promo">Promoção (cartões)</option><option value="hero">Destaque principal (topo)</option>
            </Select>
          </F>
          <F name="title" label="Título" required><Input id="title" name="title" defaultValue={b?.title} maxLength={120} required /></F>
          <F name="subtitle" label="Subtítulo"><Input id="subtitle" name="subtitle" defaultValue={b?.subtitle ?? ""} maxLength={300} /></F>
          <ImageField name="image_url" label="Imagem" folder="banners" defaultValue={b?.image_url} />
          <div className="grid gap-4 sm:grid-cols-2">
            <F name="cta_label" label="Texto do botão"><Input id="cta_label" name="cta_label" defaultValue={b?.cta_label ?? ""} maxLength={40} placeholder="Ver ofertas" /></F>
            <F name="cta_href" label="Link do botão" hint="Ex.: /loja ou https://…"><Input id="cta_href" name="cta_href" defaultValue={b?.cta_href ?? ""} placeholder="/loja" /></F>
          </div>
          <F name="display_order" label="Ordem" hint="Menor aparece primeiro."><Input id="display_order" name="display_order" type="number" defaultValue={b?.display_order ?? 0} /></F>
          <Checkbox name="active" label="Ativo" defaultChecked={b?.active ?? true} />
        </ActionForm>
      </Panel>
    </>
  );
}
