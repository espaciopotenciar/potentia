import "server-only";

import { createClient } from "@/lib/supabase/server";
import type { LearningModule, Lesson } from "@/types/lesson";
import type { ActionMatrixEntry } from "@/types/action";
import type { Objection } from "@/types/objection";
import {
  mapActionMatrixEntry,
  mapLesson,
  mapModule,
  mapObjection,
  mapSearchConcept,
  type ActionMatrixRow,
  type ConceptSummary,
  type LessonRow,
  type ModuleRow,
  type ObjectionRow,
  type SearchConceptRow,
} from "@/lib/content/mappers";

/**
 * Capa de acceso a contenido para la Etapa 3. Reemplaza a
 * src/lib/dataProvider.ts (que seguía leyendo de src/data/*.ts) para
 * todo lo que se muestra dentro del área privada.
 *
 * Cada función acá usa el cliente de servidor de Supabase
 * (src/lib/supabase/server.ts), que respeta la sesión de quien pide la
 * página — por eso NO hace falta repetir "and active = true" ni verificar
 * membresía acá: las políticas RLS de modules/lessons/action_matrix_entries/
 * objections/search_concepts (ver supabase/migrations/0005_rls_policies.sql)
 * ya devuelven cero filas si la sesión no tiene membresía activa. Estas
 * funciones solo se llaman desde páginas dentro de src/app/(private)/app,
 * que además ya pasaron la validación del layout — dos capas, ninguna es
 * la única.
 */

export async function getModules(): Promise<LearningModule[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("modules")
    .select("id, sort_order, title, description, icon, active")
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as ModuleRow[]).map(mapModule);
}

export async function getLessons(): Promise<Lesson[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, slug, title, description, module_id, sort_order, estimated_minutes, content, keywords, related_lesson_ids, active"
    )
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return ((data ?? []) as LessonRow[]).map(mapLesson);
}

export async function getLessonBySlug(slug: string): Promise<Lesson | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("lessons")
    .select(
      "id, slug, title, description, module_id, sort_order, estimated_minutes, content, keywords, related_lesson_ids, active"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapLesson(data as LessonRow) : null;
}

export async function getActionMatrix(): Promise<ActionMatrixEntry[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("action_matrix_entries")
    .select(
      "id, has_previous_conversation, sale_type, opportunity_stage, unanswered_messages, channel, has_agreed_date, applies_4x4, recommended_stage, stage_name, interpretation, objective, suggested_action, advice, mistake_to_avoid, empathetic_message, neutral_message, direct_message, related_lesson_ids, active"
    );

  if (error) throw error;
  return ((data ?? []) as ActionMatrixRow[]).map(mapActionMatrixEntry);
}

export async function getObjections(): Promise<Objection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("objections")
    .select(
      "id, slug, title, category, common_phrase, is_open_ended, what_it_may_express, what_not_to_assume, questions_to_explore, what_to_avoid, next_goal, empathetic_response, neutral_response, direct_response, mistake_to_avoid, related_lesson_ids, keywords, active"
    );

  if (error) throw error;
  return ((data ?? []) as ObjectionRow[]).map(mapObjection);
}

export async function getObjectionBySlug(slug: string): Promise<Objection | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("objections")
    .select(
      "id, slug, title, category, common_phrase, is_open_ended, what_it_may_express, what_not_to_assume, questions_to_explore, what_to_avoid, next_goal, empathetic_response, neutral_response, direct_response, mistake_to_avoid, related_lesson_ids, keywords, active"
    )
    .eq("slug", slug)
    .maybeSingle();

  if (error) throw error;
  return data ? mapObjection(data as ObjectionRow) : null;
}

export async function getSearchConcepts(): Promise<ConceptSummary[]> {
  const supabase = await createClient();
  // "lessons(slug)" embebe la tabla relacionada vía la FK
  // search_concepts.lesson_id -> lessons.id (ver 0002_content_tables.sql).
  const { data, error } = await supabase
    .from("search_concepts")
    .select("id, title, snippet, keywords, lessons(slug)");

  if (error) throw error;
  return ((data ?? []) as unknown as SearchConceptRow[])
    .map(mapSearchConcept)
    .filter((concept): concept is ConceptSummary => concept !== null);
}

export type { ConceptSummary } from "@/lib/content/mappers";
