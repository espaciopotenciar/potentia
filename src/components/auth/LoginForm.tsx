"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { sanitizeInternalRedirect } from "@/lib/auth/redirects";

const LINK_ERROR_MESSAGES: Record<string, string> = {
  auth_callback_failed:
    "No pudimos validar ese enlace. Iniciá sesión con tu contraseña o pedí uno nuevo.",
  invite_link_invalid:
    "Ese enlace de invitación venció o ya fue usado. Pedile a tu administradora que te envíe uno nuevo.",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const linkErrorCode = searchParams.get("error");
  const linkError = linkErrorCode ? LINK_ERROR_MESSAGES[linkErrorCode] ?? null : null;

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });

    if (signInError) {
      setLoading(false);
      // Mensaje genérico a propósito: no distingue "email inexistente" de
      // "contraseña incorrecta", para no revelar qué correos están
      // registrados.
      setError("No pudimos iniciar sesión. Revisá el email y la contraseña.");
      return;
    }

    const redirectTo = sanitizeInternalRedirect(searchParams.get("redirectTo"));
    router.push(redirectTo);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {linkError && (
        <p role="alert" className="rounded-xl bg-potentia-sand px-3.5 py-2.5 text-sm text-potentia-ink">
          {linkError}
        </p>
      )}
      <div>
        <label htmlFor="email" className="mb-1.5 block text-xs font-medium text-potentia-ink">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="min-h-[2.75rem] w-full rounded-xl border border-potentia-sand bg-white px-3.5 text-sm text-potentia-ink focus:border-potentia-deep"
        />
      </div>
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-potentia-ink">
          Contraseña
        </label>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-[2.75rem] w-full rounded-xl border border-potentia-sand bg-white px-3.5 text-sm text-potentia-ink focus:border-potentia-deep"
        />
      </div>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full bg-potentia-deep px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Ingresando…" : "Ingresar"}
      </button>

      <p className="text-center text-sm">
        <Link href="/recuperar-clave" className="font-medium text-potentia-deep hover:underline">
          ¿Olvidaste tu contraseña?
        </Link>
      </p>
    </form>
  );
}
