import type { Metadata } from "next";
import { getDataProvider } from "@/lib/dataProvider";
import { ObjectionCard } from "@/components/objections/ObjectionCard";

export const metadata: Metadata = {
  title: "Gestionar objeciones — Potentia",
  description: "Elegí lo que te dijo el potencial cliente y descubrí cómo profundizar, responder y proponer un próximo paso.",
};

export default function ObjectionsPage() {
  const objections = getDataProvider().getObjections();

  return (
    <div className="container-app py-10">
      <header className="mb-8 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">Objeciones</p>
        <h1 className="mt-2 text-2xl font-semibold text-potentia-ink md:text-3xl">Gestionar objeciones</h1>
        <p className="mt-3 text-sm text-potentia-muted md:text-base">
          Elegí lo que te dijo el potencial cliente y descubrí cómo profundizar, responder y proponer un
          próximo paso.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {objections.map((objection) => (
          <ObjectionCard key={objection.id} objection={objection} />
        ))}
      </div>
    </div>
  );
}
