/**
 * Regla de acceso por estado de membresía. Función pura, sin dependencia
 * de Supabase — espeja exactamente la lógica de
 * current_user_has_active_membership() en la base de datos
 * (supabase/migrations/0004_functions_triggers.sql). La fuente de verdad
 * real es esa función SQL (y RLS, que la usa); esta versión en TypeScript
 * es solo para decidir redirecciones en el servidor sin depender de un
 * viaje extra a la base por cada chequeo.
 */

export type MembershipStatus = "trial" | "active" | "past_due" | "suspended" | "cancelled";

export interface SubscriptionSnapshot {
  status: MembershipStatus;
  access_until: string | null;
}

export function hasActiveMembership(subscription: SubscriptionSnapshot | null): boolean {
  if (!subscription) return false;

  const accessUntil = subscription.access_until ? new Date(subscription.access_until) : null;
  const now = new Date();

  switch (subscription.status) {
    case "trial":
    case "active":
      return accessUntil === null || accessUntil > now;
    case "cancelled":
      return accessUntil !== null && accessUntil > now;
    case "past_due":
    case "suspended":
    default:
      return false;
  }
}
