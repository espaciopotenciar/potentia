import Link from "next/link";

export function PotentiaLogo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="inline-flex flex-col leading-none group">
      <span className="text-xl font-semibold tracking-tight text-potentia-deep group-hover:opacity-80 transition-opacity">
        Potentia
      </span>
      {!compact && (
        <span className="text-[11px] font-medium tracking-wide text-potentia-muted mt-0.5">
          by Espacio Potenciar
        </span>
      )}
    </Link>
  );
}
