"use client";

import { useCallback, useEffect, useState } from "react";
import { readStorage, writeStorage } from "@/lib/storage";

/**
 * Hook SSR-safe para persistir un valor en localStorage.
 * En el primer render del servidor devuelve `fallback` para evitar
 * problemas de hidratación; sincroniza con localStorage tras montar.
 */
export function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setValue(readStorage<T>(key, fallback));
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        writeStorage(key, resolved);
        return resolved;
      });
    },
    [key]
  );

  return [value, update, hydrated] as const;
}
