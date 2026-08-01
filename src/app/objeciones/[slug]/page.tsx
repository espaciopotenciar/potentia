import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDataProvider } from "@/lib/dataProvider";
import { ObjectionResult } from "@/components/objections/ObjectionResult";

export function generateStaticParams() {
  return getDataProvider()
    .getObjections()
    .map((objection) => ({ slug: objection.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const objection = getDataProvider().getObjectionBySlug(params.slug);
  if (!objection) return { title: "Objeción no encontrada — Potentia" };
  return {
    title: `${objection.title} — Potentia`,
    description: objection.commonPhrase,
  };
}

export default function ObjectionPage({ params }: { params: { slug: string } }) {
  const objection = getDataProvider().getObjectionBySlug(params.slug);

  if (!objection) {
    notFound();
  }

  return <ObjectionResult objection={objection} />;
}
