import Link from "next/link";
import { Icon } from "@/components/icons";

const benefits = [
  {
    icon: "compass" as const,
    title: "Entendé qué está pasando",
    description: "Ubicá en qué momento está tu oportunidad y qué significa realmente esa etapa.",
  },
  {
    icon: "zap" as const,
    title: "Elegí tu próxima acción",
    description: "Recibí una recomendación concreta según tu situación, no un consejo genérico.",
  },
  {
    icon: "message-circle-question" as const,
    title: "Comunicá con claridad",
    description: "Accedé a plantillas y ejemplos que facilitan una decisión, sin presionar.",
  },
];

export default function HomePage() {
  return (
    <div className="container-app">
      <section className="grid gap-10 py-12 md:grid-cols-2 md:items-center md:py-20">
        <div>
          <p className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-potentia-lavender/50 px-3 py-1 text-xs font-medium text-potentia-deep">
            <Icon name="sparkles" className="h-3.5 w-3.5" />
            Potentia · by Espacio Potenciar
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight text-potentia-ink md:text-5xl">
            Liderá tus oportunidades comerciales
          </h1>
          <p className="mt-5 text-base leading-relaxed text-potentia-muted md:text-lg">
            No esperes que el potencial cliente haga avanzar la conversación. Aprendé qué acción
            realizar, qué seguimiento corresponde y cómo comunicarte para facilitar una decisión.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/accionar"
              className="inline-flex min-h-[3rem] items-center gap-2 rounded-full bg-potentia-deep px-6 text-sm font-semibold text-white shadow-soft transition-transform hover:-translate-y-0.5"
            >
              <Icon name="zap" className="h-4 w-4" />
              Quiero accionar
            </Link>
            <Link
              href="/aprender"
              className="inline-flex min-h-[3rem] items-center gap-2 rounded-full border border-potentia-deep px-6 text-sm font-semibold text-potentia-deep transition-colors hover:bg-white"
            >
              <Icon name="book" className="h-4 w-4" />
              Quiero aprender
            </Link>
          </div>
        </div>
        <div className="relative rounded-3xl bg-potentia-deep p-8 text-potentia-cream shadow-soft md:p-10">
          <p className="text-sm uppercase tracking-wide text-potentia-lime">Filosofía Potentia</p>
          <p className="mt-4 text-xl font-medium leading-relaxed md:text-2xl">
            &ldquo;Acompañar decisiones. Cerrar con criterio. Nutrir sin perseguir.&rdquo;
          </p>
          <div className="mt-8 h-px bg-white/10" />
          <p className="mt-6 text-sm leading-relaxed text-potentia-cream/80">
            Hacer seguimiento no es insistir: es acompañar. Cada contacto debería aportar
            claridad o facilitar un próximo paso.
          </p>
        </div>
      </section>

      <section className="grid gap-5 py-8 md:grid-cols-3">
        {benefits.map((benefit) => (
          <div
            key={benefit.title}
            className="rounded-2xl border border-potentia-sand bg-white p-6 shadow-card"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-potentia-lime/30 text-potentia-deep">
              <Icon name={benefit.icon} className="h-5 w-5" />
            </span>
            <h2 className="text-base font-semibold text-potentia-ink">{benefit.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-potentia-muted">{benefit.description}</p>
          </div>
        ))}
      </section>

      <section className="py-8">
        <div className="rounded-2xl bg-potentia-sand p-6 md:p-8">
          <p className="text-sm leading-relaxed text-potentia-ink md:text-base">
            <strong className="font-semibold">Potentia no consigue oportunidades nuevas ni reemplaza un CRM.</strong>{" "}
            Te ayuda a trabajar mejor las oportunidades que ya tenés.
          </p>
        </div>
      </section>

      <section className="pb-16 pt-4">
        <div className="rounded-3xl border border-potentia-lavender bg-potentia-lavender/20 p-8 text-center md:p-12">
          <p className="text-lg font-medium leading-relaxed text-potentia-ink md:text-2xl">
            &ldquo;Acompañar decisiones. Cerrar con criterio. Nutrir sin perseguir.&rdquo;
          </p>
        </div>
      </section>
    </div>
  );
}
