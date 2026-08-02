"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function UpdateFullNameForm({ initialFullName }: { initialFullName: string | null }) {
  const router = useRouter();
  const [fullName, setFullName] = useState(initialFullName ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const supabase = createClient();
    // Único camino de escritura sobre profiles: la función RPC
    // update_own_full_name solo puede tocar full_name de la propia
    // sesión (ver supabase/migrations/0004_functions_triggers.sql). No
    // hay ningún UPDATE directo a la tabla desde el cliente.
    const { error: rpcError } = await supabase.rpc("update_own_full_name", {
      p_full_name: fullName,
    });

    setLoading(false);

    if (rpcError) {
      setError("No pudimos actualizar tu nombre. Probá de nuevo.");
      return;
    }

    setSuccess(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="full_name" className="block text-xs font-medium text-potentia-ink">
        Nombre completo
      </label>
      <input
        id="full_name"
        type="text"
        value={fullName}
        onChange={(event) => setFullName(event.target.value)}
        className="min-h-[2.75rem] w-full rounded-xl border border-potentia-sand bg-white px-3.5 text-sm text-potentia-ink focus:border-potentia-deep"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {success && <p className="text-sm text-potentia-deep">Nombre actualizado.</p>}
      <button
        type="submit"
        disabled={loading}
        className="inline-flex min-h-[2.75rem] items-center rounded-full bg-potentia-deep px-5 text-sm font-semibold text-white disabled:opacity-60"
      >
        {loading ? "Guardando…" : "Guardar"}
      </button>
    </form>
  );
}
