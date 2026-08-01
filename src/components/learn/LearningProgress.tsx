"use client";

import { ProgressBar } from "@/components/shared/ProgressBar";
import { LocalStorageNotice } from "@/components/shared/LocalStorageNotice";
import { useProgress } from "@/hooks/useProgress";
import type { Lesson } from "@/types/lesson";

export function LearningProgress({ lessons }: { lessons: Lesson[] }) {
  const { totalProgress, completedIds, hydrated } = useProgress(lessons);

  return (
    <div className="rounded-2xl border border-potentia-sand bg-white p-6 shadow-card">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-base font-semibold text-potentia-ink">Tu avance general</h2>
          <p className="mt-1 text-sm text-potentia-muted">
            {hydrated ? completedIds.length : 0} de {lessons.length} lecciones completadas
          </p>
        </div>
        <div className="w-full md:w-64">
          <ProgressBar value={hydrated ? totalProgress : 0} />
        </div>
      </div>
      <div className="mt-4">
        <LocalStorageNotice />
      </div>
    </div>
  );
}
