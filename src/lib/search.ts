import { getItems } from "@/lib/data/items";
import { getLocations } from "@/lib/data/locations";
import { getMoves } from "@/lib/data/moves";
import { getAllPokemon } from "@/lib/data/pokemon";
import type { SearchResult } from "@/lib/types";

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function searchDex(query: string): SearchResult[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const pokemonResults: SearchResult[] = getAllPokemon()
    .filter((entry) => entry.name.toLowerCase().includes(normalizedQuery))
    .map((entry) => ({
      id: entry.id,
      type: "pokemon",
      title: entry.name,
      subtitle: `#${entry.dexNumber} • ${entry.types.join(" / ")}`,
      slug: entry.slug,
    }));

  const locationResults: SearchResult[] = getLocations()
    .filter((entry) => entry.name.toLowerCase().includes(normalizedQuery))
    .map((entry) => ({
      id: entry.id,
      type: "location",
      title: entry.name,
      subtitle: entry.region,
      slug: entry.slug,
    }));

  const itemResults: SearchResult[] = getItems()
    .filter((entry) => entry.name.toLowerCase().includes(normalizedQuery))
    .map((entry) => ({
      id: entry.id,
      type: "item",
      title: entry.name,
      subtitle: entry.category,
      slug: entry.slug,
    }));

  const moveResults: SearchResult[] = getMoves()
    .filter((entry) => entry.name.toLowerCase().includes(normalizedQuery))
    .map((entry) => ({
      id: entry.id,
      type: "move",
      title: entry.name,
      subtitle: [entry.status, entry.type].filter(Boolean).join(" • ") || "Move",
      slug: entry.slug,
    }));

  return [...pokemonResults, ...locationResults, ...itemResults, ...moveResults].sort((left, right) =>
    left.title.localeCompare(right.title),
  );
}
