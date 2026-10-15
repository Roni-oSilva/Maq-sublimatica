"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Spinner } from "@/components/ui/misc";

/** Formulário de senha (nova + confirmação; opcionalmente a senha atual). */
export function PasswordForm({
  action,
  withCurrent,
  submitLabel = "Salvar",
}: {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  withCurrent?: boolean;
  submitLabel?: string;
}) {
  const [state, formAction, pending] = useActionState(action, { ok: false } as ActionResult);
  const formRef = useRef<HTMLFormElement>(null);
  const seen = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (state === seen.current || (!state.ok && !state.error)) return;
    seen.current = state;
    if (state.ok) {
      toast.success("Senha alterada com sucesso.");
      formRef.current?.reset();
    } else if (state.error) toast.error(state.error);
  }, [state]);

  const fe = state.fieldErrors ?? {};
  return (
    <form ref={formRef} action={formAction} className="mt-6 space-y-4">
      {withCurrent && (
        <Field label="Senha atual" htmlFor="current" error={fe.current}>
          <Input id="current" name="current" type="password" autoComplete="current-password" required />
        </Field>
      )}
      <Field label="Nova senha" htmlFor="password" error={fe.password} hint="Mínimo de 8 caracteres, com letras e números.">
        <Input id="password" name="password" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      <Field label="Repita a nova senha" htmlFor="confirm" error={fe.confirm}>
        <Input id="confirm" name="confirm" type="password" autoComplete="new-password" minLength={8} required />
      </Field>
      {!withCurrent && state.error && !state.fieldErrors && (
        <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>
      )}
      <Button type="submit" className="w-full sm:w-auto" disabled={pending}>
        {pending && <Spinner />} {submitLabel}
      </Button>
    </form>
  );
}
