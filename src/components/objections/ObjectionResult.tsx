"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { WarningCard } from "@/components/shared/WarningCard";
import { RelatedContent } from "@/components/shared/RelatedContent";
import { MessageStyleSelector, type MessageStyleKey } from "@/components/action/MessageStyleSelector";
import { TemplateVariablesForm } from "@/components/action/TemplateVariablesForm";
import { MessagePreview } from "@/components/action/MessagePreview";
import { extractVariables, fillTemplate } from "@/lib/template";
import type { Objection } from "@/types/objection";

export function ObjectionResult({ objection }: { objection: Objection }) {
  const [selectedStyle, setSelectedStyle] = useState<MessageStyleKey | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const variants = useMemo(
    () => ({
      empathetic: { ...objection.empathetic, requiredVariables: extractVariables(objection.empathetic.template) },
      neutral: { ...objection.neutral, requiredVariables: extractVariables(objection.neutral.template) },
      direct: { ...objection.direct, requiredVariables: extractVariables(objection.direct.template) },
    }),
    [objection]
  );

  const activeVariant = selectedStyle ? variants[selectedStyle] : null;
  const previewText = activeVariant ? fillTemplate(activeVariant.template, values) : "";

  function handleSelectStyle(style: MessageStyleKey) {
    setSelectedStyle(style);
    setValues({});
  }

  return (
    <div className="container-app max-w-3xl py-10">
      <Link href="/objeciones" className="inline-flex items-center gap-1.5 text-sm font-medium text-potentia-muted hover:text-potentia-deep">
        <Icon name="chevron-left" className="h-4 w-4" />
        Volver a Objeciones
      </Link>

      <header className="mt-4 mb-8">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-potentia-deep">{objection.category}</span>
        <h1 className="mt-1.5 text-2xl font-semibold text-potentia-ink md:text-3xl">{objection.title}</h1>
        <p className="mt-3 text-sm italic text-potentia-muted">{objection.commonPhrase}</p>
      </header>

      <section className="grid gap-6 md:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-potentia-ink">Qué puede haber detrás</h2>
          <ul className="mt-2 space-y-2 text-sm text-potentia-muted">
            {objection.whatItMayExpress.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span aria-hidden="true">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-potentia-ink">Antes de responder</h2>
          <ul className="mt-2 space-y-2 text-sm text-potentia-muted">
            {objection.whatNotToAssume.map((item, index) => (
              <li key={index} className="flex gap-2">
                <span aria-hidden="true">•</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-8 rounded-2xl bg-potentia-sand p-5">
        <h2 className="text-sm font-semibold text-potentia-ink">Preguntas que podés hacer</h2>
        <ul className="mt-3 space-y-2">
          {objection.questionsToExplore.map((question, index) => (
            <li key={index} className="rounded-xl bg-white px-4 py-2.5 text-sm text-potentia-ink shadow-card">
              {question}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold text-potentia-ink">Qué evitar</h2>
        <ul className="mt-2 space-y-2 text-sm text-potentia-muted">
          {objection.whatToAvoid.map((item, index) => (
            <li key={index} className="flex gap-2">
              <span aria-hidden="true">•</span>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-semibold text-potentia-ink">Elegí un estilo de respuesta</h2>
        <p className="mt-1 text-sm text-potentia-muted">Próximo paso buscado: {objection.nextGoal}</p>
        <div className="mt-4">
          <MessageStyleSelector variants={variants} selected={selectedStyle} onSelect={handleSelectStyle} />
        </div>
      </section>

      {activeVariant && (
        <section className="mt-6 space-y-5 rounded-2xl border border-potentia-sand bg-white p-5 shadow-card">
          <TemplateVariablesForm
            variables={activeVariant.requiredVariables}
            values={values}
            onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
          />
          <div>
            <h3 className="mb-2 text-sm font-semibold text-potentia-ink">Vista previa</h3>
            <MessagePreview text={previewText} />
          </div>
        </section>
      )}

      <div className="mt-10">
        <WarningCard>{objection.mistakeToAvoid}</WarningCard>
      </div>

      <div className="mt-10">
        <RelatedContent lessonIds={objection.relatedLessonIds} />
      </div>
    </div>
  );
}
