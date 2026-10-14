import { notFound } from "next/navigation";
import { saveArtworkAction } from "@/app/admin/actions";
import { ActionForm, F, ImageField } from "@/components/admin/forms";
import { PageTitle, Panel, PriceFields } from "@/components/admin/shared";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form";
import { requireAdmin } from "@/lib/admin";
import type { Artwork, Category } from "@/lib/types";

export const metadata = { title: "Arte" };

export default async function ArtworkFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "novo";
  const [{ data: categories }, res] = await Promise.all([
    supabase.from("categories").select("*").eq("kind", "artwork").order("name"),
    isNew ? Promise.resolve({ data: null }) : supabase.from("artworks").select("*").eq("id", id).maybeSingle(),
  ]);
  const a = res.data as Artwork | null;
  if (!isNew && !a) notFound();
  return (
    <>
      <PageTitle title={isNew ? "Nova arte" : `Editar: ${a!.name}`} />
      <Panel className="max-w-3xl">
        <ActionForm action={saveArtworkAction} redirectTo="/admin/artes" successMessage="Arte salva.">
          {a && <input type="hidden" name="id" value={a.id} />}
          <F name="name" label="Nome" required><Input id="name" name="name" defaultValue={a?.name} maxLength={160} required /></F>
          <F name="code" label="Código / identificador" required hint="Único. Ex.: ART-001"><Input id="code" name="code" defaultValue={a?.code} maxLength={40} required /></F>
          <F name="category_id" label="Categoria" hint="Crie categorias do tipo “Artes” em Categorias.">
            <Select id="category_id" name="category_id" defaultValue={a?.category_id ?? ""}>
              <option value="">Sem categoria</option>
              {((categories ?? []) as Category[]).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </F>
          <F name="description" label="Descrição"><Textarea id="description" name="description" rows={4} defaultValue={a?.description ?? ""} maxLength={2000} /></F>
          <PriceFields price={a?.price} onRequest={a?.price_on_request} />
          <ImageField name="image_url" label="Imagem de pré-visualização" folder="artes" defaultValue={a?.image_url} />
          <Checkbox name="active" label="Ativa (visível no site)" defaultChecked={a?.active ?? true} />
        </ActionForm>
      </Panel>
    </>
  );
}
