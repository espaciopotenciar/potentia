import type { Metadata } from "next";
import { getDataProvider } from "@/lib/dataProvider";
import { LearningProgress } from "@/components/learn/LearningProgress";
import { ContinueLearningBanner } from "@/components/learn/ContinueLearningBanner";
import { ModuleCard } from "@/components/learn/ModuleCard";
import { LessonCard } from "@/components/learn/LessonCard";

export const metadata: Metadata = {
  title: "Aprender — Potentia",
  description: "Módulos y lecciones libres sobre mentalidad comercial, proceso, organización y el Sistema 4x4.",
};

export default function AprenderPage() {
  const provider = getDataProvider();
  const modules = provider.getModules();
  const lessons = provider.getLessons();

  return (
    <div className="container-app py-10">
      <header className="mb-8">
        <p className="text-xs font-semibold uppercase tracking-wide text-potentia-deep">Aprender</p>
        <h1 className="mt-2 text-2xl font-semibold text-potentia-ink md:text-3xl">
          Contenidos de acceso libre, sin bloqueos
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-potentia-muted md:text-base">
          Recorré los módulos en el orden que prefieras. Marcá lecciones como completadas para
          llevar tu propio avance.
        </p>
      </header>

      <div className="mb-8">
        <LearningProgress lessons={lessons} />
      </div>

      <ContinueLearningBanner lessons={lessons} />

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => (
          <ModuleCard
            key={module.id}
            module={module}
            lessons={lessons.filter((lesson) => lesson.moduleId === module.id).sort((a, b) => a.order - b.order)}
            allLessons={lessons}
          />
        ))}
      </div>

      <div className="mt-14 space-y-10">
        {modules.map((module) => {
          const moduleLessons = lessons
            .filter((lesson) => lesson.moduleId === module.id)
            .sort((a, b) => a.order - b.order);
          return (
            <section key={module.id} id={module.id} aria-labelledby={`${module.id}-heading`}>
              <h2 id={`${module.id}-heading`} className="mb-4 text-lg font-semibold text-potentia-ink">
                {module.title}
              </h2>
              <div className="space-y-3">
                {moduleLessons.map((lesson, index) => (
                  <LessonCard key={lesson.id} lesson={lesson} allLessons={lessons} index={index + 1} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
