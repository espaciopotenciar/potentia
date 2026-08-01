"use client";

import { Icon } from "@/components/icons";

export function OptionCard({
  label,
  description,
  selected,
  onSelect,
}: {
  label: string;
  description?: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex w-full min-h-[3.25rem] items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-left text-sm transition-colors ${
        selected
          ? "border-potentia-deep bg-potentia-deep text-white"
          : "border-potentia-sand bg-white text-potentia-ink hover:border-potentia-deep/40 hover:bg-potentia-sand/40"
      }`}
    >
      <span>
        <span className="block font-medium">{label}</span>
        {description && (
          <span className={`mt-0.5 block text-xs ${selected ? "text-white/80" : "text-potentia-muted"}`}>
            {description}
          </span>
        )}
      </span>
      {selected && <Icon name="check" className="h-4 w-4 shrink-0" />}
    </button>
  );
}
