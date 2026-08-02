import Link from "next/link";
import { Icon } from "@/components/icons";
import type { Lesson } from "@/types/lesson";

export function LessonCard({
  lesson,
  completed,
  index,
}: {
  lesson: Lesson;
  /** Ya calculado server-side contra learning_progress. */
  completed: boolean;
  index: number;
}) {
  return (
    <Link
      href={`/app/aprender/${lesson.slug}`}
      className="group flex items-start gap-4 rounded-2xl border border-potentia-sand bg-white p-4 transition-colors hover:border-potentia-deep/30 hover:bg-potentia-sand/40"
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
          completed ? "bg-potentia-lime text-potentia-deep" : "bg-potentia-sand text-potentia-muted"
        }`}
        aria-hidden="true"
      >
        {completed ? <Icon name="check" className="h-4 w-4" /> : index}
      </span>
      <span className="flex-1">
        <span className="block text-sm font-semibold text-potentia-ink">{lesson.title}</span>
        <span className="mt-1 block text-sm text-potentia-muted">{lesson.description}</span>
        <span className="mt-2 flex items-center gap-1.5 text-xs text-potentia-muted">
          <Icon name="clock" className="h-3.5 w-3.5" />
          {lesson.estimatedMinutes} min
        </span>
      </span>
      <Icon
        name="chevron-right"
        className="mt-1 h-4 w-4 shrink-0 text-potentia-muted transition-transform group-hover:translate-x-0.5"
      />
    </Link>
  );
}
