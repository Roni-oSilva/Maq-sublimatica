import { AlertTriangle, ClipboardList, MousePointerClick, Package, PackageX, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";
import { DashboardCharts } from "@/components/admin/charts";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/data";
import type { DashboardCounters, MonthlyStat } from "@/lib/types";

export const metadata = { title: "Dashboard" };

function Stat({ label, value, hint, icon: Icon, href, tone = "text-brand-text bg-brand-light" }: { label: string; value: number | string; hint?: string; icon: React.ElementType; href?: string; tone?: string }) {
  const body = (
    <div className="flex h-full items-start gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm transition hover:shadow-md">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${tone}`}>
        <Icon className="h-5 w-5" aria-hidden />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink-muted">{label}</p>
        <p className="font-sans text-3xl font-extrabold leading-tight">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
      </div>
    </div>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const [settings, countersRes, statsRes] = await Promise.all([
    getSettings(),
    supabase.rpc("admin_dashboard_counters"),
    supabase.rpc("admin_monthly_stats", { p_months: 12 }),
  ]);

  if (countersRes.error || statsRes.error) {
    return (
      <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-900">
        <h1 className="text-xl font-bold">Não foi possível carregar o dashboard</h1>
        <p className="mt-1 text-sm">{(countersRes.error ?? statsRes.error)?.message}. Verifique se as migrações SQL foram aplicadas.</p>
      </div>
    );
  }
  const c = countersRes.data as DashboardCounters;
  const stats = (statsRes.data ?? []) as MonthlyStat[];
  const current = stats.at(-1);
  const previous = stats.at(-2);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-ink-muted">Dados reais registrados no banco. Cliques no WhatsApp não são vendas; o status dos pedidos é atualizado manualmente.</p>
      </div>

      {!settings.whatsapp_number && (
        <div role="alert" className="flex gap-3 rounded-2xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-950">
          <AlertTriangle className="h-5 w-5 shrink-0" aria-hidden />
          <p>
            O número de WhatsApp da loja ainda não foi configurado — os botões de pedido ficam indisponíveis para os clientes.{" "}
            <Link href="/admin/configuracoes" className="font-bold underline">Configurar agora</Link>
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Pedidos registrados (total)" value={c.total_orders} hint={`${c.new_orders} com status “Novo”`} icon={ShoppingBag} href="/admin/pedidos?tipo=pedidos" />
        <Stat label="Pedidos no mês atual" value={current?.registered ?? 0} icon={TrendingUp} tone="text-cyan-800 bg-cyan-100" />
        <Stat label="Pedidos no mês anterior" value={previous?.registered ?? 0} icon={TrendingUp} tone="text-cyan-800 bg-cyan-100" />
        <Stat label="Solicitações de orçamento" value={c.total_quotes} hint={`${c.new_quotes} novas`} icon={ClipboardList} href="/admin/pedidos?tipo=orcamentos" />
        <Stat label="Produtos ativos" value={c.active_products} icon={Package} href="/admin/produtos" tone="text-emerald-800 bg-emerald-100" />
        <Stat label="Estoque baixo" value={c.low_stock} hint="Somente produtos com controle de estoque" icon={PackageX} href="/admin/produtos" tone="text-amber-900 bg-amber-100" />
        <Stat label="Cliques no WhatsApp" value={c.total_clicks} hint="Iniciaram conversa — não são vendas" icon={MousePointerClick} tone="text-orange-900 bg-orange-100" />
        <Stat label="Concluídos (mês atual)" value={current?.completed ?? 0} hint="Marcados manualmente como concluídos" icon={ShoppingBag} tone="text-emerald-800 bg-emerald-100" />
      </div>

      <DashboardCharts stats={stats} />
    </div>
  );
}
