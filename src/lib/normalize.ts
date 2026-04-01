import type {
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  LocationEntry,
  LevelCapEntry,
  MachineEntry,
  MoveEntry,
  MoveCompatibilityEntry,
  LearnsetEntry,
  PokemonEntry,
  PickupEntry,
  TrainerEntry,
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

export function normalizeMachineEntry(entry: MachineEntry): MachineEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    slug: entry.slug ? toSlug(entry.slug) : toSlug(entry.name),
    name: normalizeWhitespace(entry.name),
    code: normalizeWhitespace(entry.code).toUpperCase(),
    kind: normalizeWhitespace(entry.kind).toLowerCase() as MachineEntry["kind"],
    moveId: entry.moveId ? normalizeWhitespace(entry.moveId) : null,
    location: entry.location ? normalizeWhitespace(entry.location) : null,
  };
}

export function normalizeMoveCompatibilityEntry(
  entry: MoveCompatibilityEntry,
): MoveCompatibilityEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    pokemonId: normalizeWhitespace(entry.pokemonId),
    machineId: normalizeWhitespace(entry.machineId),
    moveId: entry.moveId ? normalizeWhitespace(entry.moveId) : null,
  };
}

export function normalizeLearnsetEntry(entry: LearnsetEntry): LearnsetEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    pokemonId: normalizeWhitespace(entry.pokemonId),
    moveId: entry.moveId ? normalizeWhitespace(entry.moveId) : null,
    moveName: normalizeWhitespace(entry.moveName),
    method: normalizeWhitespace(entry.method).toLowerCase() as LearnsetEntry["method"],
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

export function normalizeTrainerEntry(entry: TrainerEntry): TrainerEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    slug: entry.slug ? toSlug(entry.slug) : toSlug(entry.name),
    name: normalizeWhitespace(entry.name),
    location: normalizeWhitespace(entry.location),
    section: entry.section ? normalizeWhitespace(entry.section) : null,
    source: normalizeWhitespace(entry.source).toLowerCase() as TrainerEntry["source"],
    ruleset: normalizeWhitespace(entry.ruleset).toLowerCase() as TrainerEntry["ruleset"],
    format: entry.format
      ? (normalizeWhitespace(entry.format).toLowerCase() as TrainerEntry["format"])
      : null,
    trainerClass: entry.trainerClass ? normalizeWhitespace(entry.trainerClass) : null,
    team: entry.team.map((pokemon) => ({
      ...pokemon,
      pokemonId: pokemon.pokemonId ? normalizeWhitespace(pokemon.pokemonId) : null,
      pokemonName: normalizeWhitespace(pokemon.pokemonName),
      gender: pokemon.gender ? normalizeWhitespace(pokemon.gender) : null,
      ability: pokemon.ability ? normalizeAbilityName(pokemon.ability) : null,
      heldItem: pokemon.heldItem ? normalizeWhitespace(pokemon.heldItem) : null,
      moves: pokemon.moves.map(normalizeWhitespace).filter(Boolean),
    })),
  };
}

export function normalizeLevelCapEntry(entry: LevelCapEntry): LevelCapEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    slug: entry.slug ? toSlug(entry.slug) : toSlug(entry.name),
    name: normalizeWhitespace(entry.name),
    trainer: normalizeWhitespace(entry.trainer),
    location: normalizeWhitespace(entry.location),
    pokemonCount: normalizeWhitespace(entry.pokemonCount),
  };
}

export function normalizePickupEntry(entry: PickupEntry): PickupEntry {
  return {
    ...entry,
    id: normalizeWhitespace(entry.id),
    slug: entry.slug ? toSlug(entry.slug) : toSlug(entry.name),
    name: normalizeWhitespace(entry.name),
    table: normalizeWhitespace(entry.table).toLowerCase() as PickupEntry["table"],
    rateLabel: normalizeWhitespace(entry.rateLabel),
    itemId: entry.itemId ? normalizeWhitespace(entry.itemId) : null,
    itemName: normalizeWhitespace(entry.itemName),
  };
}
