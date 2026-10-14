import { ChevronDown } from "lucide-react";
import { PageTitle } from "@/components/admin/shared";
import { RecordEditor } from "@/components/admin/record-editor";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { Badge, EmptyState } from "@/components/ui/misc";
import { requireAdmin } from "@/lib/admin";
import { ORDER_STATUSES, STATUS_LABELS, type Order, type OrderStatus, type Quote } from "@/lib/types";
import { formatBRL, formatDateTime } from "@/lib/utils";

export const metadata = { title: "Pedidos e orçamentos" };

const TONE: Record<OrderStatus, "info" | "warning" | "brand" | "success" | "neutral" | "danger"> = {
  new: "info",
  in_progress: "brand",
  awaiting_payment: "warning",
  confirmed: "success",
  completed: "success",
  cancelled: "danger",
};
const SOURCE: Record<string, string> = { product: "Produto", artwork: "Arte pronta", service: "Serviço", manual: "Manual" };
const LIMIT = 200;

type SP = Promise<{ tipo?: string; status?: string; de?: string; ate?: string }>;
const isDate = (v?: string) => !!v && /^\d{4}-\d{2}-\d{2}$/.test(v);

type Row =
  | { kind: "order"; at: string; data: Order }
  | { kind: "quote"; at: string; data: Quote };

