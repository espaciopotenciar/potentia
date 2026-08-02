import type { Metadata } from "next";
import { getLessons, getObjections, getSearchConcepts } from "@/lib/content/repository";
import { BuscarClient } from "@/components/search/BuscarClient";

export const metadata: Metadata = {
  title: "Buscar — Potentia",
  description: "Buscá en lecciones, objeciones y conceptos del Sistema 4x4.",
};

export default async function BuscarPage() {
  const [lessons, objections, concepts] = await Promise.all([
    getLessons(),
    getObjections(),
    getSearchConcepts(),
  ]);

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

      <BuscarClient lessons={lessons} objections={objections} concepts={concepts} />
    </div>
  );
}
