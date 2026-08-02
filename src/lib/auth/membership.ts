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

/**
 * Snapshot mínimo del perfil que necesitan las reglas de acceso de acá
 * abajo — no todo CurrentProfile, para no acoplar esto a session.ts.
 */
export interface ProfileAccessSnapshot {
  role: "user" | "admin";
  subscription: SubscriptionSnapshot | null;
}

export type AppAccessDecision = "login" | "membership-inactive" | "ok";

/**
 * Regla de acceso de src/app/(private)/layout.tsx, como función pura
 * para poder probar cada caso (sin sesión, sin fila de profile, cada
 * status de membresía) sin tener que montar el layout ni pegarle a
 * Supabase.
 */
export function resolveAppAccess(
  userId: string | null,
  profile: ProfileAccessSnapshot | null
): AppAccessDecision {
  if (!userId) return "login";
  if (!profile || !hasActiveMembership(profile.subscription)) return "membership-inactive";
  return "ok";
}

export type AdminAccessDecision = "login" | "forbidden" | "ok";

/**
 * Regla de acceso de src/app/admin/layout.tsx: sesión + role === 'admin',
 * independiente de la membresía propia del admin (ver comentario en ese
 * archivo).
 */
export function resolveAdminAccess(
  userId: string | null,
  profile: ProfileAccessSnapshot | null
): AdminAccessDecision {
  if (!userId) return "login";
  if (!profile || profile.role !== "admin") return "forbidden";
  return "ok";
}
