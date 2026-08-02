import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { hasActiveMembership } from "@/lib/auth/membership";

/**
 * Validación server-side de sesión + membresía para todo lo que cuelgue
 * de este grupo de rutas ((private) no agrega segmento a la URL: cubre
 * /app y /mi-cuenta). Esta es la capa de autorización real — el
 * middleware (src/middleware.ts) solo hace una redirección rápida por
 * "hay o no hay sesión"; acá se vuelve a validar todo desde cero contra
 * la base, y además está respaldado por RLS (aunque este layout tuviera
 * un bug, ninguna tabla de contenido le devolvería filas a alguien sin
 * membresía activa).
 *
 * Reglas (igual que current_user_has_active_membership() en la base):
 * sin sesión -> /login
 * sin fila de subscription -> /membresia-inactiva
 * status trial/active -> permitido si access_until es null o futuro
 * status past_due/suspended -> /membresia-inactiva siempre
 * status cancelled -> permitido solo si access_until es futuro
 */
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { userId, profile } = await getAuthContext();

  if (!userId) {
    redirect("/login");
  }

  if (!profile || !hasActiveMembership(profile.subscription)) {
    redirect("/membresia-inactiva");
  }

  return <>{children}</>;
}
