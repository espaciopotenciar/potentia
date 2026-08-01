"use client";

import { useMemo, useState } from "react";
import { SearchBar } from "@/components/search/SearchBar";
import { SearchResults } from "@/components/search/SearchResults";
import { EmptyState } from "@/components/shared/EmptyState";
import { getDataProvider } from "@/lib/dataProvider";

export default function BuscarPage() {
  const [query, setQuery] = useState("");
  const provider = useMemo(() => getDataProvider(), []);
  const results = useMemo(() => provider.searchContent(query), [provider, query]);

  return (
    <div className="container-app py-10">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">Buscar</p>
        <h1 className="mt-2 text-2xl font-semibold text-potentia-ink md:text-3xl">Buscar en Potentia</h1>
        <p className="mt-3 text-sm text-potentia-muted md:text-base">
          Buscá en lecciones, objeciones y conceptos del Sistema 4x4. La búsqueda ignora mayúsculas y
          tildes, y busca coincidencias parciales.
        </p>
      </header>

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
    </div>
  );
}
