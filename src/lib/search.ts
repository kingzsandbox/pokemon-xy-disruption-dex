import { getAbilities } from "./data/abilities";
import { getMachineBrowseEntries } from "./data/compatibility";
import { getBrowseItems } from "./data/items";
import { getLocations } from "./data/locations";
import { getMoves } from "./data/moves";
import { getAllPokemon } from "./data/pokemon";
import { getLevelCaps } from "./data/systems";
import { getTrainers } from "./data/trainers";
import type { SearchResult } from "./types";

let cachedSearchIndex: SearchResult[] | null = null;

export function normalizeQuery(value: string): string {
  return value.trim().toLowerCase();
}

export function getHomePokemonHref(slug: string): string {
  return `/?tab=pokedex&focus=${encodeURIComponent(slug)}#pokemon-row-${encodeURIComponent(slug)}`;
}

export function getSearchResultHref(result: Pick<SearchResult, "type" | "slug">): string {
  if (result.type === "pokemon") {
    return getHomePokemonHref(result.slug);
  }

  if (result.type === "location") {
    return `/locations/${result.slug}`;
  }

  if (result.type === "machine") {
    return `/machines/${result.slug}`;
  }

  if (result.type === "system") {
    return `/systems#${result.slug}`;
  }

  if (result.type === "ability") {
    return `/abilities/${result.slug}`;
  }

  return `/${result.type}s/${result.slug}`;
}

export function getSearchIndex(): SearchResult[] {
  if (cachedSearchIndex) {
    return cachedSearchIndex;
  }

  const pokemonResults: SearchResult[] = getAllPokemon().map((entry) => ({
      id: entry.id,
      type: "pokemon",
      title: entry.name,
      subtitle: `#${entry.dexNumber} • ${entry.types.join(" / ")}`,
      slug: entry.slug,
    }));

  const locationResults: SearchResult[] = getLocations().map((entry) => ({
      id: entry.id,
      type: "location",
      title: entry.name,
      subtitle: entry.region,
      slug: entry.slug,
    }));

  const itemResults: SearchResult[] = getBrowseItems().map((entry) => ({
      id: entry.id,
      type: "item",
      title: entry.name,
      subtitle: entry.category,
      slug: entry.slug,
    }));

  const moveResults: SearchResult[] = getMoves().map((entry) => ({
      id: entry.id,
      type: "move",
      title: entry.name,
      subtitle: [entry.status, entry.type].filter(Boolean).join(" • ") || "Move",
      slug: entry.slug,
    }));

  const machineResults: SearchResult[] = getMachineBrowseEntries().map(
    ({ machine, move, compatibilityCount }) => ({
      id: machine.id,
      type: "machine" as const,
      title: machine.code,
      subtitle: [
        move?.name ?? "Unknown move",
        machine.location,
        compatibilityCount > 0 ? `${compatibilityCount} compatible Pokemon` : null,
      ]
        .filter(Boolean)
        .join(" • "),
      slug: machine.slug,
    }),
  );

  const abilityResults: SearchResult[] = getAbilities().map((entry) => ({
    id: entry.id,
    type: "ability",
    title: entry.name,
    subtitle: entry.description,
    slug: entry.slug,
  }));

  const trainerResults: SearchResult[] = getTrainers().map((entry) => ({
      id: entry.id,
      type: "trainer" as const,
      title: entry.name,
      subtitle: [entry.location, entry.ruleset, entry.format].filter(Boolean).join(" • "),
      slug: entry.slug,
    }));

  const levelCapResults: SearchResult[] = [
    {
      id: "system-level-caps",
      type: "system" as const,
      title: "Level Caps",
      subtitle: `${getLevelCaps().length} imported cap checkpoints`,
      slug: "level-caps",
    },
  ];

  cachedSearchIndex = [
    ...pokemonResults,
    ...locationResults,
    ...itemResults,
    ...moveResults,
    ...machineResults,
    ...abilityResults,
    ...trainerResults,
    ...levelCapResults,
  ].sort((left, right) => left.title.localeCompare(right.title));

  return cachedSearchIndex;
}

export function searchDex(query: string): SearchResult[] {
  const normalizedQuery = normalizeQuery(query);

  if (!normalizedQuery) {
    return [];
  }

  const matches = getSearchIndex().filter((entry) => {
    const haystack = `${entry.title} ${entry.subtitle}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  return matches.sort((left, right) => {
    const leftStarts = left.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
    const rightStarts = right.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;

    if (leftStarts !== rightStarts) {
      return leftStarts - rightStarts;
    }

    return left.title.localeCompare(right.title);
  });
}
