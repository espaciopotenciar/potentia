import { describe, expect, it } from "vitest";
import { resolveAction } from "@/lib/decisionEngine";
import { actionMatrix } from "@/data/actionMatrix";
import type { ActionAnswers } from "@/types/action";

function buildAnswers(overrides: Partial<ActionAnswers> = {}): ActionAnswers {
  return {
    hasPreviousConversation: true,
    saleType: "empresa",
    opportunityStage: "propuesta_sin_respuesta",
    unansweredMessages: 0,
    channel: "email",
    hasAgreedDate: false,
    ...overrides,
  };
}

describe("resolveAction", () => {
  it("sin conversación previa: no aplica el 4x4, sin importar el resto de las respuestas", () => {
    const result = resolveAction(buildAnswers({ hasPreviousConversation: false }), actionMatrix);
    expect(result).not.toBeNull();
    expect(result?.entry.recommendedStage).toBe("no_aplica_4x4");
    expect(result?.entry.applies4x4).toBe(false);
  });

  it("con fecha o próximo paso acordado: respeta la fecha en lugar de aplicar el 4x4", () => {
    const result = resolveAction(
      buildAnswers({ opportunityStage: "evaluando_propuesta", hasAgreedDate: true }),
      actionMatrix
    );
    expect(result).not.toBeNull();
    expect(result?.entry.recommendedStage).toBe("respetar_fecha");
    expect(result?.entry.applies4x4).toBe(false);
  });

  it("cero mensajes sin respuesta: recomienda preparar el primer contacto", () => {
    const result = resolveAction(buildAnswers({ unansweredMessages: 0 }), actionMatrix);
    expect(result).not.toBeNull();
    expect(result?.entry.recommendedStage).toBe("preparar_contacto");
  });

  it("un mensaje sin respuesta: recomienda mensaje 2 (aportar algo tangible)", () => {
    const result = resolveAction(buildAnswers({ unansweredMessages: 1 }), actionMatrix);
    expect(result).not.toBeNull();
    expect(result?.entry.recommendedStage).toBe("m2_tangible");
  });

  it("dos mensajes sin respuesta (empresa, email): recomienda mensaje 3 con el caso completo de demostración", () => {
    const result = resolveAction(
      buildAnswers({ unansweredMessages: 2, saleType: "empresa", channel: "email" }),
      actionMatrix
    );
    expect(result).not.toBeNull();
    expect(result?.entry.recommendedStage).toBe("m3_validacion");
    expect(result?.entry.id).toBe("a-propuesta-2");
  });

  it("tres mensajes sin respuesta: recomienda mensaje 4 (cerrar con firmeza amable)", () => {
    const result = resolveAction(buildAnswers({ unansweredMessages: 3 }), actionMatrix);
    expect(result).not.toBeNull();
    expect(result?.entry.recommendedStage).toBe("m4_cierre");
  });

  it("cuatro o más mensajes sin respuesta: recomienda nurturing", () => {
    const result = resolveAction(buildAnswers({ unansweredMessages: 4 }), actionMatrix);
    expect(result).not.toBeNull();
    expect(result?.entry.recommendedStage).toBe("nurturing");
    expect(result?.entry.applies4x4).toBe(false);
  });

  it("situación sin coincidencia exacta: devuelve una recomendación general segura, marcada como no exacta", () => {
    const result = resolveAction(buildAnswers({ opportunityStage: "otra_situacion" }), actionMatrix);
    expect(result).not.toBeNull();
    expect(result?.entry.recommendedStage).toBe("sin_coincidencia");
    expect(result?.matchedExactly).toBe(false);
  });

  it("devuelve null si todavía faltan respuestas obligatorias", () => {
    const result = resolveAction(buildAnswers({ channel: null }), actionMatrix);
    expect(result).toBeNull();
  });
});
