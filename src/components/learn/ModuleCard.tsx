import Link from "next/link";
import { Icon } from "@/components/icons";
import { ProgressBar } from "@/components/shared/ProgressBar";
import type { LearningModule, Lesson } from "@/types/lesson";

export function ModuleCard({
  module: learningModule,
  lessons,
  progress,
}: {
  module: LearningModule;
  lessons: Lesson[];
  /** 0-100, ya calculado server-side a partir de learning_progress. */
  progress: number;
}) {
  const firstLesson = lessons[0];

  return (
    <article className="flex flex-col rounded-2xl border border-potentia-sand bg-white p-6 shadow-card">
      <div className="flex items-start justify-between gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-potentia-deep/10 text-potentia-deep">
          <Icon name={learningModule.icon} className="h-5 w-5" />
        </span>
        <span className="text-xs font-medium text-potentia-muted">{lessons.length} lecciones</span>
      </div>
      <h2 className="mt-4 text-lg font-semibold text-potentia-ink">{learningModule.title}</h2>
      <p className="mt-2 flex-1 text-sm leading-relaxed text-potentia-muted">{learningModule.description}</p>
      <div className="mt-5">
        <ProgressBar value={progress} label="Avance del módulo" />
      </div>
      {firstLesson && (
        <Link
          href={`/app/aprender/${firstLesson.slug}`}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-potentia-deep hover:underline"
        >
          Empezar módulo
          <Icon name="arrow-right" className="h-4 w-4" />
        </Link>
      )}
    </article>
  );
}
