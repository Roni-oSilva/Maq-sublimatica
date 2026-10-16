import { Logo } from "@/components/site/logo";

export function AuthShell({ title, subtitle, children, wide }: { title: string; subtitle?: string; children: React.ReactNode; wide?: boolean }) {
  return (
    <div className="admin-area flex min-h-screen items-center justify-center bg-ink p-4">
      <div className={`w-full ${wide ? "max-w-xl" : "max-w-sm"} rounded-3xl bg-white p-7 shadow-2xl`}>
        <Logo className="h-12 w-auto" />
        <h1 className="mt-4 text-2xl font-extrabold">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
}
