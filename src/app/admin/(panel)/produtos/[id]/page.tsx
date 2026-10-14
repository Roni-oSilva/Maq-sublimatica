import { notFound } from "next/navigation";
import { saveProductAction } from "@/app/admin/actions";
import { ActionForm, F, GalleryField, ImageField } from "@/components/admin/forms";
import { PageTitle, Panel, PriceFields } from "@/components/admin/shared";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form";
import { requireAdmin } from "@/lib/admin";
import type { Category, Product, ProductImage } from "@/lib/types";

export const metadata = { title: "Produto" };

export default async function ProductFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "novo";
  const [{ data: categories }, productRes, imagesRes] = await Promise.all([
    supabase.from("categories").select("*").eq("kind", "product").order("name"),
    isNew ? Promise.resolve({ data: null }) : supabase.from("products").select("*").eq("id", id).maybeSingle(),
    isNew ? Promise.resolve({ data: [] }) : supabase.from("product_images").select("*").eq("product_id", id).order("display_order"),
  ]);
  const p = productRes.data as Product | null;
  if (!isNew && !p) notFound();
  const gallery = ((imagesRes.data ?? []) as ProductImage[]).map((i) => i.image_url);

  return (
    <>
      <PageTitle title={isNew ? "Novo produto" : `Editar: ${p!.name}`} />
      <Panel className="max-w-3xl">
        <ActionForm action={saveProductAction} redirectTo="/admin/produtos" successMessage="Produto salvo.">
          {p && <input type="hidden" name="id" value={p.id} />}
          <F name="name" label="Nome" required><Input id="name" name="name" defaultValue={p?.name} maxLength={160} required /></F>
          <F name="slug" label="Slug (URL)" hint="Deixe em branco para gerar a partir do nome. A URL será /loja/slug."><Input id="slug" name="slug" defaultValue={p?.slug} maxLength={80} /></F>
          <F name="category_id" label="Categoria">
            <Select id="category_id" name="category_id" defaultValue={p?.category_id ?? ""}>
              <option value="">Sem categoria</option>
              {((categories ?? []) as Category[]).map((c) => <option key={c.id} value={c.id}>{c.name}{c.active ? "" : " (inativa)"}</option>)}
            </Select>
          </F>
          <F name="description" label="Descrição"><Textarea id="description" name="description" rows={5} defaultValue={p?.description ?? ""} maxLength={5000} /></F>
          <F name="specifications" label="Especificações técnicas" hint="Uma por linha, no formato “Item: valor”. Ex.: Área de prensagem: 38x38 cm">
            <Textarea id="specifications" name="specifications" rows={5} defaultValue={p?.specifications ?? ""} maxLength={5000} />
          </F>
          <PriceFields price={p?.price} onRequest={p?.price_on_request} />
          <ImageField name="image_url" label="Imagem principal" folder="produtos" defaultValue={p?.image_url} />
          <GalleryField folder="produtos" defaultValue={gallery} />

          <fieldset className="grid gap-1 rounded-xl border border-line p-4 sm:grid-cols-2">
            <legend className="px-1 text-sm font-bold">Publicação e disponibilidade</legend>
            <Checkbox name="active" label="Publicado (visível na loja)" defaultChecked={p?.active ?? true} />
            <Checkbox name="featured" label="Destaque na página inicial" defaultChecked={p?.featured ?? false} />
            <Checkbox name="available" label="Disponível para pedido" defaultChecked={p?.available ?? true} />
          </fieldset>

          <fieldset className="grid gap-4 rounded-xl border border-line p-4 sm:grid-cols-3 sm:items-end">
            <legend className="px-1 text-sm font-bold">Controle de estoque (opcional)</legend>
            <Checkbox name="track_stock" label="Controlar estoque" defaultChecked={p?.track_stock ?? false} />
            <F name="stock_quantity" label="Quantidade em estoque"><Input id="stock_quantity" name="stock_quantity" type="number" min={0} defaultValue={p?.stock_quantity ?? ""} /></F>
            <F name="low_stock_threshold" label="Alerta de estoque baixo (≤)"><Input id="low_stock_threshold" name="low_stock_threshold" type="number" min={0} defaultValue={p?.low_stock_threshold ?? 5} /></F>
          </fieldset>
        </ActionForm>
      </Panel>
    </>
  );
}
