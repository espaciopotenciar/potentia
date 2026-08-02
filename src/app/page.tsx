import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { hasActiveMembership } from "@/lib/auth/membership";

/**
 * "/" ya no es la landing de marketing con Aprender/Accionar/Objeciones/
 * Buscar visibles sin sesión (eso era exactamente el problema de
 * seguridad diagnosticado en la Etapa 1: contenido pago embebido en un
 * bundle público). Ahora es una redirección inteligente, sin renderizar
 * ningún contenido de la app:
 *
 *   sin sesión                          -> /login
 *   con sesión y membresía activa       -> /app
 *   con sesión y membresía inactiva     -> /membresia-inactiva
 *
 * Usa la misma validación server-side que el layout de (private) — no es
 * una segunda implementación de la regla, es la misma función.
 */
export default async function RootPage() {
  const { userId, profile } = await getAuthContext();

  if (!userId) {
    redirect("/login");
  }

  if (!profile || !hasActiveMembership(profile.subscription)) {
    redirect("/membresia-inactiva");
  }

  redirect("/app");
}
