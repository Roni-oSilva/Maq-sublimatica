"use client";

import { MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { registerOrderAction, trackGeneralClickAction } from "@/app/actions/public";
import { Button, type ButtonProps } from "@/components/ui/button";
import { Spinner } from "@/components/ui/misc";
import {
  buildArtworkMessage,
  buildProductMessage,
  buildServiceMessage,
  buildWhatsappUrl,
  type ArtworkMessageInput,
  type ProductMessageInput,
  type ServiceMessageInput,
} from "@/lib/whatsapp";
import { siteUrl } from "@/lib/utils";

type Variant = ButtonProps["variant"];
type Size = ButtonProps["size"];

type Payload =
  | { kind: "product"; id: string; path: string; input: Omit<ProductMessageInput, "url"> }
  | { kind: "artwork"; id: string; input: ArtworkMessageInput }
  | { kind: "service"; id: string; input: ServiceMessageInput };

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([promise, new Promise<T>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);
}

/**
 * Botão de pedido: registra o pedido (status "Novo") e abre o WhatsApp com a mensagem
 * montada a partir dos dados reais do item. Se o registro falhar, o WhatsApp abre mesmo assim.
 */
export function OrderButton({
  whatsappNumber,
  payload,
  label = "Pedir pelo WhatsApp",
  variant = "whatsapp",
  size = "md",
  className,
}: {
  whatsappNumber: string | null;
  payload: Payload;
  label?: string;
  variant?: Variant;
  size?: Size;
  className?: string;
}) {
  const [loading, setLoading] = useState(false);

  if (!whatsappNumber) {
    return (
      <Button variant="outline" size={size} className={className} disabled title="WhatsApp ainda não configurado pela loja">
        <MessageCircle className="h-4 w-4" aria-hidden /> WhatsApp indisponível
      </Button>
    );
  }

  async function handleClick() {
    setLoading(true);
    let protocol: string | null = null;
    try {
      const res = await withTimeout(registerOrderAction({ kind: payload.kind, id: payload.id, quantity: 1 }), 4000);
      if (res.ok) protocol = res.orderNumber;
    } catch {
      /* segue sem protocolo */
    }

    let message: string;
    if (payload.kind === "product") {
      message = buildProductMessage({ ...payload.input, url: `${siteUrl()}${payload.path}` }, protocol);
    } else if (payload.kind === "artwork") {
      message = buildArtworkMessage(payload.input, protocol);
    } else {
      message = buildServiceMessage(payload.input, protocol);
    }
    const url = buildWhatsappUrl(whatsappNumber!, message);
    toast.success(protocol ? `Pedido ${protocol} registrado. Abrindo o WhatsApp…` : "Abrindo o WhatsApp…", {
      description: "Confirme o envio da mensagem dentro do WhatsApp.",
      action: { label: "Abrir manualmente", onClick: () => window.open(url, "_blank", "noopener") },
    });
    window.location.assign(url);
    setTimeout(() => setLoading(false), 2500);
  }

  return (
    <Button variant={variant} size={size} className={className} onClick={handleClick} disabled={loading}>
      {loading ? <Spinner /> : <MessageCircle className="h-4 w-4" aria-hidden />}
      {label}
    </Button>
  );
}

/** Link simples para o WhatsApp com a mensagem padrão (cabeçalho, rodapé, banners). */
export function WhatsAppLink({
  number,
  message,
  children,
  variant = "whatsapp",
  size = "md",
  className,
  label,
}: {
  number: string | null;
  message: string;
  children?: React.ReactNode;
  variant?: Variant;
  size?: Size;
  className?: string;
  label?: string;
}) {
  if (!number) return null;
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <a
        href={buildWhatsappUrl(number, message)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        onClick={() => void trackGeneralClickAction({ label: label ?? "Contato geral" })}
      >
        {children ?? (
          <>
            <MessageCircle className="h-4 w-4" aria-hidden /> Falar no WhatsApp
          </>
        )}
      </a>
    </Button>
  );
}
