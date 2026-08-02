"use client";

import { createClient } from "@/lib/supabase/client";

/**
 * Escritura de progreso desde el cliente. Se llama directamente a la
 * tabla (no una RPC): las políticas RLS de learning_progress ya
 * restringen INSERT/UPDATE/DELETE a "user_id = auth.uid()" (ver
 * 0005_rls_policies.sql) — es el mismo criterio de "autoservicio
 * legítimo" con el que se diseñó esa tabla en la Etapa 1. Si alguien
 * intentara mandar un user_id ajeno, RLS lo rechaza igual.
 *
 * "Completar" upsertea la fila; "descompletar" la borra directamente —
 * una fila en la tabla siempre significa "esta lección está completada".
 */
export async function setLessonCompleted(userId: string, lessonId: string, completed: boolean): Promise<void> {
  const supabase = createClient();

  if (completed) {
    const { error } = await supabase
      .from("learning_progress")
      .upsert(
        { user_id: userId, lesson_id: lessonId, completed: true, completed_at: new Date().toISOString() },
        { onConflict: "user_id,lesson_id" }
      );
    if (error) throw error;
    return;
  }

  const { error } = await supabase
    .from("learning_progress")
    .delete()
    .eq("user_id", userId)
    .eq("lesson_id", lessonId);
  if (error) throw error;
}
