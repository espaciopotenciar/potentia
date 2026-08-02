import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAuthContext } from "@/lib/auth/session";
import { Icon, type IconName } from "@/components/icons";

export const metadata: Metadata = {
  title: "Inicio — Potentia",
};

const STATUS_LABELS: Record<string, string> = {
  trial: "Prueba",
  active: "Activa",
  past_due: "Pago pendiente",
  suspended: "Suspendida",
  cancelled: "Cancelada",
};

const SECTIONS: { href: string; title: string; description: string; icon: IconName }[] = [
  {
    href: "/app/aprender",
    title: "Aprender",
    description: "Los 5 módulos y toda la teoría del Sistema 4x4.",
    icon: "book",
  },
  {
    href: "/app/accionar",
    title: "Accionar",
    description: "Respondé unas preguntas y encontrá tu próxima acción.",
    icon: "zap",
  },
  {
    href: "/app/objeciones",
    title: "Objeciones",
    description: "Qué responder cuando el potencial cliente pone un freno.",
    icon: "message-circle-question",
  },
  {
    href: "/app/buscar",
    title: "Buscar",
    description: "Encontrá rápido cualquier contenido de Potentia.",
    icon: "search",
  },
];

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
    <div className="container-app max-w-3xl py-10">
      <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">Potentia</p>
      <h1 className="mt-2 text-2xl font-semibold text-potentia-ink md:text-3xl">
        Hola, {profile.full_name || profile.email}
      </h1>
      <p className="mt-2 text-sm text-potentia-muted">
        Elegí por dónde seguir.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className="group flex items-start gap-4 rounded-2xl border border-potentia-sand bg-white p-5 shadow-card transition-colors hover:border-potentia-deep/30"
          >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-potentia-deep/10 text-potentia-deep">
              <Icon name={section.icon} className="h-5 w-5" />
            </span>
            <span>
              <span className="block text-sm font-semibold text-potentia-ink">{section.title}</span>
              <span className="mt-1 block text-sm text-potentia-muted">{section.description}</span>
            </span>
          </Link>
        ))}
      </div>

      <dl className="mt-10 grid gap-4 rounded-2xl border border-potentia-sand bg-white p-6 sm:grid-cols-2">
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

      <div className="mt-6">
        <Link
          href="/mi-cuenta"
          className="inline-flex min-h-[2.75rem] items-center rounded-full border border-potentia-sand px-5 text-sm font-medium text-potentia-ink hover:bg-potentia-sand/60"
        >
          Editar mi nombre
        </Link>
      </div>
    </div>
  );
}
