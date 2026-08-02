import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { MembershipStatus } from "@/lib/auth/membership";

export interface CurrentSubscription {
  status: MembershipStatus;
  access_until: string | null;
  plan_code: string | null;
  starts_at: string | null;
}

export interface CurrentProfile {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
  subscription: CurrentSubscription | null;
}

export interface AuthContext {
  userId: string | null;
  userEmail: string | null;
  profile: CurrentProfile | null;
}

/**
 * Punto único para leer "quién es el usuario actual y cuál es su
 * membresía", del lado del servidor. Todo lo que necesite esa
 * información (el layout privado, /membresia-inactiva, /mi-cuenta, un
 * futuro panel admin) pasa por acá en vez de armar su propia consulta a
 * Supabase.
 *
 * Devuelve profile: null tanto si no hay sesión como si, por algún
 * motivo, no existe la fila de profiles — en ambos casos el llamador
 * debe tratarlo como "sin acceso".
 */
export async function getAuthContext(): Promise<AuthContext> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { userId: null, userEmail: null, profile: null };
  }

  const [{ data: profile }, { data: subscription }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, role").eq("id", user.id).maybeSingle(),
    supabase
      .from("subscriptions")
      .select("status, access_until, plan_code, starts_at")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  if (!profile) {
    return { userId: user.id, userEmail: user.email ?? null, profile: null };
  }

  return {
    userId: user.id,
    userEmail: user.email ?? null,
    profile: {
      ...profile,
      subscription: subscription ?? null,
    },
  };
}
