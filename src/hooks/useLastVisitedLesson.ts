"use client";

import { useLocalStorage } from "@/hooks/useLocalStorage";
import { STORAGE_KEYS } from "@/lib/storage";

/**
 * "Última lección visitada": SOLO una mejora visual temporal para el
 * banner "Continuar donde quedaste" — no es progreso real. El progreso
 * real (lecciones completadas) vive en learning_progress (Supabase) y se
 * lee server-side; esto es lo único que sigue usando localStorage a
 * propósito, porque no hace falta que sobreviva entre dispositivos ni que
 * esté respaldado por RLS: si se pierde, en el peor caso el banner
 * simplemente no aparece.
 */
export function useLastVisitedLesson() {
  const [lastLessonSlug, setLastLessonSlug, hydrated] = useLocalStorage<string | null>(
    STORAGE_KEYS.lastLessonSlug,
    null
  );

  return { lastLessonSlug, setLastLessonSlug, hydrated };
}
