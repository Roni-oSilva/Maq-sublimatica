import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <p className="eyebrow">Erro 404</p>
      <h1 className="mt-2 text-4xl font-extrabold">Página não encontrada</h1>
      <p className="mt-3 text-ink-muted">O endereço pode ter mudado ou o item não está mais disponível.</p>
      <Link href="/loja" className={buttonVariants({ size: "lg" }) + " mt-6"}>
        Voltar para a loja
      </Link>
    </div>
  );
}
