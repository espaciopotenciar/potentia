const DIACRITICS_PATTERN = new RegExp(
  `[${String.fromCharCode(0x0300)}-${String.fromCharCode(0x036f)}]`,
  "g"
);

export function normalizeText(value: string): string {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .trim();
}

export function includesNormalized(haystack: string, needle: string): boolean {
  if (!needle) return false;
  return normalizeText(haystack).includes(normalizeText(needle));
}

export function highlightMatches(text: string, query: string): { text: string; match: boolean }[] {
  if (!query.trim()) return [{ text, match: false }];

  const normalizedText = normalizeText(text);
  const normalizedQuery = normalizeText(query);
  const segments: { text: string; match: boolean }[] = [];

  let cursor = 0;
  let index = normalizedText.indexOf(normalizedQuery, cursor);

  if (index === -1) return [{ text, match: false }];

  while (index !== -1) {
    if (index > cursor) {
      segments.push({ text: text.slice(cursor, index), match: false });
    }
    segments.push({ text: text.slice(index, index + query.length), match: true });
    cursor = index + query.length;
    index = normalizedText.indexOf(normalizedQuery, cursor);
  }

  if (cursor < text.length) {
    segments.push({ text: text.slice(cursor), match: false });
  }

  return segments;
}
