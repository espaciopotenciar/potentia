"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Status = "checking" | "ready" | "expired" | "success";

export function ActualizarClaveForm() {
  const [status, setStatus] = useState<Status>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      setStatus(data.session ? "ready" : "expired");
    });
  }, []);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError("La contraseña tiene que tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Las dos contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError("No pudimos actualizar tu contraseña. Probá de nuevo.");
      return;
    }

    setStatus("success");
  }

  if (status === "checking") {
    return <p className="text-sm text-potentia-muted">Verificando el enlace…</p>;
  }

  if (status === "expired") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-potentia-ink">
          Este enlace venció o ya se usó. Pedí uno nuevo para poder actualizar tu
          contraseña.
        </p>
        <Link
          href="/recuperar-clave"
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-potentia-deep px-5 text-sm font-semibold text-white"
        >
          Pedir un enlace nuevo
        </Link>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-potentia-ink">Tu contraseña se actualizó correctamente.</p>
        <Link
          href="/login"
          className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-potentia-deep px-5 text-sm font-semibold text-white"
        >
          Ir a ingresar
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="password" className="mb-1.5 block text-xs font-medium text-potentia-ink">
          Contraseña nueva
        </label>
        <input
          id="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="min-h-[2.75rem] w-full rounded-xl border border-potentia-sand bg-white px-3.5 text-sm text-potentia-ink focus:border-potentia-deep"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="mb-1.5 block text-xs font-medium text-potentia-ink">
          Confirmar contraseña
        </label>
        <input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          value={confirmPassword}
          onChange={(event) => setConfirmPassword(event.target.value)}
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
        {loading ? "Guardando…" : "Guardar contraseña"}
      </button>
    </form>
  );
}
