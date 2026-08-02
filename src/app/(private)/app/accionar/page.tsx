import type { Metadata } from "next";
import { getActionMatrix, getLessons } from "@/lib/content/repository";
import { ActionWizard } from "@/components/action/ActionWizard";

export const metadata: Metadata = {
  title: "Accionar — Potentia",
  description: "Respondé algunas preguntas breves y Potentia te ayuda a identificar tu próxima acción comercial.",
};

export default async function AccionarPage() {
  const [matrix, lessons] = await Promise.all([getActionMatrix(), getLessons()]);
  const lessonSummaries = lessons.map((lesson) => ({ id: lesson.id, slug: lesson.slug, title: lesson.title }));

  return (
    <div>
      <div className="container-app pt-10 text-center md:pt-14">
        <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">Accionar</p>
        <h1 className="mx-auto mt-2 max-w-xl text-2xl font-semibold text-potentia-ink md:text-3xl">
          ¿Qué podés hacer con esta oportunidad?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm text-potentia-muted md:text-base">
          Respondé algunas preguntas breves y Potentia te ayudará a identificar tu próxima acción.
        </p>
      </div>
      <ActionWizard matrix={matrix} lessons={lessonSummaries} />
    </div>
  );
}
