import type { Metadata } from "next";
import Link from "next/link";
import { getAuthContext } from "@/lib/auth/session";
import { PotentiaLogo } from "@/components/layout/PotentiaLogo";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata: Metadata = {
  title: "Membresía inactiva — Potentia",
};

const STATUS_LABELS: Record<string, string> = {
  trial: "en prueba",
  active: "activa",
  past_due: "con un pago pendiente",
  suspended: "suspendida",
  cancelled: "cancelada",
};

export default async function MembresiaInactivaPage() {
  const { userId, profile } = await getAuthContext();
  const subscription = profile?.subscription ?? null;

  return (
    <div className="container-app flex min-h-[70vh] max-w-md flex-col justify-center py-10 text-center">
      <div className="mb-8">
        <PotentiaLogo />
      </div>
      <div className="rounded-2xl border border-potentia-sand bg-white p-6 shadow-card">
        <h1 className="mb-2 text-xl font-semibold text-potentia-ink">Tu membresía no está activa</h1>

        {subscription ? (
          <p className="text-sm text-potentia-muted">
            Tu cuenta está {STATUS_LABELS[subscription.status] ?? subscription.status}.
            {subscription.access_until && subscription.status === "cancelled"
              ? ` Tenías acceso hasta el ${new Date(subscription.access_until).toLocaleDateString("es-AR")}.`
              : ""}{" "}
            Escribinos para reactivarla.
          </p>
        ) : userId ? (
          <p className="text-sm text-potentia-muted">
            Todavía no tenés una membresía asignada. Escribinos para activar tu
            acceso.
          </p>
        ) : (
          <p className="text-sm text-potentia-muted">
            Iniciá sesión para ver el estado de tu cuenta.
          </p>
        )}

        <div className="mt-6 flex flex-col items-center gap-3">
          {userId ? (
            <SignOutButton />
          ) : (
            <Link
              href="/login"
              className="inline-flex min-h-[2.75rem] items-center justify-center rounded-full bg-potentia-deep px-5 text-sm font-semibold text-white"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
