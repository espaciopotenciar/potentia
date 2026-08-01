import type { ActionAnswers, ActionMatrixEntry, ActionResultData, OpportunityStage } from "@/types/action";

/**
 * Etapas para las que Potentia pregunta si existe una fecha o próximo paso acordado.
 */
export const STAGES_WITH_AGREED_DATE_QUESTION: OpportunityStage[] = [
  "confirmo_si_no_avanza",
  "hablarlo_con_tercero",
  "conversemos_mas_adelante",
  "evaluando_propuesta",
];

function fieldScore<T>(entryValue: T | "cualquiera", answerValue: T | null): number | null {
  if (entryValue === "cualquiera") return 0;
  if (answerValue === null) return null;
  return entryValue === answerValue ? 1 : null;
}

/**
 * Calcula qué tan específica es la coincidencia de un registro de la matriz
 * respecto de las respuestas. Devuelve null si el registro no aplica.
 */
function matchScore(entry: ActionMatrixEntry, answers: ActionAnswers, effectiveHasAgreedDate: boolean): number | null {
  if (entry.hasPreviousConversation !== answers.hasPreviousConversation) return null;

  const stageScore = fieldScore(entry.opportunityStage, answers.opportunityStage);
  const messagesScore = fieldScore(entry.unansweredMessages, answers.unansweredMessages);
  const saleTypeScore = fieldScore(entry.saleType, answers.saleType);
  const channelScore = fieldScore(entry.channel, answers.channel);
  const dateScore = fieldScore(entry.hasAgreedDate, effectiveHasAgreedDate);

  if (
    stageScore === null ||
    messagesScore === null ||
    saleTypeScore === null ||
    channelScore === null ||
    dateScore === null
  ) {
    return null;
  }

  return stageScore + messagesScore + saleTypeScore + channelScore + dateScore;
}

/**
 * Función pura y testeable: recibe las respuestas del asistente Accionar
 * y la matriz de acciones, y determina el resultado recomendado.
 *
 * Prioridad de decisión (ver README.md → sección de lógica):
 * 1. Conversación previa (si no existió, no aplica el 4x4).
 * 2. Fecha o próximo paso acordado (si existe, se respeta la fecha).
 * 3. Etapa de la oportunidad + cantidad de mensajes sin respuesta.
 * 4. Tipo de venta y canal, como afinadores de la coincidencia.
 */
export function resolveAction(answers: ActionAnswers, matrix: ActionMatrixEntry[]): ActionResultData | null {
  const activeEntries = matrix.filter((entry) => entry.active);

  // Prioridad 1: sin conversación previa, el 4x4 no aplica. Esta ruta no
  // depende de las demás respuestas, así que se resuelve antes que nada.
  if (answers.hasPreviousConversation === false) {
    const noConversationEntry = activeEntries.find((entry) => entry.hasPreviousConversation === false);
    if (noConversationEntry) {
      return { entry: noConversationEntry, matchedExactly: true };
    }
    return null;
  }

  if (
    answers.hasPreviousConversation === null ||
    answers.saleType === null ||
    answers.opportunityStage === null ||
    answers.unansweredMessages === null ||
    answers.channel === null
  ) {
    return null;
  }
  const effectiveHasAgreedDate = answers.hasAgreedDate === true;

  let best: ActionMatrixEntry | null = null;
  let bestScore = -1;

  for (const entry of activeEntries) {
    const score = matchScore(entry, answers, effectiveHasAgreedDate);
    if (score !== null && score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }

  if (!best) {
    const fallback = activeEntries.find((entry) => entry.recommendedStage === "sin_coincidencia");
    if (fallback) {
      return { entry: fallback, matchedExactly: false };
    }
    return null;
  }

  // La coincidencia se considera "exacta" cuando ningún campo relevante quedó
  // sin usar comodín salvo los que la propia oportunidad deja abiertos.
  const matchedExactly = bestScore >= 3;

  return { entry: best, matchedExactly };
}
