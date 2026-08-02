import "server-only";

import { createClient } from "@/lib/supabase/server";

/**
 * Progreso educativo real (Etapa 3): learning_progress es la única fuente
 * de verdad. No se lee ningún user_id acá a mano — la política RLS de
 * learning_progress (ver 0005_rls_policies.sql) ya filtra
 * "user_id = auth.uid()" del lado de la base, así que esta consulta
 * simplemente no puede traer filas de otro usuario aunque quisiera.
 */
export async function getCompletedLessonIds(): Promise<Set<string>> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("learning_progress").select("lesson_id");

  if (error) throw error;
  return new Set((data ?? []).map((row) => row.lesson_id as string));
}
