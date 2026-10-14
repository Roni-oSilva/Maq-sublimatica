import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

function isOwnStorage(url: string): boolean {
  try {
    const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
    return Boolean(base) && new URL(url).hostname === new URL(base!).hostname;
  } catch {
    return false;
  }
}

/** Imagem otimizada; sem URL mostra um placeholder (sem layout shift). */
export function MediaImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw",
  priority,
  fit = "cover",
}: {
  src: string | null | undefined;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
  fit?: "cover" | "contain";
}) {
  if (!src) {
    return (
      <div
        className={cn("flex h-full w-full items-center justify-center bg-gradient-to-br from-brand-light via-white to-cyan-50 text-ink-muted/60", className)}
        role="img"
        aria-label={`${alt} (sem imagem)`}
      >
        <ImageIcon className="h-10 w-10" aria-hidden />
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!isOwnStorage(src)}
      className={cn(fit === "cover" ? "object-cover" : "object-contain", className)}
    />
  );
}
