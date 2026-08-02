import Link from "next/link";
import { Icon } from "@/components/icons";
import type { Objection } from "@/types/objection";

export function ObjectionCard({ objection }: { objection: Objection }) {
  return (
    <Link
      href={`/app/objeciones/${objection.slug}`}
      className="group flex flex-col justify-between rounded-2xl border border-potentia-sand bg-white p-5 shadow-card transition-colors hover:border-potentia-deep/30"
    >
      <div>
        <span className="text-[11px] font-semibold uppercase tracking-wide text-potentia-deep">
          {objection.category}
        </span>
        <h3 className="mt-1.5 text-base font-semibold text-potentia-ink">{objection.title}</h3>
        <p className="mt-2 text-sm italic text-potentia-muted">{objection.commonPhrase}</p>
      </div>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-potentia-deep">
        Ver cómo responder
        <Icon name="arrow-right" className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
