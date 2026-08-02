import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getModules, getLessonBySlug, getLessons } from "@/lib/content/repository";
import { getCompletedLessonIds } from "@/lib/content/progress";
import { getAuthContext } from "@/lib/auth/session";
import { LessonViewer } from "@/components/learn/LessonViewer";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const lesson = await getLessonBySlug(params.slug);
  if (!lesson) return { title: "Lección no encontrada — Potentia" };
  return {
    title: `${lesson.title} — Potentia`,
    description: lesson.description,
  };
}

export default async function LessonPage({ params }: { params: { slug: string } }) {
  const [modules, lessons, completedIds, { userId }] = await Promise.all([
    getModules(),
    getLessons(),
    getCompletedLessonIds(),
    getAuthContext(),
  ]);

  const orderedLessons = modules.flatMap((module) =>
    lessons.filter((lesson) => lesson.moduleId === module.id).sort((a, b) => a.order - b.order)
  );

  const index = orderedLessons.findIndex((lesson) => lesson.slug === params.slug);
  const lesson = index === -1 ? undefined : orderedLessons[index];

  if (!lesson || !userId) {
    notFound();
  }

  const previousLesson = index > 0 ? orderedLessons[index - 1] ?? null : null;
  const nextLesson = index < orderedLessons.length - 1 ? orderedLessons[index + 1] ?? null : null;

  return (
    <LessonViewer
      lesson={lesson}
      userId={userId}
      completed={completedIds.has(lesson.id)}
      allLessons={lessons.map((item) => ({ id: item.id, slug: item.slug, title: item.title }))}
      previousLesson={previousLesson}
      nextLesson={nextLesson}
    />
  );
}
