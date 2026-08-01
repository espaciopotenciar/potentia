"use client";

import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";
import type { Lesson } from "@/types/lesson";

export function useProgress(lessons: Lesson[]) {
  const [completedIds, setCompletedIds, hydrated] = useLocalStorage<string[]>(
    STORAGE_KEYS.completedLessons,
    []
  );
  const [lastLessonSlug, setLastLessonSlug] = useLocalStorage<string | null>(
    STORAGE_KEYS.lastLessonSlug,
    null
  );

  const isCompleted = useCallback(
    (lessonId: string) => completedIds.includes(lessonId),
    [completedIds]
  );

  const toggleCompleted = useCallback(
    (lessonId: string) => {
      setCompletedIds((prev) =>
        prev.includes(lessonId) ? prev.filter((id) => id !== lessonId) : [...prev, lessonId]
      );
    },
    [setCompletedIds]
  );

  const markVisited = useCallback(
    (slug: string) => {
      setLastLessonSlug(slug);
    },
    [setLastLessonSlug]
  );

  const totalProgress = useMemo(() => {
    if (lessons.length === 0) return 0;
    return Math.round((completedIds.length / lessons.length) * 100);
  }, [completedIds.length, lessons.length]);

  const moduleProgress = useCallback(
    (moduleId: string) => {
      const moduleLessons = lessons.filter((lesson) => lesson.moduleId === moduleId);
      if (moduleLessons.length === 0) return 0;
      const completed = moduleLessons.filter((lesson) => completedIds.includes(lesson.id)).length;
      return Math.round((completed / moduleLessons.length) * 100);
    },
    [lessons, completedIds]
  );

  return {
    completedIds,
    isCompleted,
    toggleCompleted,
    lastLessonSlug,
    markVisited,
    totalProgress,
    moduleProgress,
    hydrated,
  };
}
