import Link from "next/link";
import { highlightMatches } from "@/lib/textUtils";
import type { SearchResultGroup, SearchResultItem } from "@/types/search";

const groupLabels: Record<SearchResultGroup, string> = {
  aprender: "Aprender",
  objeciones: "Objeciones",
  conceptos: "Conceptos y recomendaciones",
};

function Highlighted({ text, query }: { text: string; query: string }) {
  const segments = highlightMatches(text, query);
  return (
    <>
      {segments.map((segment, index) =>
        segment.match ? (
          <mark key={index} className="rounded bg-potentia-lime/60 px-0.5 text-potentia-ink">
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      )}
    </>
  );
}

export function SearchResults({ results, query }: { results: SearchResultItem[]; query: string }) {
  const groups: SearchResultGroup[] = ["aprender", "objeciones", "conceptos"];

  return (
    <div className="space-y-8">
      {groups.map((group) => {
        const groupResults = results.filter((result) => result.group === group);
        if (groupResults.length === 0) return null;

        return (
          <section key={group} aria-label={groupLabels[group]}>
            <h2 className="mb-3 text-xs font-semibold uppercase tracking-wide text-potentia-deep">
              {groupLabels[group]} · {groupResults.length}
            </h2>
            <ul className="space-y-2">
              {groupResults.map((result) => (
                <li key={result.id}>
                  <Link
                    href={result.href}
                    className="block rounded-2xl border border-potentia-sand bg-white p-4 transition-colors hover:border-potentia-deep/30 hover:bg-potentia-sand/40"
                  >
                    <p className="text-sm font-semibold text-potentia-ink">
                      <Highlighted text={result.title} query={query} />
                    </p>
                    <p className="mt-1 text-sm text-potentia-muted">
                      <Highlighted text={result.snippet} query={query} />
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
