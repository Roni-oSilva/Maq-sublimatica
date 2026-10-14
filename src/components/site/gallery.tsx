"use client";

import { useState } from "react";
import { MediaImage } from "./media";
import { cn } from "@/lib/utils";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const list = images.length ? images : [null];
  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-3xl border border-line bg-white">
        <MediaImage src={list[active]} alt={alt} fit="contain" sizes="(min-width: 1024px) 50vw, 100vw" priority />
      </div>
      {list.length > 1 && (
        <ul className="mt-3 grid grid-cols-5 gap-2">
          {list.map((src, i) => (
            <li key={`${src}-${i}`}>
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver imagem ${i + 1}`}
                aria-current={i === active}
                className={cn("relative block aspect-square w-full overflow-hidden rounded-2xl border-2 bg-white", i === active ? "border-brand" : "border-line")}
              >
                <MediaImage src={src} alt="" sizes="96px" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
