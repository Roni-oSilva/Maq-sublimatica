"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container flex min-h-[60vh] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-extrabold">Algo deu errado</h1>
      <p className="mt-3 max-w-md text-ink-muted">Não foi possível carregar esta página agora. Tente novamente em instantes.</p>
      <Button className="mt-6" onClick={reset}>
        Tentar novamente
      </Button>
    </div>
  );
}
