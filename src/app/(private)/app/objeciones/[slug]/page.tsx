import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getObjectionBySlug, getLessons } from "@/lib/content/repository";
import { ObjectionResult } from "@/components/objections/ObjectionResult";

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const objection = await getObjectionBySlug(params.slug);
  if (!objection) return { title: "Objeción no encontrada — Potentia" };
  return {
    title: `${objection.title} — Potentia`,
    description: objection.commonPhrase,
  };
}

export default async function ObjectionPage({ params }: { params: { slug: string } }) {
  const [objection, lessons] = await Promise.all([getObjectionBySlug(params.slug), getLessons()]);

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
