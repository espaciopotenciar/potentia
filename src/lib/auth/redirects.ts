/**
 * Lista blanca de rutas internas a las que se puede redirigir después de
 * iniciar sesión o de procesar el callback de autenticación. Cualquier
 * valor que no esté acá (una URL externa, un "//host" protocol-relative,
 * una ruta inventada) cae al default seguro. Esto es lo que evita un
 * "open redirect" a través del parámetro redirectTo/next.
 */
const ALLOWED_INTERNAL_REDIRECTS = ["/app", "/mi-cuenta", "/actualizar-clave", "/admin"];

export function sanitizeInternalRedirect(path: string | null | undefined, fallback = "/app"): string {
  if (!path) return fallback;
  if (!ALLOWED_INTERNAL_REDIRECTS.includes(path)) return fallback;
  return path;
}

/**
 * A dónde redirigir después de /auth/confirm (ver route.ts), según el
 * "type" del enlace de Supabase que se está confirmando.
 *
 * Para type === "invite" se ignora "next" a propósito, incluso si viene
 * en la URL: una invitación tiene que terminar siempre en
 * /actualizar-clave, sin excepción, para forzar que la persona defina su
 * contraseña antes de hacer cualquier otra cosa. No confiar en el valor
 * de "next" acá evita que un enlace de invitación manipulado salte ese
 * paso.
 */
export function resolveConfirmRedirect(type: string | null, next: string | null | undefined): string {
  if (type === "invite") {
    return "/actualizar-clave";
  }
  return sanitizeInternalRedirect(next, "/actualizar-clave");
}
