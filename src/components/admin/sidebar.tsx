"use client";

import { Building2, ClipboardList, Type, ExternalLink, FolderTree, ImageIcon, LayoutDashboard, LogOut, Megaphone, Menu, Package, Palette, Settings, Wrench, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { logoutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/pedidos", label: "Pedidos e orçamentos", icon: ClipboardList },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/artes", label: "Artes prontas", icon: Palette },
  { href: "/admin/servicos", label: "Serviços", icon: Wrench },
  { href: "/admin/banners", label: "Banners", icon: Megaphone },
  { href: "/admin/clientes", label: "Clientes", icon: Building2 },
  { href: "/admin/conteudo", label: "Textos e imagens", icon: Type },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminSidebar({ email, storeName }: { email: string; storeName: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const active = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav aria-label="Painel administrativo" className="flex h-full flex-col">
      <div className="px-4 pb-4 pt-5">
        <p className="font-display text-lg font-extrabold text-white">{storeName}</p>
        <p className="text-xs text-white/60">Painel administrativo</p>
      </div>
      <ul className="flex-1 space-y-1 px-3">
        {ITEMS.map(({ href, label, icon: Icon }) => (
          <li key={href}>
            <Link
              href={href}
              onClick={() => setOpen(false)}
              aria-current={active(href) ? "page" : undefined}
              className={cn("flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-semibold", active(href) ? "bg-brand text-ink" : "text-white/80 hover:bg-white/10")}
            >
              <Icon className="h-4 w-4" aria-hidden /> {label}
            </Link>
          </li>
        ))}
      </ul>
      <div className="space-y-2 border-t border-white/10 p-4 text-xs text-white/70">
        <p className="truncate" title={email}>{email}</p>
        <Link href="/" target="_blank" className="flex items-center gap-1.5 hover:text-white">
          <ExternalLink className="h-3.5 w-3.5" aria-hidden /> Ver loja
        </Link>
        <form action={logoutAction}>
          <button type="submit" className="flex items-center gap-1.5 hover:text-white">
            <LogOut className="h-3.5 w-3.5" aria-hidden /> Sair
          </button>
        </form>
      </div>
    </nav>
  );

  return (
    <>
      <div className="sticky top-0 z-40 flex h-14 items-center justify-between bg-ink px-4 text-white lg:hidden">
        <span className="font-display font-extrabold">{storeName} · Admin</span>
        <button type="button" aria-label={open ? "Fechar menu" : "Abrir menu"} aria-expanded={open} onClick={() => setOpen(!open)} className="rounded-lg p-2 hover:bg-white/10">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>
      {open && <div className="fixed inset-x-0 bottom-0 top-14 z-30 overflow-y-auto bg-ink lg:hidden">{nav}</div>}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 bg-ink lg:block">{nav}</aside>
    </>
  );
}

export { ImageIcon };
