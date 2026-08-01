"use client";

import Link from "next/link";
import { Icon } from "@/components/icons";
import { useProgress } from "@/hooks/useProgress";
import type { Lesson } from "@/types/lesson";

export function ContinueLearningBanner({ lessons }: { lessons: Lesson[] }) {
  const { lastLessonSlug, hydrated } = useProgress(lessons);

  if (!hydrated || !lastLessonSlug) return null;

  const lesson = lessons.find((item) => item.slug === lastLessonSlug);
  if (!lesson) return null;

  return (
    <Link
      href={`/aprender/${lesson.slug}`}
      className="mb-8 flex items-center justify-between gap-4 rounded-2xl bg-potentia-deep p-5 text-white shadow-soft transition-transform hover:-translate-y-0.5"
    >
      <span>
        <span className="block text-xs uppercase tracking-wide text-potentia-lime">Continuar donde quedaste</span>
        <span className="mt-1 block text-sm font-semibold md:text-base">{lesson.title}</span>
      </span>
      <Icon name="arrow-right" className="h-5 w-5 shrink-0" />
    </Link>
  );
}
