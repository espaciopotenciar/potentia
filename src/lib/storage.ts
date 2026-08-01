export const STORAGE_KEYS = {
  completedLessons: "potentia:completed-lessons",
  lastLessonSlug: "potentia:last-lesson",
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage puede no estar disponible (modo privado, cuotas, etc.).
    // Se ignora silenciosamente: el progreso simplemente no persiste.
  }
}
