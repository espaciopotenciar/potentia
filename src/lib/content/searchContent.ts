import { includesNormalized } from "@/lib/textUtils";
import type { Lesson } from "@/types/lesson";
import type { Objection } from "@/types/objection";
import type { SearchResultItem } from "@/types/search";
import type { ConceptSummary } from "@/lib/content/mappers";

/**
 * Misma lógica de búsqueda que tenía LocalDataProvider.searchContent()
 * (src/lib/dataProvider.ts), movida a una función pura que recibe los
 * arrays ya cargados en vez de leerlos ella misma. La carga real (desde
 * Supabase, ya filtrada por RLS a contenido con membresía activa) la hace
 * la página de /app/buscar antes de llamar a esta función — así se evita
 * una consulta a la base por cada letra que se tipea.
 */
export function searchContent(
  query: string,
  data: { lessons: Lesson[]; objections: Objection[]; concepts: ConceptSummary[] }
): SearchResultItem[] {
  const trimmed = query.trim();
  if (!trimmed) return [];

  const results: SearchResultItem[] = [];

  for (const lesson of data.lessons) {
    const haystack = [lesson.title, lesson.description, ...lesson.content, ...lesson.keywords].join(" ");
    if (includesNormalized(haystack, trimmed)) {
      results.push({
        id: lesson.id,
        group: "aprender",
        title: lesson.title,
        snippet: lesson.description,
        href: `/app/aprender/${lesson.slug}`,
      });
    }
  }

  for (const objection of data.objections) {
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
        href: `/app/objeciones/${objection.slug}`,
      });
    }
  }

  for (const concept of data.concepts) {
    const haystack = [concept.title, concept.snippet, ...concept.keywords].join(" ");
    if (includesNormalized(haystack, trimmed)) {
      results.push({
        id: concept.id,
        group: "conceptos",
        title: concept.title,
        snippet: concept.snippet,
        href: `/app/aprender/${concept.lessonSlug}`,
      });
    }
  }

  return results;
}
