import type { LearningModule, Lesson } from "@/types/lesson";
import type { ActionMatrixEntry, Channel, OpportunityStage, SaleType, UnansweredMessages } from "@/types/action";
import type { Objection } from "@/types/objection";

/**
 * Convierte cada fila de Supabase (snake_case, tal como quedó sembrada en
 * la Etapa 1 — ver supabase/migrations/0002_content_tables.sql) a los
 * mismos tipos de app (camelCase) que ya usaban los componentes de
 * Aprender/Accionar/Objeciones cuando leían de src/data/*.ts. Así los
 * componentes no necesitaron cambiar de forma, solo el origen del dato.
 */

export interface ModuleRow {
  id: string;
  sort_order: number;
  title: string;
  description: string;
  icon: string;
  active: boolean;
}

export function mapModule(row: ModuleRow): LearningModule {
  return {
    id: row.id as LearningModule["id"],
    order: row.sort_order,
    title: row.title,
    description: row.description,
    icon: row.icon as LearningModule["icon"],
  };
}

export interface LessonRow {
  id: string;
  slug: string;
  title: string;
  description: string;
  module_id: string;
  sort_order: number;
  estimated_minutes: number;
  content: string[];
  keywords: string[];
  related_lesson_ids: string[];
  active: boolean;
}

export function mapLesson(row: LessonRow): Lesson {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    moduleId: row.module_id as Lesson["moduleId"],
    order: row.sort_order,
    estimatedMinutes: row.estimated_minutes,
    content: row.content,
    keywords: row.keywords,
    relatedLessonIds: row.related_lesson_ids,
    active: row.active,
  };
}

interface MessageVariantRow {
  template: string;
  example: string;
  requiredVariables: string[];
}

export interface ActionMatrixRow {
  id: string;
  has_previous_conversation: boolean;
  sale_type: string;
  opportunity_stage: string;
  unanswered_messages: string;
  channel: string;
  has_agreed_date: string;
  applies_4x4: boolean;
  recommended_stage: string;
  stage_name: string;
  interpretation: string;
  objective: string;
  suggested_action: string;
  advice: string;
  mistake_to_avoid: string;
  empathetic_message: MessageVariantRow;
  neutral_message: MessageVariantRow;
  direct_message: MessageVariantRow;
  related_lesson_ids: string[];
  active: boolean;
}

function parseUnansweredMessages(value: string): UnansweredMessages | "cualquiera" {
  if (value === "cualquiera") return "cualquiera";
  const parsed = Number(value);
  return parsed as UnansweredMessages;
}

function parseHasAgreedDate(value: string): boolean | "cualquiera" {
  if (value === "cualquiera") return "cualquiera";
  return value === "true";
}

export function mapActionMatrixEntry(row: ActionMatrixRow): ActionMatrixEntry {
  return {
    id: row.id,
    hasPreviousConversation: row.has_previous_conversation,
    saleType: row.sale_type as SaleType | "cualquiera",
    opportunityStage: row.opportunity_stage as OpportunityStage | "cualquiera",
    unansweredMessages: parseUnansweredMessages(row.unanswered_messages),
    channel: row.channel as Channel | "cualquiera",
    hasAgreedDate: parseHasAgreedDate(row.has_agreed_date),
    applies4x4: row.applies_4x4,
    recommendedStage: row.recommended_stage as ActionMatrixEntry["recommendedStage"],
    stageName: row.stage_name,
    interpretation: row.interpretation,
    objective: row.objective,
    suggestedAction: row.suggested_action,
    advice: row.advice,
    mistakeToAvoid: row.mistake_to_avoid,
    empathetic: row.empathetic_message,
    neutral: row.neutral_message,
    direct: row.direct_message,
    relatedLessonIds: row.related_lesson_ids,
    active: row.active,
  };
}

interface ObjectionResponseRow {
  template: string;
  example: string;
}

export interface ObjectionRow {
  id: string;
  slug: string;
  title: string;
  category: string;
  common_phrase: string;
  is_open_ended: boolean;
  what_it_may_express: string[];
  what_not_to_assume: string[];
  questions_to_explore: string[];
  what_to_avoid: string[];
  next_goal: string;
  empathetic_response: ObjectionResponseRow;
  neutral_response: ObjectionResponseRow;
  direct_response: ObjectionResponseRow;
  mistake_to_avoid: string;
  related_lesson_ids: string[];
  keywords: string[];
  active: boolean;
}

export function mapObjection(row: ObjectionRow): Objection {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    category: row.category,
    commonPhrase: row.common_phrase,
    active: row.active,
    isOpenEnded: row.is_open_ended,
    whatItMayExpress: row.what_it_may_express,
    whatNotToAssume: row.what_not_to_assume,
    questionsToExplore: row.questions_to_explore,
    whatToAvoid: row.what_to_avoid,
    nextGoal: row.next_goal,
    empathetic: row.empathetic_response,
    neutral: row.neutral_response,
    direct: row.direct_response,
    mistakeToAvoid: row.mistake_to_avoid,
    relatedLessonIds: row.related_lesson_ids,
    keywords: row.keywords,
  };
}

export interface SearchConceptRow {
  id: string;
  title: string;
  snippet: string;
  keywords: string[];
  lessons: { slug: string } | { slug: string }[] | null;
}

export interface ConceptSummary {
  id: string;
  title: string;
  snippet: string;
  keywords: string[];
  lessonSlug: string;
}

export function mapSearchConcept(row: SearchConceptRow): ConceptSummary | null {
  const joined = Array.isArray(row.lessons) ? row.lessons[0] : row.lessons;
  if (!joined) return null;
  return {
    id: row.id,
    title: row.title,
    snippet: row.snippet,
    keywords: row.keywords,
    lessonSlug: joined.slug,
  };
}
