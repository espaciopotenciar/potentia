"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { CompletionButton } from "@/components/learn/CompletionButton";
import { RelatedContent, type RelatedLessonSummary } from "@/components/shared/RelatedContent";
import { useLastVisitedLesson } from "@/hooks/useLastVisitedLesson";
import type { Lesson } from "@/types/lesson";

export function LessonViewer({
  lesson,
  userId,
  completed,
  allLessons,
  previousLesson,
  nextLesson,
}: {
  lesson: Lesson;
  userId: string;
  completed: boolean;
  allLessons: RelatedLessonSummary[];
  previousLesson: Lesson | null;
  nextLesson: Lesson | null;
}) {
  const { setLastLessonSlug } = useLastVisitedLesson();

  useEffect(() => {
    setLastLessonSlug(lesson.slug);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson.slug]);

  return (
    <article className="container-app max-w-3xl py-10">
      <Link href="/app/aprender" className="inline-flex items-center gap-1.5 text-sm font-medium text-potentia-muted hover:text-potentia-deep">
        <Icon name="chevron-left" className="h-4 w-4" />
        Volver a Aprender
      </Link>

      <header className="mt-4 mb-8">
        <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-potentia-deep">
          <Icon name="clock" className="h-3.5 w-3.5" />
          {lesson.estimatedMinutes} min de lectura
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-potentia-ink md:text-3xl">{lesson.title}</h1>
        <p className="mt-3 text-base text-potentia-muted">{lesson.description}</p>
      </header>

      <div className="space-y-4 text-[15px] leading-relaxed text-potentia-ink md:text-base">
        {lesson.content.map((paragraph, index) => (
          <p key={index}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-8">
        <CompletionButton userId={userId} lessonId={lesson.id} initialCompleted={completed} />
      </div>

      <div className="mt-10">
        <RelatedContent lessonIds={lesson.relatedLessonIds} allLessons={allLessons} />
      </div>

      <nav className="mt-10 grid gap-3 border-t border-potentia-sand pt-6 sm:grid-cols-2" aria-label="Navegación entre lecciones">
        {previousLesson ? (
          <Link
            href={`/app/aprender/${previousLesson.slug}`}
            className="flex items-center gap-2 rounded-xl border border-potentia-sand px-4 py-3 text-sm hover:bg-potentia-sand/50"
          >
            <Icon name="chevron-left" className="h-4 w-4 shrink-0 text-potentia-muted" />
            <span>
              <span className="block text-xs text-potentia-muted">Anterior</span>
              <span className="font-medium text-potentia-ink">{previousLesson.title}</span>
            </span>
          </Link>
        ) : (
          <span />
        )}
        {nextLesson && (
          <Link
            href={`/app/aprender/${nextLesson.slug}`}
            className="flex items-center justify-end gap-2 rounded-xl border border-potentia-sand px-4 py-3 text-right text-sm hover:bg-potentia-sand/50 sm:col-start-2"
          >
            <span>
              <span className="block text-xs text-potentia-muted">Siguiente</span>
              <span className="font-medium text-potentia-ink">{nextLesson.title}</span>
            </span>
            <Icon name="chevron-right" className="h-4 w-4 shrink-0 text-potentia-muted" />
          </Link>
        )}
      </nav>
    </article>
  );
}
