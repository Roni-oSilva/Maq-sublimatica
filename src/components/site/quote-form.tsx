"use client";

import { CheckCircle2, MessageCircle, Paperclip } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { registerQuoteAction } from "@/app/actions/public";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/form";
import { Spinner } from "@/components/ui/misc";
import { flattenErrors, quoteSchema, type FieldErrors } from "@/lib/validation";
import { buildQuoteMessage, buildWhatsappUrl } from "@/lib/whatsapp";

const EMPTY = {
  customerName: "",
  customerPhone: "",
  productType: "",
  quantity: "",
  deadline: "",
  description: "",
  details: "",
  referenceUrl: "",
};

export function QuoteForm({ whatsappNumber, storeName }: { whatsappNumber: string | null; storeName: string }) {
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{ protocol: string | null; url: string } | null>(null);

  const set = (k: keyof typeof EMPTY) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setValues((v) => ({ ...v, [k]: e.target.value }));
  const err = (k: string) => errors[k];
  const aria = (k: string) => ({ "aria-invalid": err(k) ? true : undefined, "aria-describedby": err(k) ? `${k}-error` : undefined });

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!whatsappNumber) return;
    const parsed = quoteSchema.safeParse(values);
    if (!parsed.success) {
      const fe = flattenErrors(parsed.error);
      setErrors(fe);
      toast.error("Revise os campos destacados.");
      document.getElementById(Object.keys(fe)[0])?.focus();
      return;
    }
    setErrors({});
    setLoading(true);
    const q = parsed.data;
    let protocol: string | null = null;
    try {
      const res = await registerQuoteAction(values);
      if (res.ok) protocol = res.protocol;
      else if (res.fieldErrors) {
        setErrors(res.fieldErrors);
        setLoading(false);
        return;
      } else toast.warning("Não conseguimos registrar a solicitação, mas você ainda pode enviá-la pelo WhatsApp.");
    } catch {
      toast.warning("Não conseguimos registrar a solicitação, mas você ainda pode enviá-la pelo WhatsApp.");
    }

    const message = buildQuoteMessage(
      {
        storeName,
        name: q.customerName,
        phone: q.customerPhone,
        productType: q.productType,
        quantity: q.quantity,
        deadline: q.deadline,
        description: q.description,
        details: q.details,
        referenceUrl: q.referenceUrl,
      },
      protocol,
    );
    const url = buildWhatsappUrl(whatsappNumber, message);
    setDone({ protocol, url });
    setLoading(false);
    window.location.assign(url);
  }

  if (done) {
    return (
      <div className="rounded-3xl border border-emerald-200 bg-emerald-50 p-6 sm:p-8" role="status">
        <CheckCircle2 className="h-10 w-10 text-emerald-600" aria-hidden />
        <h2 className="mt-3 text-2xl font-extrabold">{done.protocol ? "Solicitação registrada!" : "Mensagem pronta!"}</h2>
        {done.protocol && (
          <p className="mt-1 text-sm">
            Protocolo: <strong className="font-mono">{done.protocol}</strong>
          </p>
        )}
        <p className="mt-3 text-ink-soft">
          Abrimos o WhatsApp com a sua mensagem. <strong>Confirme o envio dentro do WhatsApp</strong> para falar com a nossa equipe.
        </p>
        <p className="mt-3 flex gap-2 rounded-xl bg-white p-3 text-sm text-ink-soft">
          <Paperclip className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          Tem imagens, logotipos ou arquivos de referência? Anexe-os diretamente na conversa do WhatsApp — eles não são enviados por este formulário.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Button asChild variant="whatsapp">
            <a href={done.url} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="h-4 w-4" aria-hidden /> Abrir WhatsApp novamente
            </a>
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setValues(EMPTY);
              setDone(null);
            }}
          >
            Nova solicitação
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-3xl border border-line bg-white p-5 shadow-sm sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Seu nome" htmlFor="customerName" required error={err("customerName")}>
          <Input id="customerName" name="customerName" autoComplete="name" value={values.customerName} onChange={set("customerName")} maxLength={120} {...aria("customerName")} />
        </Field>
        <Field label="WhatsApp / telefone" htmlFor="customerPhone" error={err("customerPhone")} hint="Opcional. Com DDD.">
          <Input id="customerPhone" name="customerPhone" type="tel" inputMode="tel" autoComplete="tel" value={values.customerPhone} onChange={set("customerPhone")} maxLength={20} {...aria("customerPhone")} />
        </Field>
      </div>
      <Field label="Produto ou serviço desejado" htmlFor="productType" required error={err("productType")} hint="Ex.: canecas personalizadas, camisetas, banner, arte para logotipo…">
        <Input id="productType" name="productType" value={values.productType} onChange={set("productType")} maxLength={160} {...aria("productType")} />
      </Field>
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Quantidade aproximada" htmlFor="quantity" error={err("quantity")} hint="Opcional.">
          <Input id="quantity" name="quantity" value={values.quantity} onChange={set("quantity")} maxLength={60} {...aria("quantity")} />
        </Field>
        <Field label="Prazo desejado" htmlFor="deadline" error={err("deadline")} hint="Opcional. Ex.: até 20/12.">
          <Input id="deadline" name="deadline" value={values.deadline} onChange={set("deadline")} maxLength={120} {...aria("deadline")} />
        </Field>
      </div>
      <Field label="Descreva o que deseja" htmlFor="description" required error={err("description")} hint={`${values.description.length}/1500 — escreva livremente, sem limitações de opções.`}>
        <Textarea id="description" name="description" rows={6} value={values.description} onChange={set("description")} maxLength={1500} {...aria("description")} />
      </Field>
      <Field label="Cores, tamanhos, materiais e outros detalhes" htmlFor="details" error={err("details")} hint="Opcional.">
        <Textarea id="details" name="details" rows={3} value={values.details} onChange={set("details")} maxLength={800} {...aria("details")} />
      </Field>
      <Field label="Link de referência ou inspiração" htmlFor="referenceUrl" error={err("referenceUrl")} hint="Opcional. Cole um link (https://…).">
        <Input id="referenceUrl" name="referenceUrl" type="url" inputMode="url" value={values.referenceUrl} onChange={set("referenceUrl")} maxLength={500} {...aria("referenceUrl")} />
      </Field>

      <p className="flex gap-2 rounded-xl bg-paper p-3 text-sm text-ink-soft">
        <Paperclip className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
        Quer enviar imagens ou arquivos? Anexe-os direto na conversa do WhatsApp depois de enviar esta solicitação.
      </p>

      {whatsappNumber ? (
        <Button type="submit" variant="whatsapp" size="lg" className="w-full uppercase tracking-wide" disabled={loading}>
          {loading ? <Spinner /> : <MessageCircle className="h-5 w-5" aria-hidden />}
          Solicitar orçamento pelo WhatsApp
        </Button>
      ) : (
        <p role="alert" className="rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          O WhatsApp da loja ainda não foi configurado. Tente novamente mais tarde.
        </p>
      )}
    </form>
  );
}
