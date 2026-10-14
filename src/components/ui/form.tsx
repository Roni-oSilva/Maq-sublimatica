import { forwardRef, type InputHTMLAttributes, type LabelHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const field =
  "w-full rounded-xl border border-line bg-white px-3.5 text-sm text-ink placeholder:text-ink-muted/70 transition focus:border-brand disabled:cursor-not-allowed disabled:bg-ink/5";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(function Input(
  { className, ...props },
  ref,
) {
  return <input ref={ref} className={cn(field, "h-11", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(function Textarea(
  { className, ...props },
  ref,
) {
  return <textarea ref={ref} className={cn(field, "min-h-28 py-3", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, ...props },
  ref,
) {
  return <select ref={ref} className={cn(field, "h-11 pr-8", className)} {...props} />;
});

export function Label({ className, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn("mb-1.5 block text-sm font-semibold text-ink", className)} {...props} />;
}

/** Campo com rótulo, dica e mensagem de erro acessível. */
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-brand" aria-hidden> *</span>}
      </Label>
      {children}
      {hint && !error && <p className="mt-1 text-xs text-ink-muted">{hint}</p>}
      {error && (
        <p id={`${htmlFor}-error`} role="alert" className="mt-1 text-xs font-medium text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

export function Checkbox({ label, className, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <label className={cn("flex min-h-11 cursor-pointer items-center gap-3 text-sm font-medium", className)}>
      <input type="checkbox" className="h-5 w-5 rounded border-line accent-[#c2185b]" {...props} />
      {label}
    </label>
  );
}
