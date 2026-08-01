"use client";

import { Icon } from "@/components/icons";
import { useProgress } from "@/hooks/useProgress";
import type { Lesson } from "@/types/lesson";

export function CompletionButton({ lesson, allLessons }: { lesson: Lesson; allLessons: Lesson[] }) {
  const { isCompleted, toggleCompleted, hydrated } = useProgress(allLessons);
  const completed = hydrated && isCompleted(lesson.id);

  return (
    <button
      type="button"
      onClick={() => toggleCompleted(lesson.id)}
      aria-pressed={completed}
      className={`inline-flex min-h-[2.75rem] items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors ${
        completed
          ? "bg-potentia-lime text-potentia-deep hover:bg-potentia-limeDark"
          : "bg-potentia-deep text-white hover:bg-potentia-deepDark"
      }`}
    >
      <Icon name={completed ? "check" : "arrow-right"} className="h-4 w-4" />
      {completed ? "Lección completada" : "Marcar como completada"}
    </button>
  );
}
