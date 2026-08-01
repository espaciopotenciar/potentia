import type { ReactNode } from "react";

export function QuestionStep({
  eyebrow,
  title,
  note,
  children,
}: {
  eyebrow: string;
  title: string;
  note?: string;
  children: ReactNode;
}) {
  return (
    <div className="animate-[fadeIn_.25s_ease]">
      <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold leading-snug text-potentia-ink md:text-2xl">{title}</h2>
      {note && <p className="mt-2 text-sm text-potentia-muted">{note}</p>}
      <div className="mt-6 grid gap-3">{children}</div>
    </div>
  );
}
