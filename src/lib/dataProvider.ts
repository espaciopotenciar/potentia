import type { Lesson, LearningModule } from "@/types/lesson";
import type { ActionMatrixEntry } from "@/types/action";
import type { Objection } from "@/types/objection";
import type { SearchResultItem } from "@/types/search";
import { lessons as lessonsData } from "@/data/lessons";
import { modules as modulesData } from "@/data/modules";
import { actionMatrix as actionMatrixData } from "@/data/actionMatrix";
import { objections as objectionsData } from "@/data/objections";
import { concepts as conceptsData } from "@/data/concepts";
import { includesNormalized } from "@/lib/textUtils";

/**
 * Interfaz del proveedor de datos. Hoy la implementa LocalDataProvider,
 * leyendo desde src/data/*.ts. En el futuro puede implementarse
 * GoogleSheetsDataProvider sin cambiar los componentes que consumen
 * estas funciones. Ver README.md → "Cómo reemplazar por Google Sheets".
 */
export interface DataProvider {
  getModules(): LearningModule[];
  getLessons(): Lesson[];
  getLessonBySlug(slug: string): Lesson | undefined;
  getActionMatrix(): ActionMatrixEntry[];
  getObjections(): Objection[];
  getObjectionBySlug(slug: string): Objection | undefined;
  searchContent(query: string): SearchResultItem[];
}

class LocalDataProvider implements DataProvider {
  getModules(): LearningModule[] {
    return [...modulesData].sort((a, b) => a.order - b.order);
  }

  getLessons(): Lesson[] {
    return lessonsData.filter((lesson) => lesson.active);
  }

  getLessonBySlug(slug: string): Lesson | undefined {
    return this.getLessons().find((lesson) => lesson.slug === slug);
  }

  getActionMatrix(): ActionMatrixEntry[] {
    return actionMatrixData.filter((entry) => entry.active);
  }

  getObjections(): Objection[] {
    return objectionsData.filter((objection) => objection.active);
  }

  getObjectionBySlug(slug: string): Objection | undefined {
    return this.getObjections().find((objection) => objection.slug === slug);
  }

  searchContent(query: string): SearchResultItem[] {
    const trimmed = query.trim();
    if (!trimmed) return [];

    const results: SearchResultItem[] = [];

    for (const lesson of this.getLessons()) {
      const haystack = [lesson.title, lesson.description, ...lesson.content, ...lesson.keywords].join(" ");
      if (includesNormalized(haystack, trimmed)) {
        results.push({
          id: lesson.id,
          group: "aprender",
          title: lesson.title,
          snippet: lesson.description,
          href: `/aprender/${lesson.slug}`,
        });
      }
    }

    for (const objection of this.getObjections()) {
      const haystack = [
        objection.title,
        objection.commonPhrase,
        ...objection.whatItMayExpress,
        ...objection.questionsToExplore,
        ...objection.keywords,
      ].join(" ");
      if (includesNormalized(haystack, trimmed)) {
        results.push({
          id: objection.id,
          group: "objeciones",
          title: objection.title,
          snippet: objection.commonPhrase,
          href: `/objeciones/${objection.slug}`,
        });
      }
    }

    for (const concept of conceptsData) {
      const haystack = [concept.title, concept.snippet, ...concept.keywords].join(" ");
      if (includesNormalized(haystack, trimmed)) {
        results.push({
          id: concept.id,
          group: "conceptos",
          title: concept.title,
          snippet: concept.snippet,
          href: `/aprender/${concept.lessonSlug}`,
        });
      }
    }

    return results;
  }
}

let providerInstance: DataProvider | null = null;

export function getDataProvider(): DataProvider {
  if (!providerInstance) {
    providerInstance = new LocalDataProvider();
  }
  return providerInstance;
}
