import Link from "next/link";
import { getDataProvider } from "@/lib/dataProvider";
import { Icon } from "@/components/icons";

export function RelatedContent({ lessonIds, title = "Contenidos relacionados" }: { lessonIds: string[]; title?: string }) {
  if (lessonIds.length === 0) return null;

  const lessons = getDataProvider()
    .getLessons()
    .filter((lesson) => lessonIds.includes(lesson.id));

  if (lessons.length === 0) return null;

  return (
    <section aria-label={title} className="rounded-2xl border border-potentia-sand bg-white p-5 shadow-card">
      <h3 className="mb-3 text-sm font-semibold text-potentia-ink">{title}</h3>
      <ul className="space-y-2">
        {lessons.map((lesson) => (
          <li key={lesson.id}>
            <Link
              href={`/aprender/${lesson.slug}`}
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
