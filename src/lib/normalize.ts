import type {
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  LocationEntry,
  MoveEntry,
  PokemonEntry,
} from "./types";

function normalizeWhitespace(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function toSlug(value: string): string {
  return normalizeWhitespace(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function capitalizeWord(value: string): string {
  if (!value) {
    return value;
  }

  return value[0].toUpperCase() + value.slice(1).toLowerCase();
}

function normalizeLabel(value: string): string {
  return normalizeWhitespace(value)
    .split(" ")
    .map(capitalizeWord)
    .join(" ");
}

function normalizeAbility(value: string): string {
  return normalizeWhitespace(value)
    .split(/[\s-]+/)
    .map(capitalizeWord)
    .join(" ");
}

export function normalizePokemonType(value: string): string {
  return normalizeLabel(value);
}

export function normalizeAbilityName(value: string): string {
  return normalizeAbility(value);
}

export function normalizeItemCategory(value: string): string {
  return normalizeLabel(value);
}

export function normalizeEncounterMethod(value: string): string {
  return normalizeLabel(value);
}

export function normalizeMoveStatus(value: MoveEntry["status"]): MoveEntry["status"] {
  return normalizeWhitespace(value).toLowerCase() as MoveEntry["status"];
}

export function normalizePokemonEntry(entry: PokemonEntry): PokemonEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    slug: entry.slug ? toSlug(entry.slug) : toSlug(entry.name),
    name: normalizeWhitespace(entry.name),
    types: entry.types.map(normalizePokemonType),
    abilities: entry.abilities.map(normalizeAbilityName),
    changeSummary: normalizeWhitespace(entry.changeSummary),
  };
}

export function normalizeLocationEntry(entry: LocationEntry): LocationEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    slug: entry.slug ? toSlug(entry.slug) : toSlug(entry.name),
    name: normalizeWhitespace(entry.name),
    region: normalizeWhitespace(entry.region),
    description: normalizeWhitespace(entry.description),
  };
}

export function normalizeItemEntry(entry: ItemEntry): ItemEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    slug: entry.slug ? toSlug(entry.slug) : toSlug(entry.name),
    name: normalizeWhitespace(entry.name),
    category: normalizeItemCategory(entry.category),
    description: normalizeWhitespace(entry.description),
  };
}

export function normalizeMoveEntry(entry: MoveEntry): MoveEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    slug: entry.slug ? toSlug(entry.slug) : toSlug(entry.name),
    name: normalizeWhitespace(entry.name),
    type: entry.type ? normalizePokemonType(entry.type) : null,
    category: entry.category ? normalizeLabel(entry.category) : null,
    status: normalizeMoveStatus(entry.status),
    notes: entry.notes ? normalizeWhitespace(entry.notes) : null,
  };
}

export function normalizeEncounterEntry(entry: EncounterEntry): EncounterEntry {
  const minLevel = Math.min(entry.minLevel, entry.maxLevel);
  const maxLevel = Math.max(entry.minLevel, entry.maxLevel);

  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    locationId: normalizeWhitespace(entry.locationId),
    pokemonId: normalizeWhitespace(entry.pokemonId),
    method: normalizeEncounterMethod(entry.method),
    minLevel,
    maxLevel,
  };
}

export function normalizeItemLocationEntry(entry: ItemLocationEntry): ItemLocationEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    itemId: normalizeWhitespace(entry.itemId),
    locationId: normalizeWhitespace(entry.locationId),
    notes: normalizeWhitespace(entry.notes),
  };
}
