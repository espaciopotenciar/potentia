"use client";

import { Icon } from "@/components/icons";

export function SearchBar({
  value,
  onChange,
  autoFocus,
}: {
  value: string;
  onChange: (value: string) => void;
  autoFocus?: boolean;
}) {
  return (
    <div className="relative">
      <Icon
        name="search"
        className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-potentia-muted"
      />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(event) => onChange(event.target.value)}
        placeholder="Buscar: presupuesto, mensaje 3, nurturing, reunión…"
        aria-label="Buscar en Potentia"
        className="min-h-[3.25rem] w-full rounded-full border border-potentia-sand bg-white pl-12 pr-4 text-sm text-potentia-ink placeholder:text-potentia-muted focus:border-potentia-deep"
      />
    </div>
  );
}
