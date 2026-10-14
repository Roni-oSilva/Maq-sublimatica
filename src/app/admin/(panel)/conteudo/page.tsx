import Link from "next/link";
import { resetContentGroupAction, saveContentAction } from "@/app/admin/actions";
import { ActionForm, ColorField, F, ImageField } from "@/components/admin/forms";
import { PageTitle, Panel } from "@/components/admin/shared";
import { ConfirmDelete } from "@/components/ui/confirm";
import { Input, Textarea } from "@/components/ui/form";
import { requireAdmin } from "@/lib/admin";
import { CONTENT_GROUPS, mergeContent } from "@/lib/content";
import { cn } from "@/lib/utils";

export const metadata = { title: "Textos e imagens" };

export default async function ContentAdminPage({ searchParams }: { searchParams: Promise<{ g?: string }> }) {
  const { g } = await searchParams;
  const { supabase } = await requireAdmin();
  const group = CONTENT_GROUPS.find((x) => x.id === g) ?? CONTENT_GROUPS[0];
  const { data } = await supabase.from("site_content").select("key, value");
  const values = mergeContent(data);
  const customized = new Set((data ?? []).map((r) => r.key as string));
  const short = (s: string) => (s.length > 90 ? `${s.slice(0, 90)}…` : s);

  return (
    <>
      <PageTitle title="Textos e imagens" subtitle="Edite qualquer texto, link, imagem ou cor do site. Campo em branco = volta ao texto padrão." />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <nav aria-label="Seções do site" className="lg:sticky lg:top-6 lg:self-start">
          <ul className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:gap-1 lg:overflow-visible">
            {CONTENT_GROUPS.map((x) => {
              const n = x.fields.filter((f) => customized.has(f.key)).length;
              return (
                <li key={x.id} className="shrink-0">
                  <Link
                    href={`/admin/conteudo?g=${x.id}`}
                    aria-current={x.id === group.id ? "page" : undefined}
                    className={cn("flex items-center justify-between gap-3 rounded-2xl px-4 py-2.5 text-sm font-semibold", x.id === group.id ? "bg-ink text-white" : "bg-white hover:bg-ink/5 lg:bg-transparent")}
                  >
                    {x.title}
                    {n > 0 && <span className={cn("rounded-full px-2 py-0.5 text-xs", x.id === group.id ? "bg-brand text-ink" : "bg-brand-light text-brand-text")}>{n}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <Panel key={group.id}>
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xl">{group.title}</h2>
              <p className="max-w-2xl text-sm text-ink-muted">{group.description}</p>
            </div>
            <ConfirmDelete
              action={resetContentGroupAction.bind(null, group.id)}
              label="Restaurar padrões"
              confirmLabel="Restaurar"
              successMessage="Padrões restaurados."
              title="Restaurar os textos padrão desta seção?"
              description="Todos os textos, links, imagens e cores personalizados desta seção serão descartados."
            />
          </div>
          <ActionForm action={saveContentAction} successMessage="Alterações salvas. O site já está atualizado." submitLabel="Salvar seção">
            <input type="hidden" name="_group" value={group.id} />
            <div className="grid gap-5 sm:grid-cols-2">
              {group.fields.map((f) => {
                const def = f.default ? `Padrão: “${short(f.default)}”` : undefined;
                const hint = [f.hint, def].filter(Boolean).join(" ");
                if (f.type === "image") {
                  return (
                    <div key={f.key} className="sm:col-span-2">
                      <ImageField name={f.key} label={f.label} folder="site" defaultValue={values[f.key] || null} />
                      {f.hint && <p className="-mt-1 text-xs text-ink-muted">{f.hint}</p>}
                    </div>
                  );
                }
                if (f.type === "color") return <ColorField key={f.key} name={f.key} label={f.label} hint={f.hint} defaultValue={values[f.key]} />;
                if (f.type === "textarea") {
                  return (
                    <F key={f.key} name={f.key} label={f.label} hint={hint} className="sm:col-span-2">
                      <Textarea id={f.key} name={f.key} rows={3} defaultValue={values[f.key]} maxLength={f.max} />
                    </F>
                  );
                }
                return (
                  <F key={f.key} name={f.key} label={f.label} hint={hint}>
                    <Input id={f.key} name={f.key} defaultValue={values[f.key]} maxLength={f.max} />
                  </F>
                );
              })}
            </div>
          </ActionForm>
        </Panel>
      </div>
    </>
  );
}
