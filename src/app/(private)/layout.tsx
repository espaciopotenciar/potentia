import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { hasActiveMembership } from "@/lib/auth/membership";
import { AppHeader } from "@/components/layout/AppHeader";
import { MobileNavigation } from "@/components/layout/MobileNavigation";

/**
 * Validación server-side de sesión + membresía para todo lo que cuelgue
 * de este grupo de rutas ((private) no agrega segmento a la URL: cubre
 * /app, /app/aprender, /app/accionar, /app/objeciones, /app/buscar y
 * /mi-cuenta). Esta es la capa de autorización real — el middleware
 * (src/middleware.ts) solo hace una redirección rápida por "hay o no hay
 * sesión"; acá se vuelve a validar todo desde cero contra la base, y
 * además está respaldado por RLS (aunque este layout tuviera un bug,
 * ninguna tabla de contenido le devolvería filas a alguien sin membresía
 * activa).
 *
 * Reglas (igual que current_user_has_active_membership() en la base):
 * sin sesión -> /login
 * sin fila de subscription -> /membresia-inactiva
 * status trial/active -> permitido si access_until es null o futuro
 * status past_due/suspended -> /membresia-inactiva siempre
 * status cancelled -> permitido solo si access_until es futuro
 *
 * También provee el header/nav reales de la app (AppHeader,
 * MobileNavigation) — a diferencia del layout raíz, que quedó sin
 * navegación porque las páginas públicas no la necesitan.
 */
export default async function PrivateLayout({ children }: { children: React.ReactNode }) {
  const { userId, profile } = await getAuthContext();

  if (!userId) {
    redirect("/login");
  }

  if (!profile || !hasActiveMembership(profile.subscription)) {
    redirect("/membresia-inactiva");
  }

  return (
    <>
      <AppHeader role={profile.role} />
      <div className="pb-24 md:pb-12">{children}</div>
      <MobileNavigation />
    </>
  );
}
