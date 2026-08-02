"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Cliente Supabase para componentes de cliente (navegador). Usa la
 * publishable key — segura para el navegador, nunca la secret key.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  );
}
