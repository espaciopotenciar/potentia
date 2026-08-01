"use client";

import type { MessageVariant } from "@/types/action";

export type MessageStyleKey = "empathetic" | "neutral" | "direct";

const styleMeta: Record<MessageStyleKey, { title: string; description: string }> = {
  empathetic: {
    title: "Empático y consultivo",
    description: "Reconoce el contexto, demuestra escucha y facilita la decisión con calidez.",
  },
  neutral: {
    title: "Neutro y profesional",
    description: "Equilibrado y claro: retoma el punto pendiente y explica el siguiente paso.",
  },
  direct: {
    title: "Directo",
    description: "Menos introducción, propone una acción concreta y facilita una respuesta breve.",
  },
};

export function MessageStyleSelector({
  variants,
  selected,
  onSelect,
}: {
  variants: Record<MessageStyleKey, MessageVariant>;
  selected: MessageStyleKey | null;
  onSelect: (style: MessageStyleKey) => void;
}) {
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {(Object.keys(styleMeta) as MessageStyleKey[]).map((key) => {
        const meta = styleMeta[key];
        const isSelected = selected === key;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelect(key)}
            aria-pressed={isSelected}
            className={`flex flex-col rounded-2xl border p-5 text-left transition-colors ${
              isSelected
                ? "border-potentia-deep bg-potentia-deep text-white"
                : "border-potentia-sand bg-white text-potentia-ink hover:border-potentia-deep/40"
            }`}
          >
            <span className="text-sm font-semibold">{meta.title}</span>
            <span className={`mt-1.5 text-xs leading-relaxed ${isSelected ? "text-white/80" : "text-potentia-muted"}`}>
              {meta.description}
            </span>
            <span className={`mt-3 line-clamp-2 text-xs italic ${isSelected ? "text-white/70" : "text-potentia-muted/80"}`}>
              {`"${variants[key].example}"`}
            </span>
          </button>
        );
      })}
    </div>
  );
}
