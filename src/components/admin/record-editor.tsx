"use client";

import { useRouter } from "next/navigation";
import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updateRecordAction, type ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/form";
import { Spinner } from "@/components/ui/misc";
import { ORDER_STATUSES, STATUS_LABELS, type OrderStatus } from "@/lib/types";

/** Atualização manual de status/observações. O sistema não lê as conversas do WhatsApp. */
export function RecordEditor({
  id,
  table,
  status,
  notes,
  total,
}: {
  id: string;
  table: "orders" | "custom_quotes";
  status: OrderStatus;
  notes: string | null;
  total?: number | null;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateRecordAction, { ok: false } as ActionResult);
  const seen = useRef<ActionResult | null>(null);
  useEffect(() => {
    if (state === seen.current || (!state.ok && !state.error)) return;
    seen.current = state;
    if (state.ok) {
      toast.success("Registro atualizado.");
      router.refresh();
    } else toast.error(state.error ?? "Erro ao atualizar.");
  }, [state, router]);

  const sid = `status-${id}`;
  return (
    <form action={action} className="grid gap-3 sm:grid-cols-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="table" value={table} />
      <div>
        <label htmlFor={sid} className="mb-1 block text-xs font-bold uppercase text-ink-muted">Status</label>
        <Select id={sid} name="status" defaultValue={status}>
          {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
        </Select>
      </div>
      {table === "orders" && (
        <div>
          <label htmlFor={`total-${id}`} className="mb-1 block text-xs font-bold uppercase text-ink-muted">Valor total (R$) — ajuste manual</label>
          <Input id={`total-${id}`} name="total_amount" inputMode="decimal" defaultValue={total != null ? total.toFixed(2).replace(".", ",") : ""} placeholder="0,00" />
        </div>
      )}
      <div className="sm:col-span-2">
        <label htmlFor={`notes-${id}`} className="mb-1 block text-xs font-bold uppercase text-ink-muted">Observações internas</label>
        <Textarea id={`notes-${id}`} name="admin_notes" rows={2} defaultValue={notes ?? ""} maxLength={2000} />
      </div>
      <div className="sm:col-span-2">
        <Button type="submit" size="sm" disabled={pending}>{pending && <Spinner />} Salvar atualização</Button>
      </div>
    </form>
  );
}
