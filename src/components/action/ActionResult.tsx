"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { AdviceCard } from "@/components/shared/AdviceCard";
import { WarningCard } from "@/components/shared/WarningCard";
import { RelatedContent } from "@/components/shared/RelatedContent";
import { MessageStyleSelector, type MessageStyleKey } from "@/components/action/MessageStyleSelector";
import { TemplateVariablesForm } from "@/components/action/TemplateVariablesForm";
import { MessagePreview } from "@/components/action/MessagePreview";
import { fillTemplate } from "@/lib/template";
import type { ActionResultData } from "@/types/action";

export function ActionResult({ result, onRestart }: { result: ActionResultData; onRestart: () => void }) {
  const { entry, matchedExactly } = result;
  const [selectedStyle, setSelectedStyle] = useState<MessageStyleKey | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});

  const variants = useMemo(
    () => ({ empathetic: entry.empathetic, neutral: entry.neutral, direct: entry.direct }),
    [entry]
  );

  const activeVariant = selectedStyle ? variants[selectedStyle] : null;

  function handleSelectStyle(style: MessageStyleKey) {
    setSelectedStyle(style);
    setValues({});
  }

  const previewText = activeVariant ? fillTemplate(activeVariant.template, values) : "";

  return (
    <div className="container-app max-w-3xl py-10">
      {!matchedExactly && (
        <div className="mb-6 rounded-2xl border border-potentia-lavenderDark bg-potentia-lavender/30 p-4 text-sm text-potentia-ink">
          Tu situación no coincide exactamente con una ruta predefinida. Te mostramos la recomendación
          general más segura para este caso: revisá también los contenidos relacionados.
        </div>
      )}

      <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">Tu situación</p>
      <p className="mt-2 text-base leading-relaxed text-potentia-ink md:text-lg">{entry.interpretation}</p>

      <div className="mt-8 rounded-2xl bg-potentia-deep p-6 text-white shadow-soft">
        <p className="text-xs uppercase tracking-wide text-potentia-lime">Seguimiento recomendado</p>
        <h2 className="mt-1 text-xl font-semibold md:text-2xl">{entry.stageName}</h2>
        <p className="mt-3 text-sm leading-relaxed text-white/85">
          <span className="font-semibold">Objetivo: </span>
          {entry.objective}
        </p>
      </div>

      <section className="mt-8">
        <h3 className="text-sm font-semibold text-potentia-ink">Qué hacer ahora</h3>
        <p className="mt-2 text-sm leading-relaxed text-potentia-muted">{entry.suggestedAction}</p>
      </section>

      <section className="mt-10">
        <h3 className="text-sm font-semibold text-potentia-ink">Elegí un estilo de mensaje</h3>
        <p className="mt-1 text-sm text-potentia-muted">Cada estilo comunica lo mismo con un tono distinto. Elegí el que mejor se ajuste a tu vínculo con esta persona.</p>
        <div className="mt-4">
          <MessageStyleSelector variants={variants} selected={selectedStyle} onSelect={handleSelectStyle} />
        </div>
      </section>

      {activeVariant && (
        <section className="mt-6 space-y-5 rounded-2xl border border-potentia-sand bg-white p-5 shadow-card">
          <div>
            <h4 className="text-sm font-semibold text-potentia-ink">Personalizá tu mensaje</h4>
            <p className="mt-1 text-xs text-potentia-muted">
              Completá las variables que necesites. Los campos vacíos se muestran entre corchetes en la vista previa.
            </p>
          </div>
          <TemplateVariablesForm
            variables={activeVariant.requiredVariables}
            values={values}
            onChange={(key, value) => setValues((prev) => ({ ...prev, [key]: value }))}
          />
          <div>
            <h4 className="mb-2 text-sm font-semibold text-potentia-ink">Vista previa</h4>
            <MessagePreview text={previewText} />
          </div>
        </section>
      )}

      <div className="mt-10 grid gap-4 sm:grid-cols-2">
        <AdviceCard>{entry.advice}</AdviceCard>
        <WarningCard>{entry.mistakeToAvoid}</WarningCard>
      </div>

      <div className="mt-10">
        <RelatedContent lessonIds={entry.relatedLessonIds} />
      </div>

      <div className="mt-10 flex justify-center">
        <button
          type="button"
          onClick={onRestart}
          className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-potentia-sand px-5 text-sm font-medium text-potentia-ink hover:bg-potentia-sand/60"
        >
          <Icon name="rotate-ccw" className="h-4 w-4" />
          Empezar de nuevo
        </button>
      </div>
    </div>
  );
}
