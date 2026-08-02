import Link from "next/link";
import { Icon } from "@/components/icons";

export interface RelatedLessonSummary {
  id: string;
  slug: string;
  title: string;
}

/**
 * Recibe la lista completa de lecciones (id/slug/title) ya cargada por la
 * página — no vuelve a consultar nada. Antes de la Etapa 3 esto llamaba a
 * getDataProvider().getLessons() directamente; ahora ese fetch lo hace la
 * página server-side contra Supabase, y este componente solo filtra y
 * muestra.
 */
export function RelatedContent({
  lessonIds,
  allLessons,
  title = "Contenidos relacionados",
}: {
  lessonIds: string[];
  allLessons: RelatedLessonSummary[];
  title?: string;
}) {
  if (lessonIds.length === 0) return null;

  const lessons = allLessons.filter((lesson) => lessonIds.includes(lesson.id));

  if (lessons.length === 0) return null;

  return (
    <section aria-label={title} className="rounded-2xl border border-potentia-sand bg-white p-5 shadow-card">
      <h3 className="mb-3 text-sm font-semibold text-potentia-ink">{title}</h3>
      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/app/aprender/${lesson.slug}`}
              className="flex items-center justify-between gap-2 rounded-xl px-3 py-2.5 text-sm text-potentia-ink transition-colors hover:bg-potentia-sand"
            >
              <span>{lesson.title}</span>
              <Icon name="arrow-right" className="h-4 w-4 shrink-0 text-potentia-muted" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
