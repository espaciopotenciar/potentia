import { Icon } from "@/components/icons";

export function WarningCard({ children, title = "Error a evitar" }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="flex gap-3 rounded-2xl border border-potentia-deep/10 bg-white p-4">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-potentia-sand text-potentia-deep">
        <Icon name="x" className="h-4 w-4" />
      </span>
      <div>
        <p className="text-sm font-semibold text-potentia-ink">{title}</p>
        <p className="mt-0.5 text-sm text-potentia-ink/80">{children}</p>
      </div>
    </div>
  );
}
