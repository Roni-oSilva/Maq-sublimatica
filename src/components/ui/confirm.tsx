"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { toast } from "sonner";
import { Button } from "./button";
import { Spinner } from "./misc";

/** Botão de exclusão com confirmação obrigatória antes da operação destrutiva. */
export function ConfirmDelete({
  action,
  title = "Excluir este item?",
  description = "Esta ação não pode ser desfeita.",
  label = "Excluir",
  confirmLabel = "Excluir",
  successMessage = "Item excluído.",
  iconOnly,
}: {
  action: () => Promise<{ ok: boolean; error?: string }>;
  title?: string;
  description?: string;
  label?: string;
  confirmLabel?: string;
  successMessage?: string;
  iconOnly?: boolean;
}) {
  const [pending, start] = useTransition();
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <Button variant="outline" size={iconOnly ? "icon" : "sm"} aria-label={label} className="text-red-600 hover:bg-red-50">
          <Trash2 className="h-4 w-4" aria-hidden />
          {!iconOnly && label}
        </Button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-sm" />
        <AlertDialog.Content className="fixed left-1/2 top-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white p-6 shadow-2xl">
          <AlertDialog.Title className="text-lg font-bold">{title}</AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-sm text-ink-muted">{description}</AlertDialog.Description>
          <div className="mt-6 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <Button variant="outline">Cancelar</Button>
            </AlertDialog.Cancel>
            <Button
              variant="danger"
              disabled={pending}
              onClick={() =>
                start(async () => {
                  const res = await action();
                  if (res.ok) toast.success(successMessage);
                  else toast.error(res.error ?? "Não foi possível excluir.");
                })
              }
            >
              {pending && <Spinner />} {confirmLabel}
            </Button>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
