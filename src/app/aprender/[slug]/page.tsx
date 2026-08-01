import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDataProvider } from "@/lib/dataProvider";
import { LessonViewer } from "@/components/learn/LessonViewer";

function getOrderedLessons() {
  const provider = getDataProvider();
  const modules = provider.getModules();
  const lessons = provider.getLessons();

  return modules.flatMap((module) =>
    lessons
      .filter((lesson) => lesson.moduleId === module.id)
      .sort((a, b) => a.order - b.order)
  );
}

export function generateStaticParams() {
  return getDataProvider()
    .getLessons()
    .map((lesson) => ({ slug: lesson.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const lesson = getDataProvider().getLessonBySlug(params.slug);
  if (!lesson) return { title: "Lección no encontrada — Potentia" };
  return {
    title: `${lesson.title} — Potentia`,
    description: lesson.description,
  };
}

export default function LessonPage({ params }: { params: { slug: string } }) {
  const orderedLessons = getOrderedLessons();
  const index = orderedLessons.findIndex((lesson) => lesson.slug === params.slug);
  const lesson = index === -1 ? undefined : orderedLessons[index];

  if (!lesson) {
    notFound();
  }

  const previousLesson = index > 0 ? orderedLessons[index - 1] ?? null : null;
  const nextLesson = index < orderedLessons.length - 1 ? orderedLessons[index + 1] ?? null : null;

  return (
    <LessonViewer
      lesson={lesson}
      allLessons={orderedLessons}
      previousLesson={previousLesson}
      nextLesson={nextLesson}
    />
  );
}
