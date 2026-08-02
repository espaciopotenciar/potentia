import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getObjectionBySlug, getLessons } from "@/lib/content/repository";
import { ObjectionResult } from "@/components/objections/ObjectionResult";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const objection = await getObjectionBySlug(slug);
  if (!objection) return { title: "Objeción no encontrada — Potentia" };
  return {
    title: `${objection.title} — Potentia`,
    description: objection.commonPhrase,
  };
}

export default async function ObjectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [objection, lessons] = await Promise.all([getObjectionBySlug(slug), getLessons()]);

  if (!objection) {
    notFound();
  }

  return (
    <ObjectionResult
      objection={objection}
      allLessons={lessons.map((lesson) => ({ id: lesson.id, slug: lesson.slug, title: lesson.title }))}
    />
  );
}