export default async function OrdersAdminPage({ searchParams }: { searchParams: SP }) {
  const sp = await searchParams;
  const { supabase } = await requireAdmin();
  const tipo = sp.tipo === "pedidos" || sp.tipo === "orcamentos" ? sp.tipo : "todos";
  const status = (ORDER_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;
  const from = isDate(sp.de) ? `${sp.de}T00:00:00-03:00` : undefined;
  const to = isDate(sp.ate) ? `${sp.ate}T23:59:59.999-03:00` : undefined;

  let ordersQuery = supabase.from("orders").select("*");
  let quotesQuery = supabase.from("custom_quotes").select("*");
  if (from) { ordersQuery = ordersQuery.gte("created_at", from); quotesQuery = quotesQuery.gte("created_at", from); }
  if (to) { ordersQuery = ordersQuery.lte("created_at", to); quotesQuery = quotesQuery.lte("created_at", to); }
  if (status) { ordersQuery = ordersQuery.eq("status", status); quotesQuery = quotesQuery.eq("status", status); }

  const [ordersRes, quotesRes] = await Promise.all([
    tipo === "orcamentos" ? Promise.resolve({ data: [], error: null }) : ordersQuery.order("created_at", { ascending: false }).limit(LIMIT),
    tipo === "pedidos" ? Promise.resolve({ data: [], error: null }) : quotesQuery.order("created_at", { ascending: false }).limit(LIMIT),
  ]);
  const rows: Row[] = [
    ...((ordersRes.data ?? []) as Order[]).map((data): Row => ({ kind: "order", at: data.created_at, data })),
    ...((quotesRes.data ?? []) as Quote[]).map((data): Row => ({ kind: "quote", at: data.created_at, data })),
  ].sort((a, b) => b.at.localeCompare(a.at));

  return (
    <>
      <PageTitle title="Pedidos e orçamentos" subtitle="Registros criados antes do redirecionamento ao WhatsApp. Atualize o status manualmente conforme o atendimento." />

      <form method="get" className="mb-6 grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
        <div>
          <label htmlFor="tipo" className="mb-1 block text-xs font-bold uppercase text-ink-muted">Tipo</label>
          <Select id="tipo" name="tipo" defaultValue={tipo}>
            <option value="todos">Todos</option><option value="pedidos">Pedidos de produtos</option><option value="orcamentos">Orçamentos personalizados</option>
          </Select>
        </div>
        <div>
          <label htmlFor="status" className="mb-1 block text-xs font-bold uppercase text-ink-muted">Status</label>
          <Select id="status" name="status" defaultValue={status ?? ""}>
            <option value="">Todos</option>
            {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </Select>
        </div>
        <div>
          <label htmlFor="de" className="mb-1 block text-xs font-bold uppercase text-ink-muted">De</label>
          <Input id="de" name="de" type="date" defaultValue={isDate(sp.de) ? sp.de : ""} />
        </div>
        <div>
          <label htmlFor="ate" className="mb-1 block text-xs font-bold uppercase text-ink-muted">Até</label>
          <Input id="ate" name="ate" type="date" defaultValue={isDate(sp.ate) ? sp.ate : ""} />
        </div>
        <Button type="submit" variant="dark">Filtrar</Button>
      </form>

      {(ordersRes.error || quotesRes.error) && (
        <p role="alert" className="mb-4 text-sm text-red-700">{(ordersRes.error ?? quotesRes.error)?.message}</p>
      )}

      {rows.length === 0 ? (
        <EmptyState title="Nenhum registro encontrado">Pedidos e orçamentos aparecem aqui quando clientes usam os botões do site.</EmptyState>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => {
            const d = r.data;
            const number = r.kind === "order" ? (d as Order).order_number : (d as Quote).protocol_number;
            return (
              <li key={`${r.kind}-${d.id}`} className="rounded-2xl border border-line bg-white shadow-sm">
                <details className="group">
                  <summary className="flex cursor-pointer list-none flex-wrap items-center gap-x-4 gap-y-2 p-4">
                    <span className="font-mono text-sm font-bold">{number}</span>
                    <Badge tone={r.kind === "order" ? "neutral" : "brand"}>{r.kind === "order" ? `Pedido · ${SOURCE[(d as Order).source]}` : "Orçamento"}</Badge>
                    <Badge tone={TONE[d.status]}>{STATUS_LABELS[d.status]}</Badge>
                    <span className="text-sm text-ink-muted">{formatDateTime(d.created_at)}</span>
                    <span className="min-w-0 flex-1 truncate text-sm font-semibold">
                      {r.kind === "order"
                        ? (d as Order).items.map((i) => `${i.quantity}× ${i.name}`).join(", ")
                        : (d as Quote).product_type}
                    </span>
                    <ChevronDown className="h-4 w-4 transition group-open:rotate-180" aria-hidden />
                  </summary>
                  <div className="space-y-4 border-t border-line p-4">
                    {r.kind === "order" ? (
                      <dl className="grid gap-2 text-sm sm:grid-cols-2">
                        <div><dt className="font-bold">Cliente</dt><dd>{(d as Order).customer_name ?? "Não informado"} {(d as Order).customer_phone ? `· ${(d as Order).customer_phone}` : ""}</dd></div>
                        <div>
                          <dt className="font-bold">Valor estimado</dt>
                          <dd>
                            {(d as Order).total_amount != null ? formatBRL((d as Order).total_amount!) : "—"}
                            {(d as Order).has_unpriced_items && <span className="ml-1 text-ink-muted">(há itens sob consulta)</span>}
                          </dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="font-bold">Itens</dt>
                          <dd>
                            <ul className="mt-1 list-disc pl-5">
                              {(d as Order).items.map((i, idx) => (
                                <li key={idx}>{i.quantity}× {i.name}{i.ref ? ` (${i.ref})` : ""} — {i.unit_price != null ? formatBRL(i.unit_price) : "sob consulta"}</li>
                              ))}
                            </ul>
                          </dd>
                        </div>
                      </dl>
                    ) : (
                      <dl className="grid gap-2 text-sm sm:grid-cols-2">
                        <div><dt className="font-bold">Cliente</dt><dd>{(d as Quote).customer_name} {(d as Quote).customer_phone ? `· ${(d as Quote).customer_phone}` : ""}</dd></div>
                        <div><dt className="font-bold">Quantidade / prazo</dt><dd>{(d as Quote).quantity ?? "—"} / {(d as Quote).desired_deadline ?? "—"}</dd></div>
                        <div className="sm:col-span-2"><dt className="font-bold">Descrição</dt><dd className="whitespace-pre-line">{(d as Quote).description}</dd></div>
                        {(d as Quote).details && <div className="sm:col-span-2"><dt className="font-bold">Detalhes</dt><dd className="whitespace-pre-line">{(d as Quote).details}</dd></div>}
                        {(d as Quote).reference_url && (
                          <div className="sm:col-span-2"><dt className="font-bold">Referência</dt><dd><a className="break-all text-brand-text underline" href={(d as Quote).reference_url!} target="_blank" rel="noopener noreferrer nofollow">{(d as Quote).reference_url}</a></dd></div>
                        )}
                      </dl>
                    )}
                    <RecordEditor
                      id={d.id}
                      table={r.kind === "order" ? "orders" : "custom_quotes"}
                      status={d.status}
                      notes={d.admin_notes}
                      total={r.kind === "order" ? (d as Order).total_amount : undefined}
                    />
                  </div>
                </details>
              </li>
            );
          })}
        </ul>
      )}
      {rows.length >= LIMIT && <p className="mt-4 text-sm text-ink-muted">Exibindo os {LIMIT} registros mais recentes de cada tipo. Use os filtros para refinar.</p>}
    </>
  );
}
