"use client";

import { useMemo, useState } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { EmptyState } from "@/components/shared/EmptyState";
import { searchContent } from "@/lib/content/searchContent";
import type { Lesson } from "@/types/lesson";
import type { Objection } from "@/types/objection";
import type { ConceptSummary } from "@/lib/content/mappers";

/**
 * El fetch a Supabase lo hace la página server-side, una sola vez por
 * carga (ver src/app/(private)/app/buscar/page.tsx) — este componente
 * solo filtra en memoria mientras se tipea, igual que hacía
 * LocalDataProvider.searchContent() antes de la Etapa 3. Evita una
 * consulta a la base por cada letra.
 */
export function BuscarClient({
  lessons,
  objections,
  concepts,
}: {
  lessons: Lesson[];
  objections: Objection[];
  concepts: ConceptSummary[];
}) {
  const [query, setQuery] = useState("");
  const results = useMemo(
    () => searchContent(query, { lessons, objections, concepts }),
    [query, lessons, objections, concepts]
  );

  return (
    <>
      <div className="max-w-xl">
        <SearchBar value={query} onChange={setQuery} autoFocus />
      </div>

      <div className="mt-8">
        {query.trim().length === 0 ? (
          <EmptyState
            icon="search"
            title="Empezá a escribir para buscar"
            description="Probá con términos como presupuesto, propuesta, no responde, mensaje 3, nurturing, cierre, reunión, CRM o seguimiento."
          />
        ) : results.length === 0 ? (
          <EmptyState
            icon="search"
            title="No encontramos resultados"
            description={`No hay coincidencias para "${query}". Probá con otra palabra o revisá la sección Aprender.`}
          />
        ) : (
          <SearchResults results={results} query={query} />
        )}
      </div>
    </>
  );
}
