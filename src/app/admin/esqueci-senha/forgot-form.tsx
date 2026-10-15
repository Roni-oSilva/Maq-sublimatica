"use client";

import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useActionState } from "react";
import { requestPasswordResetAction, type ActionResult } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Spinner } from "@/components/ui/misc";

export function ForgotForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, { ok: false } as ActionResult);

  if (state.ok) {
    return (
      <div role="status" className="mt-6 rounded-2xl bg-emerald-50 p-4 text-sm text-emerald-900">
        <MailCheck className="h-6 w-6" aria-hidden />
        <p className="mt-2 font-bold">Verifique o seu e-mail</p>
        <p className="mt-1">
          Se esse e-mail pertence a um administrador, você receberá em instantes um link para criar a nova senha. Confira também o spam. O link vale por tempo limitado.
        </p>
        <Link href="/admin/login" className="mt-3 inline-block font-bold underline">Voltar ao login</Link>
      </div>
    );
  }

  return (
    <form action={action} className="mt-6 space-y-4">
      <Field label="E-mail" htmlFor="email" error={state.error}>
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </Field>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Spinner />} Enviar link por e-mail
      </Button>
      <p className="text-center text-sm">
        <Link href="/admin/login" className="font-semibold text-brand-text hover:underline">Voltar ao login</Link>
      </p>
    </form>
  );
}
