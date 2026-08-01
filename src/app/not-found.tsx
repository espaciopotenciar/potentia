import Link from "next/link";
import { Icon } from "@/components/icons";

export default function NotFound() {
  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <span className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-potentia-sand text-potentia-deep">
        <Icon name="compass" className="h-7 w-7" />
      </span>
      <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">Error 404</p>
      <h1 className="mt-2 text-2xl font-semibold text-potentia-ink md:text-3xl">No encontramos esta página</h1>
      <p className="mt-3 max-w-sm text-sm text-potentia-muted">
        El contenido que buscás pudo haberse movido o ya no está disponible. Volvamos a un lugar conocido.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/"
          className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full bg-potentia-deep px-5 text-sm font-semibold text-white"
        >
          Ir a Inicio
        </Link>
        <Link
          href="/buscar"
          className="inline-flex min-h-[2.75rem] items-center gap-2 rounded-full border border-potentia-deep px-5 text-sm font-semibold text-potentia-deep"
        >
          Buscar contenido
        </Link>
      </div>
    </div>
  );
}
