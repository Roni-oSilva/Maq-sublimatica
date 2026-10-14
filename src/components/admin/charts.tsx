"use client";

import { RefreshCw } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Button } from "@/components/ui/button";
import type { MonthlyStat } from "@/lib/types";
import { monthLabel } from "@/lib/utils";

const COLORS = { registered: "#171717", confirmed: "#F25623", completed: "#4d7c0f", quotes: "#F25623", clicks: "#8a8478" };

function ChartCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold">{title}</h2>
      <p className="mb-4 text-sm text-ink-muted">{subtitle}</p>
      <div className="h-72 w-full">{children}</div>
    </section>
  );
}

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

export function DashboardCharts({ stats }: { stats: MonthlyStat[] }) {
  const mounted = useMounted();
  const router = useRouter();
  const [pending, start] = useTransition();
  const data = stats.map((s) => ({ ...s, label: monthLabel(s.month) }));

  // Atualiza os dados periodicamente (re-executa a consulta no servidor).
  useEffect(() => {
    const t = setInterval(() => router.refresh(), 60_000);
    return () => clearInterval(t);
  }, [router]);

  const axis = { tick: { fontSize: 12, fill: "#6b6a85" }, tickLine: false, axisLine: false } as const;
  const tooltip = { contentStyle: { borderRadius: 12, border: "1px solid #e7e5f0", fontSize: 13 }, cursor: { fill: "rgba(20,18,43,.05)" } };

  const total = (key: keyof MonthlyStat) => stats.reduce((n, s) => n + (s[key] as number), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-extrabold">Últimos 12 meses</h2>
        <Button variant="outline" size="sm" disabled={pending} onClick={() => start(() => router.refresh())}>
          <RefreshCw className={`h-4 w-4 ${pending ? "animate-spin" : ""}`} aria-hidden /> Atualizar
        </Button>
      </div>

      <ChartCard
        title="Pedidos por mês"
        subtitle="Registrados = todos os pedidos criados no mês. Confirmados e concluídos = status atual (alterado manualmente)."
      >
        {mounted && (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ left: -16, right: 8 }} aria-label="Pedidos por mês">
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5f0" />
              <XAxis dataKey="label" {...axis} />
              <YAxis allowDecimals={false} {...axis} />
              <Tooltip {...tooltip} labelFormatter={(l) => `Mês: ${l}`} />
              <Legend wrapperStyle={{ fontSize: 13 }} />
              <Bar dataKey="registered" name="Registrados" fill={COLORS.registered} radius={[4, 4, 0, 0]} />
              <Bar dataKey="confirmed" name="Confirmados" fill={COLORS.confirmed} radius={[4, 4, 0, 0]} />
              <Bar dataKey="completed" name="Concluídos" fill={COLORS.completed} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </ChartCard>

      <div className="grid gap-6 xl:grid-cols-2">
        <ChartCard title="Solicitações de orçamento por mês" subtitle="Formulário da aba Personalizar.">
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} margin={{ left: -16, right: 8 }} aria-label="Orçamentos por mês">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5f0" />
                <XAxis dataKey="label" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip {...tooltip} labelFormatter={(l) => `Mês: ${l}`} />
                <Bar dataKey="quotes" name="Orçamentos" fill={COLORS.quotes} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartCard>

        <ChartCard
          title="Cliques no WhatsApp × pedidos registrados"
          subtitle="Cliques apenas iniciam conversas — não representam vendas."
        >
          {mounted && (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ left: -16, right: 8 }} aria-label="Cliques e pedidos por mês">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5f0" />
                <XAxis dataKey="label" {...axis} />
                <YAxis allowDecimals={false} {...axis} />
                <Tooltip {...tooltip} labelFormatter={(l) => `Mês: ${l}`} />
                <Legend wrapperStyle={{ fontSize: 13 }} />
                <Line type="monotone" dataKey="clicks" name="Cliques no WhatsApp" stroke={COLORS.clicks} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="registered" name="Pedidos registrados" stroke={COLORS.registered} strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </ChartCard>
      </div>

      <details className="rounded-2xl border border-line bg-white p-4 text-sm">
        <summary className="cursor-pointer font-semibold">Ver dados em tabela (acessível)</summary>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full min-w-[480px] text-left">
            <thead className="text-xs uppercase text-ink-muted">
              <tr>
                <th className="py-2">Mês</th><th>Registrados</th><th>Confirmados</th><th>Concluídos</th><th>Orçamentos</th><th>Cliques</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {data.map((d) => (
                <tr key={d.month}>
                  <td className="py-2 font-semibold">{d.label}</td><td>{d.registered}</td><td>{d.confirmed}</td><td>{d.completed}</td><td>{d.quotes}</td><td>{d.clicks}</td>
                </tr>
              ))}
              <tr className="font-bold">
                <td className="py-2">Total</td><td>{total("registered")}</td><td>{total("confirmed")}</td><td>{total("completed")}</td><td>{total("quotes")}</td><td>{total("clicks")}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </details>
    </div>
  );
}
