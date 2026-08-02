"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { NO_PLAN_VALUE, PLAN_CODE_OPTIONS, isPlanCode } from "@/lib/subscriptions/planCodes";

export interface AdminUserRow {
  id: string;
  email: string;
  fullName: string | null;
  role: "user" | "admin";
  status: string | null;
  planCode: string | null;
  startsAt: string | null;
  accessUntil: string | null;
}

const STATUS_OPTIONS = ["trial", "active", "past_due", "suspended", "cancelled"] as const;

export function AdminUsersTable({ users, currentUserId }: { users: AdminUserRow[]; currentUserId: string }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-potentia-sand bg-white shadow-card">
      <table className="w-full min-w-[880px] text-left text-sm">
        <thead className="border-b border-potentia-sand bg-potentia-sand/40 text-xs uppercase tracking-wide text-potentia-muted">
          <tr>
            <th className="px-4 py-3 font-semibold">Usuario</th>
            <th className="px-4 py-3 font-semibold">Rol</th>
            <th className="px-4 py-3 font-semibold">Estado</th>
            <th className="px-4 py-3 font-semibold">Plan</th>
            <th className="px-4 py-3 font-semibold">Inicio</th>
            <th className="px-4 py-3 font-semibold">Vence</th>
            <th className="px-4 py-3 font-semibold">Acción</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <AdminUserRowItem key={user.id} user={user} isSelf={user.id === currentUserId} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AdminUserRowItem({ user, isSelf }: { user: AdminUserRow; isSelf: boolean }) {
  const router = useRouter();
  const [status, setStatus] = useState(user.status ?? "suspended");
  const [accessUntil, setAccessUntil] = useState(user.accessUntil ? user.accessUntil.slice(0, 10) : "");
  const [planCode, setPlanCode] = useState(
    user.planCode && isPlanCode(user.planCode) ? user.planCode : NO_PLAN_VALUE
  );
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSave() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      const supabase = createClient();
      // Única forma de escribir subscriptions ajenas: la función RPC
      // admin_set_subscription_status (SECURITY DEFINER), que valida
      // is_current_user_admin() y registra el cambio en admin_audit_log
      // en la misma transacción. No hay ningún UPDATE directo a la tabla
      // desde acá — profiles/subscriptions no tienen ninguna política de
      // escritura para 'authenticated', ni siquiera admin.
      const { error: rpcError } = await supabase.rpc("admin_set_subscription_status", {
        p_target_user_id: user.id,
        p_new_status: status,
        p_access_until: accessUntil ? new Date(`${accessUntil}T00:00:00Z`).toISOString() : null,
        p_plan_code: planCode === NO_PLAN_VALUE ? null : planCode,
      });

      if (rpcError) {
        setError(rpcError.message || "No se pudo guardar. Probá de nuevo.");
        return;
      }

      setSaved(true);
      router.refresh();
    });
  }

  return (
    <tr className="border-b border-potentia-sand/60 align-top last:border-0">
      <td className="px-4 py-3">
        <p className="font-medium text-potentia-ink">{user.fullName || "(sin nombre)"}</p>
        <p className="text-xs text-potentia-muted">{user.email}</p>
      </td>
      <td className="px-4 py-3 text-potentia-ink">{user.role}</td>
      <td className="px-4 py-3">
        <select
          value={status}
          disabled={isSelf}
          onChange={(event) => setStatus(event.target.value)}
          className="rounded-lg border border-potentia-sand px-2 py-1.5 text-sm disabled:opacity-50"
        >
          {STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3">
        <select
          value={planCode}
          disabled={isSelf}
          onChange={(event) => setPlanCode(event.target.value)}
          className="rounded-lg border border-potentia-sand px-2 py-1.5 text-sm disabled:opacity-50"
        >
          {PLAN_CODE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </td>
      <td className="px-4 py-3 text-xs text-potentia-muted">
        {user.startsAt ? new Date(user.startsAt).toLocaleDateString("es-AR") : "—"}
      </td>
      <td className="px-4 py-3">
        <input
          type="date"
          value={accessUntil}
          disabled={isSelf}
          onChange={(event) => setAccessUntil(event.target.value)}
          className="rounded-lg border border-potentia-sand px-2 py-1.5 text-sm disabled:opacity-50"
        />
      </td>
      <td className="px-4 py-3">
        {isSelf ? (
          <span className="text-xs text-potentia-muted">Tu propia cuenta — gestión manual</span>
        ) : (
          <div>
            <button
              type="button"
              onClick={handleSave}
              disabled={isPending}
              className="rounded-full bg-potentia-deep px-4 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
            >
              {isPending ? "Guardando…" : "Guardar"}
            </button>
            {error && <p className="mt-1 max-w-[10rem] text-xs text-red-600">{error}</p>}
            {saved && !isPending && <p className="mt-1 text-xs text-potentia-deep">Guardado.</p>}
          </div>
        )}
      </td>
    </tr>
  );
}
