"use client";

import { ImagePlus, Loader2, Trash2, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { createContext, startTransition, useActionState, useContext, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";
import { uploadImageAction, type ActionResult } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/form";
import { Spinner } from "@/components/ui/misc";
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_BYTES } from "@/lib/images";

const ErrorsCtx = createContext<Record<string, string>>({});

/** Formulário ligado a uma Server Action, com erros por campo, toast e redirecionamento opcional. */
export function ActionForm({
  action,
  children,
  redirectTo,
  successMessage = "Salvo com sucesso.",
  submitLabel = "Salvar",
  className,
}: {
  action: (prev: ActionResult, fd: FormData) => Promise<ActionResult>;
  children: React.ReactNode;
  redirectTo?: string;
  successMessage?: string;
  submitLabel?: string;
  className?: string;
}) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState(action, { ok: false } as ActionResult);
  const seen = useRef<ActionResult | null>(null);

  useEffect(() => {
    if (state === seen.current || (!state.ok && !state.error)) return;
    seen.current = state;
    if (state.ok) {
      toast.success(successMessage);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    } else if (state.error) toast.error(state.error);
  }, [state, router, redirectTo, successMessage]);

  return (
    <ErrorsCtx.Provider value={state.fieldErrors ?? {}}>
      {/* Envio manual: o React 19 limpa formulários após <form action>, o que apagaria o que a pessoa digitou quando o servidor rejeita um campo. */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(() => formAction(fd));
        }}
        className={className ?? "space-y-5"}
      >
        {children}
        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" disabled={pending}>
            {pending && <Spinner />} {submitLabel}
          </Button>
        </div>
      </form>
    </ErrorsCtx.Provider>
  );
}

/** Campo que lê automaticamente o erro do servidor pelo `name`. */
export function F({ name, label, hint, required, children, className }: { name: string; label: string; hint?: string; required?: boolean; children: React.ReactNode; className?: string }) {
  const errors = useContext(ErrorsCtx);
  return (
    <Field label={label} htmlFor={name} error={errors[name]} hint={hint} required={required} className={className}>
      {children}
    </Field>
  );
}

function ImageThumb({ url, onRemove }: { url: string; onRemove: () => void }) {
  return (
    <div className="relative h-24 w-24 overflow-hidden rounded-xl border border-line bg-paper">
      <Image src={url} alt="Pré-visualização" fill sizes="96px" className="object-cover" unoptimized />
      <button type="button" onClick={onRemove} aria-label="Remover imagem" className="absolute right-1 top-1 rounded-full bg-ink/80 p-1 text-white hover:bg-red-600">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

async function upload(file: File, folder: string): Promise<string | null> {
  if (!(ALLOWED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    toast.error("Use imagens JPG, PNG, WebP ou AVIF.");
    return null;
  }
  if (file.size > MAX_IMAGE_BYTES) {
    toast.error("A imagem deve ter no máximo 4 MB.");
    return null;
  }
  const fd = new FormData();
  fd.set("file", file);
  fd.set("folder", folder);
  const res = await uploadImageAction(fd);
  if (!res.ok || !res.url) {
    toast.error(res.error ?? "Falha no upload.");
    return null;
  }
  return res.url;
}

/** Upload de uma imagem; o valor vai em um input hidden com o `name` informado. */
export function ImageField({ name, label, folder, defaultValue }: { name: string; label: string; folder: string; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [busy, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <F name={name} label={label} hint="JPG, PNG, WebP ou AVIF até 4 MB.">
      <input type="hidden" name={name} value={url} />
      <div className="flex flex-wrap items-center gap-3">
        {url && <ImageThumb url={url} onRemove={() => setUrl("")} />}
        <input
          ref={inputRef}
          id={name}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          className="sr-only"
          onChange={(e) => {
            const file = e.target.files?.[0];
            e.target.value = "";
            if (file) startTransition(async () => { const u = await upload(file, folder); if (u) setUrl(u); });
          }}
        />
        <Button type="button" variant="outline" disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
          {url ? "Trocar imagem" : "Enviar imagem"}
        </Button>
      </div>
    </F>
  );
}

/** Galeria de imagens adicionais (JSON em input hidden). */
export function GalleryField({ name = "gallery", folder, defaultValue = [] }: { name?: string; folder: string; defaultValue?: string[] }) {
  const [urls, setUrls] = useState<string[]>(defaultValue);
  const [busy, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold">Imagens adicionais</p>
      <input type="hidden" name={name} value={JSON.stringify(urls)} />
      <div className="flex flex-wrap items-center gap-3">
        {urls.map((u, i) => (
          <ImageThumb key={u} url={u} onRemove={() => setUrls(urls.filter((_, j) => j !== i))} />
        ))}
        <input
          ref={inputRef}
          type="file"
          accept={ALLOWED_IMAGE_TYPES.join(",")}
          multiple
          className="sr-only"
          aria-label="Adicionar imagens"
          onChange={(e) => {
            const files = Array.from(e.target.files ?? []).slice(0, 10);
            e.target.value = "";
            startTransition(async () => {
              const added: string[] = [];
              for (const f of files) { const u = await upload(f, folder); if (u) added.push(u); }
              setUrls((cur) => [...cur, ...added].slice(0, 10));
            });
          }}
        />
        <Button type="button" variant="outline" disabled={busy || urls.length >= 10} onClick={() => inputRef.current?.click()}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />} Adicionar
        </Button>
      </div>
      <p className="mt-1 text-xs text-ink-muted">Até 10 imagens. A ordem é a de envio.</p>
    </div>
  );
}

/** Seletor de cor com campo hexadecimal sincronizado. */
export function ColorField({ name, label, hint, defaultValue }: { name: string; label: string; hint?: string; defaultValue: string }) {
  const [value, setValue] = useState(defaultValue);
  const valid = /^#[0-9a-fA-F]{6}$/.test(value);
  return (
    <F name={name} label={label} hint={hint}>
      <div className="flex items-center gap-3">
        <input type="color" aria-label={`${label} (seletor)`} value={valid ? value : defaultValue} onChange={(e) => setValue(e.target.value)} className="h-11 w-14 cursor-pointer rounded-xl border border-line bg-white p-1" />
        <input id={name} name={name} value={value} onChange={(e) => setValue(e.target.value)} maxLength={7} spellCheck={false} className="h-11 w-32 rounded-2xl border border-line bg-white px-4 font-mono text-sm" />
        <span className="h-8 w-8 rounded-full border border-line" style={{ background: valid ? value : "transparent" }} aria-hidden />
      </div>
    </F>
  );
}

/** Interruptor ativo/inativo com ação imediata. */
export function ToggleActive({ action, active }: { action: (next: boolean) => Promise<ActionResult>; active: boolean }) {
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <Button
      variant="outline"
      size="sm"
      disabled={pending}
      onClick={() =>
        start(async () => {
          const r = await action(!active);
          if (r.ok) { toast.success(active ? "Item desativado." : "Item publicado."); router.refresh(); }
          else toast.error(r.error ?? "Erro ao atualizar.");
        })
      }
    >
      {pending ? <Spinner /> : null} {active ? "Desativar" : "Publicar"}
    </Button>
  );
}

export { Trash2 };
