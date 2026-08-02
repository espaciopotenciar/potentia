import { NextResponse } from "next/server";
import type { EmailOtpType } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { resolveConfirmRedirect } from "@/lib/auth/redirects";

/**
 * Endpoint propio para confirmar enlaces de Supabase Auth basados en
 * "token_hash" (invitación, y en el futuro magic link / email_change si
 * hicieran falta) — NO el flujo de recuperación de contraseña, que sigue
 * usando /auth/callback con "code" (PKCE), sin cambios.
 *
 * Por qué existe esto además de /auth/callback:
 * Una invitación se crea desde el Dashboard de Supabase (o, más adelante,
 * desde una función administrativa server-side) — no hay ningún navegador
 * de la persona invitada involucrado en ese momento, así que no existe
 * ningún "code_verifier" de PKCE para emparejar. El enlace que genera
 * Supabase para ese tipo de acciones usa en cambio un "token_hash" de un
 * solo uso, pensado exactamente para verificarse con
 * supabase.auth.verifyOtp() del lado del servidor.
 *
 * Al llamar verifyOtp() con el cliente de src/lib/supabase/server.ts (que
 * sabe escribir cookies compatibles con @supabase/ssr), la sesión queda
 * establecida vía cookies — igual que con exchangeCodeForSession() en
 * /auth/callback — nunca como access_token/refresh_token en la URL. La
 * plantilla "Invite user" en Supabase tiene que apuntar acá (ver
 * docs/AUTH_MVP_STAGE2.md) en vez de usar {{ .ConfirmationURL }}, que
 * dispara el flujo implícito viejo (sesión en el fragmento #, sin cookies
 * SSR, y termina en la portada pública si no se maneja).
 */
const ALLOWED_OTP_TYPES: EmailOtpType[] = ["invite", "recovery", "email_change"];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const tokenHash = searchParams.get("token_hash");
  const rawType = searchParams.get("type");
  const type = ALLOWED_OTP_TYPES.find((allowed) => allowed === rawType) ?? null;
  const next = resolveConfirmRedirect(rawType, searchParams.get("next"));

  if (tokenHash && type) {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

    if (!error) {
      // Sesión ya establecida vía cookies en este punto. La URL de
      // redirección no lleva ningún token: solo la ruta interna.
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // token_hash ausente/inválido, type no permitido, o verifyOtp falló
  // (enlace vencido o ya usado — Supabase invalida el token_hash después
  // del primer uso exitoso). Mismo mensaje genérico para ambos casos: no
  // hace falta distinguirlos para la persona invitada, y evita dar pistas
  // sobre el estado interno del token.
  const loginUrl = new URL("/login", origin);
  loginUrl.searchParams.set("error", "invite_link_invalid");
  return NextResponse.redirect(loginUrl);
}
