import type { ReactNode } from "react";
import { Icon, type IconName } from "@/components/icons";

export function EmptyState({
  icon = "search",
  title,
  description,
  action,
}: {
  icon?: IconName;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-potentia-sand bg-white/60 px-6 py-12 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-potentia-sand text-potentia-deep">
        <Icon name={icon} className="h-6 w-6" />
      </span>
      <h3 className="text-base font-semibold text-potentia-ink">{title}</h3>
      <p className="max-w-sm text-sm text-potentia-muted">{description}</p>
      {action}
    </div>
  );
}
