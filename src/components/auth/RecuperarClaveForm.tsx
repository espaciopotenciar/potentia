"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function RecuperarClaveForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);

    const supabase = createClient();
    // No se revisa ni se muestra el resultado de error/éxito por
    // separado: Supabase ya devuelve una respuesta genérica para no
    // filtrar si el email existe, y acá se repite el mismo criterio
    // mostrando siempre el mismo mensaje neutro.
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/actualizar-clave`,
    });

    setLoading(false);
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <p className="text-sm text-potentia-ink">
        Si ese email está registrado en Potentia, vas a recibir un enlace para
        restablecer tu contraseña en los próximos minutos. Revisá también la
        carpeta de spam.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-[2.75rem] w-full items-center justify-center rounded-full bg-potentia-deep px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Enviando…" : "Enviar enlace"}
      </button>
    </form>
  );
}
