/**
 * Lista blanca de rutas internas a las que se puede redirigir después de
 * iniciar sesión o de procesar el callback de autenticación. Cualquier
 * valor que no esté acá (una URL externa, un "//host" protocol-relative,
 * una ruta inventada) cae al default seguro. Esto es lo que evita un
 * "open redirect" a través del parámetro redirectTo/next.
 */
const ALLOWED_INTERNAL_REDIRECTS = ["/app", "/mi-cuenta", "/actualizar-clave"];

export function sanitizeInternalRedirect(path: string | null | undefined, fallback = "/app"): string {
  if (!path) return fallback;
  if (!ALLOWED_INTERNAL_REDIRECTS.includes(path)) return fallback;
  return path;
}
