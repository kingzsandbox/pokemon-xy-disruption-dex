import type { NamedEntry, SearchResult } from "@/lib/types";

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function searchEntries<T extends NamedEntry>(
  entries: T[],
  query: string,
): SearchResult<T>[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return entries.map((item) => ({ item, score: 0 }));
  }

  return entries
    .filter((item) => normalizeQuery(item.name).includes(normalizedQuery))
    .map((item) => ({
      item,
      score: normalizeQuery(item.name) === normalizedQuery ? 2 : 1,
    }))
    .sort((left, right) => right.score - left.score || left.item.name.localeCompare(right.item.name));
}
