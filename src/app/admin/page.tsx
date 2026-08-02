import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getAuthContext } from "@/lib/auth/session";
import { AdminUsersTable, type AdminUserRow } from "@/components/admin/AdminUsersTable";

export const metadata: Metadata = {
  title: "Administración — Potentia",
};

interface ProfileRow {
  id: string;
  email: string;
  full_name: string | null;
  role: "user" | "admin";
}

interface SubscriptionRow {
  user_id: string;
  status: string;
  plan_code: string | null;
  starts_at: string | null;
  access_until: string | null;
}

export default async function AdminPage() {
  const { userId } = await getAuthContext();
  const supabase = createClient();

  // Lectura directa: las políticas RLS "profiles_select_own_or_admin" y
  // "subscriptions_select_own_or_admin" (0005_rls_policies.sql) ya le
  // permiten a una sesión admin leer TODAS las filas, no solo la propia.
  // No hace falta ninguna función ni la service role para esto.
  const [{ data: profiles }, { data: subscriptions }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, role").order("email"),
    supabase.from("subscriptions").select("user_id, status, plan_code, starts_at, access_until"),
  ]);

  const subscriptionByUserId = new Map(
    ((subscriptions ?? []) as SubscriptionRow[]).map((row) => [row.user_id, row])
  );

  const users: AdminUserRow[] = ((profiles ?? []) as ProfileRow[]).map((profile) => {
    const subscription = subscriptionByUserId.get(profile.id);
    return {
      id: profile.id,
      email: profile.email,
      fullName: profile.full_name,
      role: profile.role,
      status: subscription?.status ?? null,
      planCode: subscription?.plan_code ?? null,
      startsAt: subscription?.starts_at ?? null,
      accessUntil: subscription?.access_until ?? null,
    };
  });

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">Administración</p>
      <h1 className="mt-2 text-2xl font-semibold text-potentia-ink md:text-3xl">Usuarios</h1>
      <p className="mt-2 max-w-2xl text-sm text-potentia-muted">
        Activar, suspender o definir un vencimiento actualiza directamente la membresía. Cada
        cambio queda registrado en el historial de auditoría (admin_audit_log).
      </p>

      <div className="mt-8">
        <AdminUsersTable users={users} currentUserId={userId ?? ""} />
      </div>
    </div>
  );
}
