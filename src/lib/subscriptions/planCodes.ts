/**
 * Catálogo único de plan_code, compartido entre el frontend (selector de
 * /admin) y lo que se manda al RPC admin_set_subscription_status. Espeja
 * exactamente el CHECK constraint de subscriptions.plan_code y la
 * validación de la función SQL (supabase/migrations/0007_plan_code_catalog.sql)
 * — si algún día se agrega un plan nuevo, hay que tocar los dos lados a
 * la vez (este archivo y la migración) o el RPC va a rechazar valores
 * que el selector permite elegir.
 *
 * plan_code es puramente informativo/comercial: la autorización real
 * (quién entra a /app) depende de status + access_until
 * (src/lib/auth/membership.ts), nunca de plan_code.
 */

export const PLAN_CODES = ["admin", "trial", "monthly", "quarterly", "annual", "courtesy"] as const;

export type PlanCode = (typeof PLAN_CODES)[number];

export const PLAN_CODE_LABELS: Record<PlanCode, string> = {
  admin: "Administración",
  trial: "Prueba",
  monthly: "Mensual",
  quarterly: "Trimestral",
  annual: "Anual",
  courtesy: "Cortesía",
};

/** Valor interno para "sin plan asignado" en los <select> del panel admin. */
export const NO_PLAN_VALUE = "";
export const NO_PLAN_LABEL = "Sin plan";

export function isPlanCode(value: string): value is PlanCode {
  return (PLAN_CODES as readonly string[]).includes(value);
}

export interface PlanCodeOption {
  value: PlanCode | typeof NO_PLAN_VALUE;
  label: string;
}

/** Opciones listas para renderizar en un <select>, en el orden del catálogo. */
export const PLAN_CODE_OPTIONS: PlanCodeOption[] = [
  { value: NO_PLAN_VALUE, label: NO_PLAN_LABEL },
  ...PLAN_CODES.map((code) => ({ value: code, label: PLAN_CODE_LABELS[code] })),
];
