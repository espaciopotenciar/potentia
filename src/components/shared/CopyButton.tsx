"use client";

import { useState } from "react";
import { Icon } from "@/components/icons";

export function CopyButton({ text, label = "Copiar mensaje" }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Si el navegador bloquea el portapapeles, no interrumpimos la experiencia.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-potentia-deep px-4 text-sm font-medium text-potentia-deep transition-colors hover:bg-potentia-deep hover:text-white"
      aria-live="polite"
    >
      <Icon name={copied ? "check" : "copy"} className="h-4 w-4" />
      {copied ? "¡Copiado!" : label}
    </button>
  );
}
