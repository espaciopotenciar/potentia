/**
 * Verificación de integridad del contenido antes de confiar en el seed
 * generado. No se conecta a Supabase ni escribe nada: solo lee
 * src/data/*.ts y valida referencias cruzadas.
 */
import { modules } from "../src/data/modules";
import { lessons } from "../src/data/lessons";
import { actionMatrix } from "../src/data/actionMatrix";
import { objections } from "../src/data/objections";
import { concepts } from "../src/data/concepts";

let errors = 0;

function check(condition: boolean, message: string) {
  if (!condition) {
    console.error(`FALLO: ${message}`);
    errors++;
  }
}

console.log("=== Resumen de registros ===");
console.log(`modules: ${modules.length}`);
console.log(`lessons: ${lessons.length}`);
console.log(`actionMatrix: ${actionMatrix.length}`);
console.log(`objections: ${objections.length}`);
console.log(`concepts: ${concepts.length}`);

const lessonIds = new Set(lessons.map((l) => l.id));
const lessonSlugs = new Set(lessons.map((l) => l.slug));
const moduleIds = new Set(modules.map((m) => m.id));

// IDs únicos por tabla (evita duplicados que romperían la PK)
check(lessonIds.size === lessons.length, "hay ids de lessons duplicados");
check(
  new Set(actionMatrix.map((a) => a.id)).size === actionMatrix.length,
  "hay ids de actionMatrix duplicados"
);
check(
  new Set(objections.map((o) => o.id)).size === objections.length,
  "hay ids de objections duplicados"
);
check(
  new Set(concepts.map((c) => c.id)).size === concepts.length,
  "hay ids de concepts duplicados"
);
check(lessonSlugs.size === lessons.length, "hay slugs de lessons duplicados");

// lessons.moduleId -> modules.id
for (const l of lessons) {
  check(moduleIds.has(l.moduleId), `lesson ${l.id} referencia moduleId inexistente: ${l.moduleId}`);
}

// related_lesson_ids en las tres tablas -> lessons.id
function checkRelated(source: string, id: string, relatedIds: string[]) {
  for (const rid of relatedIds) {
    check(lessonIds.has(rid), `${source} ${id} referencia relatedLessonId inexistente: ${rid}`);
  }
}
for (const l of lessons) checkRelated("lesson", l.id, l.relatedLessonIds);
for (const a of actionMatrix) checkRelated("actionMatrix", a.id, a.relatedLessonIds);
for (const o of objections) checkRelated("objection", o.id, o.relatedLessonIds);

// concepts.lessonSlug -> lessons.slug
for (const c of concepts) {
  check(lessonSlugs.has(c.lessonSlug), `concept ${c.id} referencia lessonSlug inexistente: ${c.lessonSlug}`);
}

// requiredVariables <= 5 (regla del requerimiento original de Accionar)
for (const a of actionMatrix) {
  for (const [style, variant] of [
    ["empathetic", a.empathetic],
    ["neutral", a.neutral],
    ["direct", a.direct],
  ] as const) {
    check(
      variant.requiredVariables.length <= 5,
      `actionMatrix ${a.id}.${style} tiene más de 5 variables: ${variant.requiredVariables.length}`
    );
  }
}

console.log(`\n=== Resultado ===`);
if (errors === 0) {
  console.log("OK: sin errores de referencias cruzadas ni duplicados.");
} else {
  console.log(`${errors} error(es) encontrados.`);
  process.exit(1);
}
