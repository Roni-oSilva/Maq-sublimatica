import { notFound } from "next/navigation";
import { saveServiceAction } from "@/app/admin/actions";
import { ActionForm, F, ImageField } from "@/components/admin/forms";
import { PageTitle, Panel, PriceFields } from "@/components/admin/shared";
import { Checkbox, Input, Select, Textarea } from "@/components/ui/form";
import { requireAdmin } from "@/lib/admin";
import type { Category, Service } from "@/lib/types";

export const metadata = { title: "Serviço" };

export default async function ServiceFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "novo";
  const [{ data: categories }, res] = await Promise.all([
    supabase.from("categories").select("*").eq("kind", "service").order("name"),
    isNew ? Promise.resolve({ data: null }) : supabase.from("services").select("*").eq("id", id).maybeSingle(),
  ]);
  const s = res.data as Service | null;
  if (!isNew && !s) notFound();
  return (
    <>
      <PageTitle title={isNew ? "Novo serviço" : `Editar: ${s!.name}`} />
      <Panel className="max-w-3xl">
        <ActionForm action={saveServiceAction} redirectTo="/admin/servicos" successMessage="Serviço salvo.">
          {s && <input type="hidden" name="id" value={s.id} />}
          <F name="name" label="Nome" required><Input id="name" name="name" defaultValue={s?.name} maxLength={160} required /></F>
          <F name="category_id" label="Categoria" hint="Crie categorias do tipo “Serviços” em Categorias.">
            <Select id="category_id" name="category_id" defaultValue={s?.category_id ?? ""}>
              <option value="">Sem categoria</option>
              {((categories ?? []) as Category[]).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </F>
          <F name="description" label="Descrição"><Textarea id="description" name="description" rows={4} defaultValue={s?.description ?? ""} maxLength={3000} /></F>
          <F name="specifications" label="Especificações" hint="Uma por linha."><Textarea id="specifications" name="specifications" rows={4} defaultValue={s?.specifications ?? ""} maxLength={3000} /></F>
          <F name="lead_time" label="Prazo" hint="Ex.: 3 a 5 dias úteis (opcional)"><Input id="lead_time" name="lead_time" defaultValue={s?.lead_time ?? ""} maxLength={120} /></F>
          <PriceFields price={s?.price} onRequest={s?.price_on_request} />
          <ImageField name="image_url" label="Imagem" folder="servicos" defaultValue={s?.image_url} />
          <Checkbox name="active" label="Ativo (visível no site)" defaultChecked={s?.active ?? true} />
        </ActionForm>
      </Panel>
    </>
  );
}
