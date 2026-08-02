"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/icons";
import { setLessonCompleted } from "@/lib/content/progressClient";

export function CompletionButton({
  userId,
  lessonId,
  initialCompleted,
}: {
  userId: string;
  lessonId: string;
  initialCompleted: boolean;
}) {
  const router = useRouter();
  const [completed, setCompleted] = useState(initialCompleted);
  const [isPending, startTransition] = useTransition();

  function handleToggle() {
    const next = !completed;
    setCompleted(next); // optimista
    startTransition(async () => {
      try {
        await setLessonCompleted(userId, lessonId, next);
        router.refresh(); // resincroniza avance de módulo/general server-side
      } catch {
        setCompleted(!next); // revertir si falló
      }
    });
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      aria-pressed={completed}
      className={`inline-flex min-h-[2.75rem] items-center gap-2 rounded-full px-5 text-sm font-semibold transition-colors disabled:opacity-70 ${
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
