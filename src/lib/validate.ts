import type {
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  LocationEntry,
  MoveEntry,
  NamedEntry,
  PokemonEntry,
} from "./types";

function quote(value: string): string {
  return `"${value}"`;
}

function assertNonEmpty(value: string, label: string, errors: string[]): void {
  if (!value.trim()) {
    errors.push(`${label} is required.`);
  }
}

function validateNamedEntries(entries: NamedEntry[], label: string): string[] {
  const errors: string[] = [];
  const seenIds = new Map<string, number>();
  const seenSlugs = new Map<string, number>();

  entries.forEach((entry, index) => {
    assertNonEmpty(entry.id, `${label}[${index}].id`, errors);
    assertNonEmpty(entry.slug, `${label}[${index}].slug`, errors);
    assertNonEmpty(entry.name, `${label}[${index}].name`, errors);

    seenIds.set(entry.id, (seenIds.get(entry.id) ?? 0) + 1);
    seenSlugs.set(entry.slug, (seenSlugs.get(entry.slug) ?? 0) + 1);
  });

  for (const [id, count] of seenIds) {
    if (count > 1) {
      errors.push(`${label} contains duplicate id ${quote(id)}.`);
    }
  }

  for (const [slug, count] of seenSlugs) {
    if (count > 1) {
      errors.push(`${label} contains duplicate slug ${quote(slug)}.`);
    }
  }

  return errors;
}

export function validateCoreData(input: {
  pokemon: PokemonEntry[];
  locations: LocationEntry[];
  items: ItemEntry[];
  moves: MoveEntry[];
  encounters: EncounterEntry[];
  itemLocations: ItemLocationEntry[];
}): void {
  const errors = [
    ...validateNamedEntries(input.pokemon, "pokemon"),
    ...validateNamedEntries(input.locations, "locations"),
    ...validateNamedEntries(input.items, "items"),
    ...validateNamedEntries(input.moves, "moves"),
  ];

  const pokemonIds = new Set(input.pokemon.map((entry) => entry.id));
  const locationIds = new Set(input.locations.map((entry) => entry.id));
  const itemIds = new Set(input.items.map((entry) => entry.id));
  const seenEncounterIds = new Set<string>();
  const seenItemLocationIds = new Set<string>();

  input.pokemon.forEach((entry, index) => {
    if (entry.types.length === 0) {
      errors.push(`pokemon[${index}].types must contain at least one type.`);
    }

    if (entry.abilities.length === 0) {
      errors.push(`pokemon[${index}].abilities must contain at least one ability.`);
    }

    assertNonEmpty(entry.changeSummary, `pokemon[${index}].changeSummary`, errors);
  });

  input.locations.forEach((entry, index) => {
    assertNonEmpty(entry.region, `locations[${index}].region`, errors);
    assertNonEmpty(entry.description, `locations[${index}].description`, errors);
  });

  input.items.forEach((entry, index) => {
    assertNonEmpty(entry.category, `items[${index}].category`, errors);
    assertNonEmpty(entry.description, `items[${index}].description`, errors);
  });

  input.moves.forEach((entry, index) => {
    if (!["usable", "reduced", "removed"].includes(entry.status)) {
      errors.push(`moves[${index}].status must be usable, reduced, or removed.`);
    }
  });

  input.encounters.forEach((entry, index) => {
    assertNonEmpty(entry.id, `encounters[${index}].id`, errors);
    assertNonEmpty(entry.locationId, `encounters[${index}].locationId`, errors);
    assertNonEmpty(entry.pokemonId, `encounters[${index}].pokemonId`, errors);
    assertNonEmpty(entry.method, `encounters[${index}].method`, errors);

    if (seenEncounterIds.has(entry.id)) {
      errors.push(`encounters contains duplicate id ${quote(entry.id)}.`);
    }

    seenEncounterIds.add(entry.id);

    if (!locationIds.has(entry.locationId)) {
      errors.push(
        `encounters[${index}] references missing locationId ${quote(entry.locationId)}.`,
      );
    }

    if (!pokemonIds.has(entry.pokemonId)) {
      errors.push(`encounters[${index}] references missing pokemonId ${quote(entry.pokemonId)}.`);
    }

    if (entry.minLevel <= 0 || entry.maxLevel <= 0) {
      errors.push(`encounters[${index}] levels must be greater than 0.`);
    }

    if (entry.minLevel > entry.maxLevel) {
      errors.push(`encounters[${index}] minLevel cannot exceed maxLevel.`);
    }
  });

  input.itemLocations.forEach((entry, index) => {
    assertNonEmpty(entry.id, `itemLocations[${index}].id`, errors);
    assertNonEmpty(entry.itemId, `itemLocations[${index}].itemId`, errors);
    assertNonEmpty(entry.locationId, `itemLocations[${index}].locationId`, errors);

    if (seenItemLocationIds.has(entry.id)) {
      errors.push(`itemLocations contains duplicate id ${quote(entry.id)}.`);
    }

    seenItemLocationIds.add(entry.id);

    if (!itemIds.has(entry.itemId)) {
      errors.push(`itemLocations[${index}] references missing itemId ${quote(entry.itemId)}.`);
    }

    if (!locationIds.has(entry.locationId)) {
      errors.push(
        `itemLocations[${index}] references missing locationId ${quote(entry.locationId)}.`,
      );
    }
  });

  if (errors.length > 0) {
    throw new Error(`Core data validation failed:\n- ${errors.join("\n- ")}`);
  }
}
