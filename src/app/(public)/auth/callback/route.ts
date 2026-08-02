import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sanitizeInternalRedirect } from "@/lib/auth/redirects";

/**
 * Punto de retorno de todos los flujos de Supabase Auth basados en enlace
 * (recuperación de contraseña, invitación). Intercambia el "code" por una
 * sesión real y redirige a una ruta interna.
 *
 * El parámetro "next" pasa por sanitizeInternalRedirect(), que solo
 * acepta valores de una lista blanca — así se evita un "open redirect"
 * (alguien armando un enlace de Supabase legítimo con ?next=https://sitio-malicioso.com).
 */
export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeInternalRedirect(searchParams.get("next"));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "auth_callback_failed");
  return NextResponse.redirect(loginUrl);
}
