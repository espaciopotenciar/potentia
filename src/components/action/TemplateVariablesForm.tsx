"use client";

import { VARIABLE_LABELS } from "@/lib/template";

export function TemplateVariablesForm({
  variables,
  values,
  onChange,
}: {
  variables: string[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {variables.map((variable) => (
        <div key={variable}>
          <label htmlFor={`var-${variable}`} className="mb-1.5 block text-xs font-medium text-potentia-ink">
            {VARIABLE_LABELS[variable] ?? variable}
          </label>
          <input
            id={`var-${variable}`}
            type="text"
            value={values[variable] ?? ""}
            onChange={(event) => onChange(variable, event.target.value)}
            placeholder={VARIABLE_LABELS[variable] ?? variable}
            className="min-h-[2.75rem] w-full rounded-xl border border-potentia-sand bg-white px-3.5 text-sm text-potentia-ink placeholder:text-potentia-muted/70 focus:border-potentia-deep"
          />
        </div>
      ))}
    </div>
  );
}
