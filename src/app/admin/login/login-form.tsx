"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, type ActionResult } from "../actions";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/form";
import { Spinner } from "@/components/ui/misc";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, { ok: false } as ActionResult);
  return (
    <form action={action} className="mt-6 space-y-4">
      <input type="hidden" name="next" value={next} />
      <Field label="E-mail" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="username" required />
      </Field>
      <Field label="Senha" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      {state.error && (
        <p role="alert" className="text-sm font-medium text-red-600">{state.error}</p>
      )}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending && <Spinner />} Entrar
      </Button>
      <p className="text-center text-sm">
        <Link href="/admin/esqueci-senha" className="font-semibold text-brand-text hover:underline">Esqueci minha senha</Link>
      </p>
    </form>
  );
}
