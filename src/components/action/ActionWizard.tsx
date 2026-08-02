"use client";

import { useMemo, useState } from "react";
import { Icon } from "@/components/icons";
import { ProgressBar } from "@/components/shared/ProgressBar";
import { QuestionStep } from "@/components/action/QuestionStep";
import { OptionCard } from "@/components/action/OptionCard";
import { ActionResult } from "@/components/action/ActionResult";
import type { RelatedLessonSummary } from "@/components/shared/RelatedContent";
import {
  channelOptions,
  opportunityStageOptions,
  saleTypeOptions,
  unansweredMessagesOptions,
} from "@/components/action/questionConfig";
import { resolveAction, STAGES_WITH_AGREED_DATE_QUESTION } from "@/lib/decisionEngine";
import type { ActionAnswers, ActionMatrixEntry } from "@/types/action";

type StepId = "conversation" | "saleType" | "stage" | "messages" | "channel" | "agreedDate";

const EMPTY_ANSWERS: ActionAnswers = {
  hasPreviousConversation: null,
  saleType: null,
  opportunityStage: null,
  unansweredMessages: null,
  channel: null,
  hasAgreedDate: null,
};

function getSteps(answers: ActionAnswers): StepId[] {
  if (answers.hasPreviousConversation === false) {
    return ["conversation"];
  }
  const steps: StepId[] = ["conversation", "saleType", "stage", "messages", "channel"];
  if (answers.opportunityStage && STAGES_WITH_AGREED_DATE_QUESTION.includes(answers.opportunityStage)) {
    steps.push("agreedDate");
  }
  return steps;
}

export function ActionWizard({
  matrix,
  lessons,
}: {
  matrix: ActionMatrixEntry[];
  lessons: RelatedLessonSummary[];
}) {
  const [answers, setAnswers] = useState<ActionAnswers>(EMPTY_ANSWERS);
  const [stepIndex, setStepIndex] = useState(0);

  const steps = getSteps(answers);
  const currentStep = steps[stepIndex];
  const isFinished = stepIndex >= steps.length;

  const result = useMemo(() => (isFinished ? resolveAction(answers, matrix) : null), [isFinished, answers, matrix]);

  function restart() {
    setAnswers(EMPTY_ANSWERS);
    setStepIndex(0);
  }

  function goNext() {
    setStepIndex((index) => Math.min(index + 1, steps.length));
  }

  function goBack() {
    setStepIndex((index) => Math.max(index - 1, 0));
  }

  function canContinue(): boolean {
    switch (currentStep) {
      case "conversation":
        return answers.hasPreviousConversation !== null;
      case "saleType":
        return answers.saleType !== null;
      case "stage":
        return answers.opportunityStage !== null;
      case "messages":
        return answers.unansweredMessages !== null;
      case "channel":
        return answers.channel !== null;
      case "agreedDate":
        return answers.hasAgreedDate !== null;
      default:
        return false;
    }
  }

  if (isFinished) {
    if (!result) {
      return (
        <div className="container-app max-w-2xl py-16 text-center">
          <p className="text-sm text-potentia-muted">
            No pudimos calcular una recomendación con estas respuestas. Probá empezar de nuevo.
          </p>
          <button
            type="button"
            onClick={restart}
            className="mt-4 inline-flex items-center gap-2 rounded-full bg-potentia-deep px-5 py-2.5 text-sm font-medium text-white"
          >
            <Icon name="rotate-ccw" className="h-4 w-4" />
            Empezar de nuevo
          </button>
        </div>
      );
    }
    return <ActionResult result={result} allLessons={lessons} onRestart={restart} />;
  }

  const progressValue = Math.round((stepIndex / steps.length) * 100);

  return (
    <div className="container-app max-w-2xl py-10">
      <div className="mb-8">
        <ProgressBar value={progressValue} label={`Pregunta ${stepIndex + 1} de ${steps.length}`} />
      </div>

      {currentStep === "conversation" && (
        <QuestionStep eyebrow="Paso 1" title="¿Ya tuviste una conversación con esta persona?">
          <OptionCard
            label="Sí"
            selected={answers.hasPreviousConversation === true}
            onSelect={() => setAnswers((prev) => ({ ...prev, hasPreviousConversation: true }))}
          />
          <OptionCard
            label="No"
            selected={answers.hasPreviousConversation === false}
            onSelect={() => setAnswers((prev) => ({ ...prev, hasPreviousConversation: false }))}
          />
        </QuestionStep>
      )}

      {currentStep === "saleType" && (
        <QuestionStep eyebrow="Paso 2" title="¿Le vendés a una persona o a una empresa?">
          {saleTypeOptions.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              selected={answers.saleType === option.value}
              onSelect={() => setAnswers((prev) => ({ ...prev, saleType: option.value }))}
            />
          ))}
        </QuestionStep>
      )}

      {currentStep === "stage" && (
        <QuestionStep eyebrow="Paso 3" title="¿En qué momento está la oportunidad?">
          {opportunityStageOptions.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              selected={answers.opportunityStage === option.value}
              onSelect={() => setAnswers((prev) => ({ ...prev, opportunityStage: option.value }))}
            />
          ))}
        </QuestionStep>
      )}

      {currentStep === "messages" && (
        <QuestionStep
          eyebrow="Paso 4"
          title="Desde el último intercambio real, ¿cuántos mensajes enviaste sin recibir respuesta?"
          note="No cuentes mensajes administrativos ni repetidos. Pensá en contactos después de la última conversación útil."
        >
          {unansweredMessagesOptions.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              selected={answers.unansweredMessages === option.value}
              onSelect={() => setAnswers((prev) => ({ ...prev, unansweredMessages: option.value }))}
            />
          ))}
        </QuestionStep>
      )}

      {currentStep === "channel" && (
        <QuestionStep eyebrow="Paso 5" title="¿Por qué canal estás conversando?">
          {channelOptions.map((option) => (
            <OptionCard
              key={option.value}
              label={option.label}
              selected={answers.channel === option.value}
              onSelect={() => setAnswers((prev) => ({ ...prev, channel: option.value }))}
            />
          ))}
        </QuestionStep>
      )}

      {currentStep === "agreedDate" && (
        <QuestionStep eyebrow="Un detalle más" title="¿La persona te indicó una fecha o un próximo paso concreto?">
          <OptionCard
            label="Sí"
            selected={answers.hasAgreedDate === true}
            onSelect={() => setAnswers((prev) => ({ ...prev, hasAgreedDate: true }))}
          />
          <OptionCard
            label="No"
            selected={answers.hasAgreedDate === false}
            onSelect={() => setAnswers((prev) => ({ ...prev, hasAgreedDate: false }))}
          />
        </QuestionStep>
      )}

      <div className="mt-8 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={goBack}
          disabled={stepIndex === 0}
          className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full px-4 text-sm font-medium text-potentia-muted disabled:opacity-0"
        >
          <Icon name="chevron-left" className="h-4 w-4" />
          Anterior
        </button>
        <button
          type="button"
          onClick={goNext}
          disabled={!canContinue()}
          className="inline-flex min-h-[2.75rem] items-center gap-1.5 rounded-full bg-potentia-deep px-6 text-sm font-semibold text-white transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
        >
          Continuar
          <Icon name="chevron-right" className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-6 text-center">
        <button type="button" onClick={restart} className="text-xs font-medium text-potentia-muted hover:text-potentia-deep">
          Reiniciar
        </button>
      </div>
    </div>
  );
}
