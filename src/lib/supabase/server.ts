import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Cliente Supabase para Server Components, Route Handlers y Server
 * Actions. Lee/escribe la sesión vía cookies del request actual.
 *
 * El bloque try/catch en setAll cubre el caso de un Server Component
 * (no puede escribir cookies): se ignora ahí porque el middleware
 * (src/middleware.ts) ya se encarga de refrescar la sesión en cada
 * request.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component: no puede escribir cookies. El middleware
            // ya refresca la sesión en cada request, así que se ignora.
          }
        },
      },
    }
  );
}
