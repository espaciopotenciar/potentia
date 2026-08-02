import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { SignOutButton } from "@/components/auth/SignOutButton";

export const metadata: Metadata = {
  title: "Mi cuenta — Potentia",
};

const STATUS_LABELS: Record<string, string> = {
  trial: "Prueba",
  active: "Activa",
  past_due: "Pago pendiente",
  suspended: "Suspendida",
  cancelled: "Cancelada",
};

export default async function PrivateAppHomePage() {
  // El layout (private) ya validó sesión + membresía; se vuelve a pedir
  // el contexto acá porque cada Server Component hace su propia consulta
  // (no hay paso de datos implícito entre layout y page en Next.js). Si
  // por algún motivo llegara sin perfil, es una segunda barrera de
  // seguridad, no la única.
  const { profile } = await getAuthContext();

  if (!profile) {
    redirect("/membresia-inactiva");
  }

  const subscription = profile.subscription;

  return (
    <div className="container-app max-w-2xl py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">
        Página temporal — Etapa 2
      </p>
      <h1 className="mt-2 text-2xl font-semibold text-potentia-ink">
        Hola, {profile.full_name || profile.email}
      </h1>
      <p className="mt-2 text-sm text-potentia-muted">
        Esta pantalla es provisoria: confirma que la sesión y la validación de
        membresía funcionan de punta a punta. El contenido real de Aprender,
        Accionar, Objeciones y Buscar todavía no se migró acá.
      </p>

      <dl className="mt-8 grid gap-4 rounded-2xl border border-potentia-sand bg-white p-6 sm:grid-cols-2">
        <div>
          <dt className="text-xs font-medium text-potentia-muted">Nombre</dt>
          <dd className="mt-1 text-sm text-potentia-ink">{profile.full_name || "(sin definir)"}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-potentia-muted">Email</dt>
          <dd className="mt-1 text-sm text-potentia-ink">{profile.email}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-potentia-muted">Rol</dt>
          <dd className="mt-1 text-sm text-potentia-ink">{profile.role}</dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-potentia-muted">Estado de membresía</dt>
          <dd className="mt-1 text-sm text-potentia-ink">
            {subscription ? STATUS_LABELS[subscription.status] ?? subscription.status : "Sin membresía"}
          </dd>
        </div>
        <div>
          <dt className="text-xs font-medium text-potentia-muted">Válida hasta</dt>
          <dd className="mt-1 text-sm text-potentia-ink">
            {subscription?.access_until
              ? new Date(subscription.access_until).toLocaleDateString("es-AR")
              : "Sin fecha de vencimiento"}
          </dd>
        </div>
      </dl>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link
          href="/mi-cuenta"
          className="inline-flex min-h-[2.75rem] items-center rounded-full border border-potentia-sand px-5 text-sm font-medium text-potentia-ink hover:bg-potentia-sand/60"
        >
          Editar mi nombre
        </Link>
        <SignOutButton />
      </div>
    </div>
  );
}
