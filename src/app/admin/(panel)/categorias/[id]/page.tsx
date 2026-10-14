import { notFound } from "next/navigation";
import { saveCategoryAction } from "@/app/admin/actions";
import { ActionForm, F } from "@/components/admin/forms";
import { PageTitle, Panel } from "@/components/admin/shared";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form";
import { requireAdmin } from "@/lib/admin";
import type { Category } from "@/lib/types";

export const metadata = { title: "Categoria" };

export default async function CategoryFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "novo";
  const res = isNew ? { data: null } : await supabase.from("categories").select("*").eq("id", id).maybeSingle();
  const c = res.data as Category | null;
  if (!isNew && !c) notFound();
  return (
    <>
      <PageTitle title={isNew ? "Nova categoria" : `Editar: ${c!.name}`} />
      <Panel className="max-w-xl">
        <ActionForm action={saveCategoryAction} redirectTo="/admin/categorias" successMessage="Categoria salva.">
          {c && <input type="hidden" name="id" value={c.id} />}
          <F name="kind" label="Tipo" required>
            <Select id="kind" name="kind" defaultValue={c?.kind ?? "product"}>
              <option value="product">Produtos</option><option value="artwork">Artes prontas</option><option value="service">Serviços</option>
            </Select>
          </F>
          <F name="name" label="Nome" required><Input id="name" name="name" defaultValue={c?.name} maxLength={80} required /></F>
          <F name="slug" label="Slug" hint="Deixe em branco para gerar a partir do nome."><Input id="slug" name="slug" defaultValue={c?.slug} maxLength={80} /></F>
          <F name="description" label="Descrição"><Textarea id="description" name="description" rows={3} defaultValue={c?.description ?? ""} maxLength={500} /></F>
          <F name="display_order" label="Ordem de exibição" hint="Menor aparece primeiro."><Input id="display_order" name="display_order" type="number" defaultValue={c?.display_order ?? 0} /></F>
          <Checkbox name="active" label="Ativa" defaultChecked={c?.active ?? true} />
        </ActionForm>
      </Panel>
    </>
  );
}
