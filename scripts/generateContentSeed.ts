/**
 * Genera supabase/seed/content_seed.sql a partir de los datos TypeScript
 * que hoy usa la app pública (src/data/*.ts) — la MISMA fuente que ya
 * revisaste y aprobaste, sin volver a transcribirla a mano.
 *
 * Por qué existe este script en vez de un .sql escrito a mano:
 * src/data/lessons.ts + actionMatrix.ts + objections.ts + concepts.ts
 * suman más de 2400 líneas. Transcribirlas manualmente a SQL introduciría
 * riesgo real de errores de tipeo en contenido pago (plantillas de
 * mensajes, objeciones). Generarlas programáticamente desde los mismos
 * objetos que ya usa la aplicación garantiza que el seed sea un espejo
 * exacto del contenido actual.
 *
 * Este script NO se ejecutó todavía (el entorno en el que se preparó
 * este plan no tiene Node.js instalado). Se deja listo para correr con:
 *
 *   npx tsx scripts/generateContentSeed.ts
 *
 * (agrega "tsx" como devDependency — ver package.json). Genera el
 * archivo supabase/seed/content_seed.sql, que después se revisa y se
 * aplica igual que cualquier otra migración — nunca se ejecuta solo.
 *
 * No se conecta a Supabase ni usa ninguna credencial: solo lee
 * src/data/*.ts y escribe un archivo .sql en disco.
 */

import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { modules } from "../src/data/modules";
import { lessons } from "../src/data/lessons";
import { actionMatrix } from "../src/data/actionMatrix";
import { objections } from "../src/data/objections";
import { concepts } from "../src/data/concepts";

function sqlString(value: string): string {
  return `'${value.replace(/'/g, "''")}'`;
}

function sqlStringArray(values: string[]): string {
  if (values.length === 0) return "array[]::text[]";
  return `array[${values.map((v) => sqlString(v)).join(", ")}]`;
}

function sqlJsonb(value: unknown): string {
  const json = JSON.stringify(value);
  return `${sqlString(json)}::jsonb`;
}

function sqlBool(value: boolean): string {
  return value ? "true" : "false";
}

const lines: string[] = [
  "-- =====================================================================",
  "-- content_seed.sql (GENERADO — no editar a mano)",
  "-- Generado por scripts/generateContentSeed.ts a partir de src/data/*.ts.",
  "-- Idempotente: cada INSERT usa ON CONFLICT (id) DO UPDATE, así que",
  "-- correrlo varias veces actualiza el contenido en vez de duplicarlo o",
  "-- fallar.",
  "-- =====================================================================",
  "",
];

// ---------------------------------------------------------------------
// modules
// ---------------------------------------------------------------------
for (const m of modules) {
  lines.push(
    `insert into public.modules (id, sort_order, title, description, icon, active)`,
    `values (${sqlString(m.id)}, ${m.order}, ${sqlString(m.title)}, ${sqlString(m.description)}, ${sqlString(m.icon)}, ${sqlBool(true)})`,
    `on conflict (id) do update set sort_order = excluded.sort_order, title = excluded.title, description = excluded.description, icon = excluded.icon, active = excluded.active;`,
    ""
  );
}

// ---------------------------------------------------------------------
// lessons
// ---------------------------------------------------------------------
for (const l of lessons) {
  lines.push(
    `insert into public.lessons (id, slug, title, description, module_id, sort_order, estimated_minutes, content, keywords, related_lesson_ids, active)`,
    `values (${sqlString(l.id)}, ${sqlString(l.slug)}, ${sqlString(l.title)}, ${sqlString(l.description)}, ${sqlString(l.moduleId)}, ${l.order}, ${l.estimatedMinutes}, ${sqlJsonb(l.content)}, ${sqlStringArray(l.keywords)}, ${sqlStringArray(l.relatedLessonIds)}, ${sqlBool(l.active)})`,
    `on conflict (id) do update set slug = excluded.slug, title = excluded.title, description = excluded.description, module_id = excluded.module_id, sort_order = excluded.sort_order, estimated_minutes = excluded.estimated_minutes, content = excluded.content, keywords = excluded.keywords, related_lesson_ids = excluded.related_lesson_ids, active = excluded.active;`,
    ""
  );
}

