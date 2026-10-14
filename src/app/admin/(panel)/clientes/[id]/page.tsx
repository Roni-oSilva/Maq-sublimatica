import { notFound } from "next/navigation";
import { saveClientAction } from "@/app/admin/actions";
import { ActionForm, F, ImageField } from "@/components/admin/forms";
import { PageTitle, Panel } from "@/components/admin/shared";
import { Checkbox, Input } from "@/components/ui/form";
import { requireAdmin } from "@/lib/admin";
import type { Client } from "@/lib/types";

export const metadata = { title: "Cliente" };

export default async function ClientFormPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireAdmin();
  const isNew = id === "novo";
  const res = isNew ? { data: null } : await supabase.from("clients").select("*").eq("id", id).maybeSingle();
  const c = res.data as Client | null;
  if (!isNew && !c) notFound();
  return (
    <>
      <PageTitle title={isNew ? "Novo cliente" : `Editar: ${c!.name}`} />
      <Panel className="max-w-xl">
        <ActionForm action={saveClientAction} redirectTo="/admin/clientes" successMessage="Cliente salvo.">
          {c && <input type="hidden" name="id" value={c.id} />}
          <F name="name" label="Nome do cliente" required><Input id="name" name="name" defaultValue={c?.name} maxLength={80} required /></F>
          <ImageField name="logo_url" label="Logotipo (opcional)" folder="clientes" defaultValue={c?.logo_url} />
          <F name="display_order" label="Ordem" hint="Menor aparece primeiro."><Input id="display_order" name="display_order" type="number" defaultValue={c?.display_order ?? 0} /></F>
          <Checkbox name="active" label="Exibir no site" defaultChecked={c?.active ?? true} />
        </ActionForm>
      </Panel>
    </>
  );
}
