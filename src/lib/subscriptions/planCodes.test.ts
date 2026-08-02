import { describe, expect, it } from "vitest";
import {
  NO_PLAN_VALUE,
  PLAN_CODES,
  PLAN_CODE_LABELS,
  PLAN_CODE_OPTIONS,
  isPlanCode,
} from "@/lib/subscriptions/planCodes";
import { hasActiveMembership, type SubscriptionSnapshot } from "@/lib/auth/membership";

describe("isPlanCode", () => {
  it("acepta cada uno de los seis valores permitidos", () => {
    for (const code of PLAN_CODES) {
      expect(isPlanCode(code)).toBe(true);
    }
  });

  it("rechaza un valor inválido", () => {
    expect(isPlanCode("premium")).toBe(false);
    expect(isPlanCode("")).toBe(false);
    expect(isPlanCode("Mensual")).toBe(false); // la etiqueta no es el valor guardado
  });
});

describe("PLAN_CODE_LABELS", () => {
  it("tiene una etiqueta en español para cada valor del catálogo, y ninguna etiqueta es igual al valor interno", () => {
    for (const code of PLAN_CODES) {
      expect(PLAN_CODE_LABELS[code]).toBeTruthy();
      expect(PLAN_CODE_LABELS[code]).not.toBe(code);
    }
  });
});

describe("PLAN_CODE_OPTIONS", () => {
  it("incluye la opción 'Sin plan' con valor interno vacío, primera en la lista", () => {
    expect(PLAN_CODE_OPTIONS[0]).toEqual({ value: NO_PLAN_VALUE, label: "Sin plan" });
  });

  it("tiene una opción por cada plan_code del catálogo, además de 'Sin plan'", () => {
    expect(PLAN_CODE_OPTIONS).toHaveLength(PLAN_CODES.length + 1);
  });
});

/**
 * Requisito explícito: cambiar plan_code no debe alterar por sí solo el
 * acceso. La garantía real es de tipos: SubscriptionSnapshot (el único
 * shape que hasActiveMembership/resolveAppAccess aceptan) tiene
 * únicamente { status, access_until } — plan_code ni siquiera es un
 * campo posible ahí, así que no hay forma de que una función de acceso
 * lo lea por error. Esta prueba dejaría de compilar (no solo de pasar)
 * si alguna vez se agrega plan_code a ese tipo y algo empieza a
 * depender de él.
 */
describe("plan_code no participa en la regla de acceso", () => {
  it("dos escenarios con el mismo status/access_until dan siempre el mismo resultado, sin que exista un campo plan_code que pueda influir", () => {
    const scenarioA = { status: "cancelled" as const, access_until: null };
    const scenarioB = { status: "cancelled" as const, access_until: null };

    // @ts-expect-error SubscriptionSnapshot no tiene plan_code: pasar uno
    // acá directamente (objeto literal) debe fallar la validación de tipos.
    const withPlanCodeAttempt: SubscriptionSnapshot = { ...scenarioA, plan_code: "monthly" };

    expect(hasActiveMembership(scenarioA)).toBe(hasActiveMembership(scenarioB));
    expect(hasActiveMembership(withPlanCodeAttempt)).toBe(hasActiveMembership(scenarioA));
  });
});
