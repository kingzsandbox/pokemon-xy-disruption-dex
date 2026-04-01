import type {
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  LearnsetEntry,
  LevelCapEntry,
  LocationEntry,
  MachineEntry,
  MoveEntry,
  MoveCompatibilityEntry,
  NamedEntry,
  PokemonEntry,
  PickupEntry,
  TrainerEntry,
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
  machines: MachineEntry[];
  moveCompatibility: MoveCompatibilityEntry[];
  learnsets: LearnsetEntry[];
  encounters: EncounterEntry[];
  itemLocations: ItemLocationEntry[];
  trainers: TrainerEntry[];
  levelCaps: LevelCapEntry[];
  pickupEntries: PickupEntry[];
}): void {
  const errors = [
    ...validateNamedEntries(input.pokemon, "pokemon"),
    ...validateNamedEntries(input.locations, "locations"),
    ...validateNamedEntries(input.items, "items"),
    ...validateNamedEntries(input.moves, "moves"),
    ...validateNamedEntries(input.machines, "machines"),
    ...validateNamedEntries(input.trainers, "trainers"),
    ...validateNamedEntries(input.levelCaps, "levelCaps"),
    ...validateNamedEntries(input.pickupEntries, "pickupEntries"),
  ];

  const pokemonIds = new Set(input.pokemon.map((entry) => entry.id));
  const locationIds = new Set(input.locations.map((entry) => entry.id));
  const itemIds = new Set(input.items.map((entry) => entry.id));
  const moveIds = new Set(input.moves.map((entry) => entry.id));
  const machineIds = new Set(input.machines.map((entry) => entry.id));
  const seenEncounterIds = new Set<string>();
  const seenItemLocationIds = new Set<string>();
  const seenMoveCompatibilityIds = new Set<string>();
  const seenLearnsetIds = new Set<string>();

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

  input.machines.forEach((entry, index) => {
    assertNonEmpty(entry.code, `machines[${index}].code`, errors);

    if (!["tm", "hm", "mt"].includes(entry.kind)) {
      errors.push(`machines[${index}].kind must be tm, hm, or mt.`);
    }

    if (entry.moveId && !moveIds.has(entry.moveId)) {
      errors.push(`machines[${index}] references missing moveId ${quote(entry.moveId)}.`);
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

  input.moveCompatibility.forEach((entry, index) => {
    assertNonEmpty(entry.id, `moveCompatibility[${index}].id`, errors);
    assertNonEmpty(entry.pokemonId, `moveCompatibility[${index}].pokemonId`, errors);
    assertNonEmpty(entry.machineId, `moveCompatibility[${index}].machineId`, errors);

    if (seenMoveCompatibilityIds.has(entry.id)) {
      errors.push(`moveCompatibility contains duplicate id ${quote(entry.id)}.`);
    }

    seenMoveCompatibilityIds.add(entry.id);

    if (!pokemonIds.has(entry.pokemonId)) {
      errors.push(
        `moveCompatibility[${index}] references missing pokemonId ${quote(entry.pokemonId)}.`,
      );
    }

    if (!machineIds.has(entry.machineId)) {
      errors.push(
        `moveCompatibility[${index}] references missing machineId ${quote(entry.machineId)}.`,
      );
    }

    if (entry.moveId && !moveIds.has(entry.moveId)) {
      errors.push(`moveCompatibility[${index}] references missing moveId ${quote(entry.moveId)}.`);
    }
  });

  input.learnsets.forEach((entry, index) => {
    assertNonEmpty(entry.id, `learnsets[${index}].id`, errors);
    assertNonEmpty(entry.pokemonId, `learnsets[${index}].pokemonId`, errors);
    assertNonEmpty(entry.moveName, `learnsets[${index}].moveName`, errors);

    if (seenLearnsetIds.has(entry.id)) {
      errors.push(`learnsets contains duplicate id ${quote(entry.id)}.`);
    }

    seenLearnsetIds.add(entry.id);

    if (!pokemonIds.has(entry.pokemonId)) {
      errors.push(`learnsets[${index}] references missing pokemonId ${quote(entry.pokemonId)}.`);
    }

    if (entry.moveId && !moveIds.has(entry.moveId)) {
      errors.push(`learnsets[${index}] references missing moveId ${quote(entry.moveId)}.`);
    }

    if (entry.method !== "level-up") {
      errors.push(`learnsets[${index}].method must currently be level-up.`);
    }

    if (entry.level !== null && entry.level < 0) {
      errors.push(`learnsets[${index}].level cannot be negative.`);
    }
  });

  input.trainers.forEach((entry, index) => {
    assertNonEmpty(entry.location, `trainers[${index}].location`, errors);

    if (!["xy-trainers", "restaurants", "battle-chateau"].includes(entry.source)) {
      errors.push(`trainers[${index}].source must be xy-trainers, restaurants, or battle-chateau.`);
    }

    if (!["singles", "doubles"].includes(entry.ruleset)) {
      errors.push(`trainers[${index}].ruleset must be singles or doubles.`);
    }

    if (entry.format !== null && !["single", "double"].includes(entry.format)) {
      errors.push(`trainers[${index}].format must be single, double, or null.`);
    }

    if (entry.team.length === 0) {
      errors.push(`trainers[${index}].team must contain at least one Pokemon.`);
    }

    entry.team.forEach((pokemon, teamIndex) => {
      assertNonEmpty(
        pokemon.pokemonName,
        `trainers[${index}].team[${teamIndex}].pokemonName`,
        errors,
      );

      if (pokemon.pokemonId && !pokemonIds.has(pokemon.pokemonId)) {
        errors.push(
          `trainers[${index}].team[${teamIndex}] references missing pokemonId ${quote(pokemon.pokemonId)}.`,
        );
      }

      if (pokemon.level !== null && pokemon.level <= 0) {
        errors.push(`trainers[${index}].team[${teamIndex}].level must be greater than 0.`);
      }
    });
  });

  input.levelCaps.forEach((entry, index) => {
    assertNonEmpty(entry.trainer, `levelCaps[${index}].trainer`, errors);
    assertNonEmpty(entry.location, `levelCaps[${index}].location`, errors);
    assertNonEmpty(entry.pokemonCount, `levelCaps[${index}].pokemonCount`, errors);

    if (entry.level <= 0) {
      errors.push(`levelCaps[${index}].level must be greater than 0.`);
    }
  });

  input.pickupEntries.forEach((entry, index) => {
    assertNonEmpty(entry.rateLabel, `pickupEntries[${index}].rateLabel`, errors);
    assertNonEmpty(entry.itemName, `pickupEntries[${index}].itemName`, errors);

    if (!["common", "rare"].includes(entry.table)) {
      errors.push(`pickupEntries[${index}].table must be common or rare.`);
    }

    if (entry.itemId && !itemIds.has(entry.itemId)) {
      errors.push(`pickupEntries[${index}] references missing itemId ${quote(entry.itemId)}.`);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Core data validation failed:\n- ${errors.join("\n- ")}`);
  }
}
