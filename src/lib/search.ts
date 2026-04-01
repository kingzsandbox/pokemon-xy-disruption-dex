import { getItems } from "@/lib/data/items";
import { getLocations } from "@/lib/data/locations";
import { getMoves } from "@/lib/data/moves";
import { getAllPokemon } from "@/lib/data/pokemon";
import { getLevelCaps, getPickupEntries } from "@/lib/data/systems";
import { getTrainers } from "@/lib/data/trainers";
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

  const trainerResults: SearchResult[] = getTrainers()
    .filter((entry) => entry.name.toLowerCase().includes(normalizedQuery))
    .map((entry) => ({
      id: entry.id,
      type: "trainer" as const,
      title: entry.name,
      subtitle: [entry.location, entry.ruleset, entry.format].filter(Boolean).join(" • "),
      slug: entry.slug,
    }));

  const levelCapResults: SearchResult[] =
    "level cap blind caps cap caps".includes(normalizedQuery) ||
    getLevelCaps().some(
      (entry) =>
        entry.name.toLowerCase().includes(normalizedQuery) ||
        entry.location.toLowerCase().includes(normalizedQuery) ||
        entry.trainer.toLowerCase().includes(normalizedQuery),
    )
      ? [
          {
            id: "system-level-caps",
            type: "system" as const,
            title: "Blind Level Caps",
            subtitle: `${getLevelCaps().length} imported cap checkpoints`,
            slug: "level-caps",
          },
        ]
      : [];

  const pickupResults: SearchResult[] =
    "pickup pickups pickup-table".includes(normalizedQuery) ||
    getPickupEntries().some(
      (entry) =>
        entry.name.toLowerCase().includes(normalizedQuery) ||
        entry.itemName.toLowerCase().includes(normalizedQuery),
    )
      ? [
          {
            id: "system-pickup-table",
            type: "system" as const,
            title: "Pickup Item Tables",
            subtitle: `${getPickupEntries().length} imported pickup entries`,
            slug: "pickup-table",
          },
        ]
      : [];

  return [
    ...pokemonResults,
    ...locationResults,
    ...itemResults,
    ...moveResults,
    ...trainerResults,
    ...levelCapResults,
    ...pickupResults,
  ].sort((left, right) => left.title.localeCompare(right.title));
}