// ---------------------------------------------------------------------
// action_matrix_entries
// ---------------------------------------------------------------------
for (const a of actionMatrix) {
  lines.push(
    `insert into public.action_matrix_entries (id, has_previous_conversation, sale_type, opportunity_stage, unanswered_messages, channel, has_agreed_date, applies_4x4, recommended_stage, stage_name, interpretation, objective, suggested_action, advice, mistake_to_avoid, empathetic_message, neutral_message, direct_message, related_lesson_ids, active)`,
    `values (${sqlString(a.id)}, ${sqlBool(a.hasPreviousConversation)}, ${sqlString(String(a.saleType))}, ${sqlString(String(a.opportunityStage))}, ${sqlString(String(a.unansweredMessages))}, ${sqlString(String(a.channel))}, ${sqlString(String(a.hasAgreedDate))}, ${sqlBool(a.applies4x4)}, ${sqlString(a.recommendedStage)}, ${sqlString(a.stageName)}, ${sqlString(a.interpretation)}, ${sqlString(a.objective)}, ${sqlString(a.suggestedAction)}, ${sqlString(a.advice)}, ${sqlString(a.mistakeToAvoid)}, ${sqlJsonb(a.empathetic)}, ${sqlJsonb(a.neutral)}, ${sqlJsonb(a.direct)}, ${sqlStringArray(a.relatedLessonIds)}, ${sqlBool(a.active)})`,
    `on conflict (id) do update set has_previous_conversation = excluded.has_previous_conversation, sale_type = excluded.sale_type, opportunity_stage = excluded.opportunity_stage, unanswered_messages = excluded.unanswered_messages, channel = excluded.channel, has_agreed_date = excluded.has_agreed_date, applies_4x4 = excluded.applies_4x4, recommended_stage = excluded.recommended_stage, stage_name = excluded.stage_name, interpretation = excluded.interpretation, objective = excluded.objective, suggested_action = excluded.suggested_action, advice = excluded.advice, mistake_to_avoid = excluded.mistake_to_avoid, empathetic_message = excluded.empathetic_message, neutral_message = excluded.neutral_message, direct_message = excluded.direct_message, related_lesson_ids = excluded.related_lesson_ids, active = excluded.active;`,
    ""
  );
}

// ---------------------------------------------------------------------
// objections
// ---------------------------------------------------------------------
for (const o of objections) {
  lines.push(
    `insert into public.objections (id, slug, title, category, common_phrase, is_open_ended, what_it_may_express, what_not_to_assume, questions_to_explore, what_to_avoid, next_goal, empathetic_response, neutral_response, direct_response, mistake_to_avoid, related_lesson_ids, keywords, active)`,
    `values (${sqlString(o.id)}, ${sqlString(o.slug)}, ${sqlString(o.title)}, ${sqlString(o.category)}, ${sqlString(o.commonPhrase)}, ${sqlBool(Boolean(o.isOpenEnded))}, ${sqlStringArray(o.whatItMayExpress)}, ${sqlStringArray(o.whatNotToAssume)}, ${sqlStringArray(o.questionsToExplore)}, ${sqlStringArray(o.whatToAvoid)}, ${sqlString(o.nextGoal)}, ${sqlJsonb(o.empathetic)}, ${sqlJsonb(o.neutral)}, ${sqlJsonb(o.direct)}, ${sqlString(o.mistakeToAvoid)}, ${sqlStringArray(o.relatedLessonIds)}, ${sqlStringArray(o.keywords)}, ${sqlBool(o.active)})`,
    `on conflict (id) do update set slug = excluded.slug, title = excluded.title, category = excluded.category, common_phrase = excluded.common_phrase, is_open_ended = excluded.is_open_ended, what_it_may_express = excluded.what_it_may_express, what_not_to_assume = excluded.what_not_to_assume, questions_to_explore = excluded.questions_to_explore, what_to_avoid = excluded.what_to_avoid, next_goal = excluded.next_goal, empathetic_response = excluded.empathetic_response, neutral_response = excluded.neutral_response, direct_response = excluded.direct_response, mistake_to_avoid = excluded.mistake_to_avoid, related_lesson_ids = excluded.related_lesson_ids, keywords = excluded.keywords, active = excluded.active;`,
    ""
  );
}

// ---------------------------------------------------------------------
// search_concepts (lessonSlug -> lesson_id)
// ---------------------------------------------------------------------
const lessonIdBySlug = new Map(lessons.map((l) => [l.slug, l.id]));

for (const c of concepts) {
  const lessonId = lessonIdBySlug.get(c.lessonSlug);
  if (!lessonId) {
    throw new Error(
      `concepts.ts: "${c.id}" apunta a lessonSlug "${c.lessonSlug}", que no existe en lessons.ts`
    );
  }
  lines.push(
    `insert into public.search_concepts (id, title, snippet, keywords, lesson_id)`,
    `values (${sqlString(c.id)}, ${sqlString(c.title)}, ${sqlString(c.snippet)}, ${sqlStringArray(c.keywords)}, ${sqlString(lessonId)})`,
    `on conflict (id) do update set title = excluded.title, snippet = excluded.snippet, keywords = excluded.keywords, lesson_id = excluded.lesson_id;`,
    ""
  );
}

const outputPath = resolve(__dirname, "../supabase/seed/content_seed.sql");
writeFileSync(outputPath, lines.join("\n"), "utf-8");

console.log(`OK: generado ${outputPath}`);
console.log(
  `  modules=${modules.length} lessons=${lessons.length} actionMatrix=${actionMatrix.length} objections=${objections.length} concepts=${concepts.length}`
);
