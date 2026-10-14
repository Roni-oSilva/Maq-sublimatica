import Link from "next/link";
import { Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Checkbox, Input } from "@/components/ui/form";
import { F } from "./forms";
import { cn } from "@/lib/utils";

export function PageTitle({ title, subtitle, action }: { title: string; subtitle?: string; action?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-extrabold sm:text-3xl">{title}</h1>
        {subtitle && <p className="text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {action && (
        <Link href={action.href} className={cn(buttonVariants())}>
          <Plus className="h-4 w-4" aria-hidden /> {action.label}
        </Link>
      )}
    </div>
  );
}

export function priceToInput(price: number | null | undefined): string {
  return price === null || price === undefined ? "" : price.toFixed(2).replace(".", ",");
}

export function PriceFields({ price, onRequest }: { price?: number | null; onRequest?: boolean }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 sm:items-end">
      <F name="price" label="Preço de venda (R$)" hint="Ex.: 850,00. Ignorado se for sob consulta.">
        <Input id="price" name="price" inputMode="decimal" defaultValue={priceToInput(price)} placeholder="0,00" />
      </F>
      <Checkbox name="price_on_request" label="Preço sob consulta" defaultChecked={onRequest ?? false} />
    </div>
  );
}

export function Panel({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-2xl border border-line bg-white p-4 shadow-sm sm:p-6", className)}>{children}</div>;
}

export function TableWrap({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
      <table className="w-full min-w-[640px] text-left text-sm">{children}</table>
    </div>
  );
}
export const th = "px-4 py-3 text-xs font-bold uppercase tracking-wide text-ink-muted";
export const td = "px-4 py-3 align-middle";
