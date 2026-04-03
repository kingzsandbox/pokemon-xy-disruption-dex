import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeEncounterEntry,
  normalizeItemEntry,
  normalizeItemLocationEntry,
  normalizeLearnsetEntry,
  normalizeLevelCapEntry,
  normalizeLocationEntry,
  normalizeMachineEntry,
  normalizeMoveEntry,
  normalizeMoveCompatibilityEntry,
  normalizePokemonEntry,
  normalizePickupEntry,
  normalizeTrainerEntry,
} from "../src/lib/normalize";
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
  PokemonEntry,
  PickupEntry,
  TrainerEntry,
} from "../src/lib/types";
import { validateCoreData } from "../src/lib/validate";

type RawRecord = Record<string, unknown>;

type ImportBundle = {
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
};

const projectRoot = path.resolve(__dirname, "..", "..");
const defaultInputDir = path.join(projectRoot, "raw", "core");
const defaultOutputDir = path.join(projectRoot, "public", "data");

function getFlagValue(flagName: string): string | undefined {
  const flagIndex = process.argv.indexOf(flagName);

  if (flagIndex === -1) {
    return undefined;
  }

  return process.argv[flagIndex + 1];
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== "string" || !value.trim()) {
    throw new Error(`Expected non-empty string for ${field}.`);
  }

  return value;
}

function requireNumber(value: unknown, field: string): number {
  if (typeof value !== "number" || Number.isNaN(value)) {
    throw new Error(`Expected number for ${field}.`);
  }

  return value;
}

function readStringArray(value: unknown, field: string): string[] {
  if (Array.isArray(value)) {
    const strings = value.filter((entry): entry is string => typeof entry === "string");

    if (strings.length !== value.length || strings.length === 0) {
      throw new Error(`Expected ${field} to be a non-empty string array.`);
    }

    return strings;
  }

  if (typeof value === "string" && value.trim()) {
    return value
      .split(/[,/|]/)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  throw new Error(`Expected ${field} to be a string array or delimited string.`);
}

function readObject(value: unknown, field: string): RawRecord {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`Expected ${field} to be an object.`);
  }

  return value as RawRecord;
}

function readArray(value: unknown, field: string): RawRecord[] {
  if (!Array.isArray(value)) {
    throw new Error(`Expected ${field} to be an array.`);
  }

  return value.map((entry, index) => readObject(entry, `${field}[${index}]`));
}

function readJsonFile(filePath: string): Promise<unknown> {
  return readFile(filePath, "utf8").then((contents) => JSON.parse(contents) as unknown);
}

function resolveInputFile(inputDir: string, fileName: string): string {
  return path.join(inputDir, fileName);
}

function mapPokemonRecord(record: RawRecord, index: number): PokemonEntry {
  const baseStatsSource = readObject(record.baseStats ?? record.stats, `pokemon[${index}].baseStats`);

  return normalizePokemonEntry({
    id: requireString(record.id, `pokemon[${index}].id`),
    slug: String(record.slug ?? record.name ?? ""),
    name: requireString(record.name, `pokemon[${index}].name`),
    dexNumber: requireNumber(record.dexNumber ?? record.dex_number, `pokemon[${index}].dexNumber`),
    types: readStringArray(record.types ?? record.type, `pokemon[${index}].types`),
    baseStats: {
      hp: requireNumber(baseStatsSource.hp, `pokemon[${index}].baseStats.hp`),
      attack: requireNumber(baseStatsSource.attack, `pokemon[${index}].baseStats.attack`),
      defense: requireNumber(baseStatsSource.defense, `pokemon[${index}].baseStats.defense`),
      specialAttack: requireNumber(
        baseStatsSource.specialAttack ?? baseStatsSource.special_attack,
        `pokemon[${index}].baseStats.specialAttack`,
      ),
      specialDefense: requireNumber(
        baseStatsSource.specialDefense ?? baseStatsSource.special_defense,
        `pokemon[${index}].baseStats.specialDefense`,
      ),
      speed: requireNumber(baseStatsSource.speed, `pokemon[${index}].baseStats.speed`),
    },
    abilities: readStringArray(record.abilities ?? record.ability, `pokemon[${index}].abilities`),
    changeSummary: requireString(
      record.changeSummary ?? record.change_summary ?? "Imported entry pending change summary review.",
      `pokemon[${index}].changeSummary`,
    ),
  });
}

function mapLocationRecord(record: RawRecord, index: number): LocationEntry {
  return normalizeLocationEntry({
    id: requireString(record.id, `locations[${index}].id`),
    slug: String(record.slug ?? record.name ?? ""),
    name: requireString(record.name, `locations[${index}].name`),
    region: requireString(record.region, `locations[${index}].region`),
    description: requireString(record.description, `locations[${index}].description`),
  });
}

function mapItemRecord(record: RawRecord, index: number): ItemEntry {
  return normalizeItemEntry({
    id: requireString(record.id, `items[${index}].id`),
    slug: String(record.slug ?? record.name ?? ""),
    name: requireString(record.name, `items[${index}].name`),
    category: requireString(record.category, `items[${index}].category`),
    description: requireString(record.description, `items[${index}].description`),
  });
}

function mapEncounterRecord(record: RawRecord, index: number): EncounterEntry {
  const level = record.level;
  const minLevel = record.minLevel ?? record.min_level ?? level;
  const maxLevel = record.maxLevel ?? record.max_level ?? level;

  return normalizeEncounterEntry({
    id: requireString(record.id, `encounters[${index}].id`),
    locationId: requireString(record.locationId ?? record.location_id, `encounters[${index}].locationId`),
    pokemonId: requireString(record.pokemonId ?? record.pokemon_id, `encounters[${index}].pokemonId`),
    method: requireString(record.method, `encounters[${index}].method`),
    minLevel: requireNumber(minLevel, `encounters[${index}].minLevel`),
    maxLevel: requireNumber(maxLevel, `encounters[${index}].maxLevel`),
    rate: requireNumber(record.rate, `encounters[${index}].rate`),
    rawSpecies: typeof record.rawSpecies === "string" ? record.rawSpecies : undefined,
    heldItem: typeof record.heldItem === "string" ? record.heldItem : null,
    heldItems: Array.isArray(record.heldItems)
      ? record.heldItems.map((entry, heldIndex) => {
          const heldItem = readObject(entry, `encounters[${index}].heldItems[${heldIndex}]`);
          return {
            itemName: requireString(heldItem.itemName, `encounters[${index}].heldItems[${heldIndex}].itemName`),
            chanceLabel: requireString(
              heldItem.chanceLabel,
              `encounters[${index}].heldItems[${heldIndex}].chanceLabel`,
            ),
            chanceValue:
              typeof heldItem.chanceValue === "number" && !Number.isNaN(heldItem.chanceValue)
                ? heldItem.chanceValue
                : null,
          };
        })
      : undefined,
    sourceReference: typeof record.sourceReference === "string" ? record.sourceReference : null,
    sourceMethodFill: typeof record.sourceMethodFill === "string" ? record.sourceMethodFill : null,
  });
}

function mapMoveRecord(record: RawRecord, index: number): MoveEntry {
  const valueOrNull = (value: unknown): string | null =>
    typeof value === "string" && value.trim() ? value : null;
  const numberOrNull = (value: unknown): number | null =>
    typeof value === "number" && !Number.isNaN(value) ? value : null;

  return normalizeMoveEntry({
    id: requireString(record.id, `moves[${index}].id`),
    slug: String(record.slug ?? record.name ?? ""),
    name: requireString(record.name, `moves[${index}].name`),
    type: valueOrNull(record.type),
    category: valueOrNull(record.category),
    power: numberOrNull(record.power),
    accuracy: numberOrNull(record.accuracy),
    pp: numberOrNull(record.pp),
    status: requireString(record.status, `moves[${index}].status`) as MoveEntry["status"],
    notes: valueOrNull(record.notes),
  });
}

function mapItemLocationRecord(record: RawRecord, index: number): ItemLocationEntry {
  return normalizeItemLocationEntry({
    id: requireString(record.id, `itemLocations[${index}].id`),
    itemId: requireString(record.itemId ?? record.item_id, `itemLocations[${index}].itemId`),
    locationId: requireString(
      record.locationId ?? record.location_id,
      `itemLocations[${index}].locationId`,
    ),
    notes: String(record.notes ?? ""),
  });
}

function mapMachineRecord(record: RawRecord, index: number): MachineEntry {
  const valueOrNull = (value: unknown): string | null =>
    typeof value === "string" && value.trim() ? value : null;

  return normalizeMachineEntry({
    id: requireString(record.id, `machines[${index}].id`),
    slug: String(record.slug ?? record.name ?? record.code ?? ""),
    name: requireString(record.name, `machines[${index}].name`),
    code: requireString(record.code, `machines[${index}].code`),
    kind: requireString(record.kind, `machines[${index}].kind`) as MachineEntry["kind"],
    moveId: valueOrNull(record.moveId ?? record.move_id),
    location: valueOrNull(record.location),
  });
}

function mapMoveCompatibilityRecord(record: RawRecord, index: number): MoveCompatibilityEntry {
  const valueOrNull = (value: unknown): string | null =>
    typeof value === "string" && value.trim() ? value : null;

  return normalizeMoveCompatibilityEntry({
    id: requireString(record.id, `moveCompatibility[${index}].id`),
    pokemonId: requireString(
      record.pokemonId ?? record.pokemon_id,
      `moveCompatibility[${index}].pokemonId`,
    ),
    machineId: requireString(
      record.machineId ?? record.machine_id,
      `moveCompatibility[${index}].machineId`,
    ),
    moveId: valueOrNull(record.moveId ?? record.move_id),
  });
}

function mapLearnsetRecord(record: RawRecord, index: number): LearnsetEntry {
  const valueOrNull = (value: unknown): string | null =>
    typeof value === "string" && value.trim() ? value : null;
  const numberOrNull = (value: unknown): number | null =>
    typeof value === "number" && !Number.isNaN(value) ? value : null;

  return normalizeLearnsetEntry({
    id: requireString(record.id, `learnsets[${index}].id`),
    pokemonId: requireString(record.pokemonId ?? record.pokemon_id, `learnsets[${index}].pokemonId`),
    moveId: valueOrNull(record.moveId ?? record.move_id),
    moveName: requireString(record.moveName ?? record.move_name, `learnsets[${index}].moveName`),
    method: requireString(record.method, `learnsets[${index}].method`) as LearnsetEntry["method"],
    level: numberOrNull(record.level),
  });
}

function mapTrainerRecord(record: RawRecord, index: number): TrainerEntry {
  const valueOrNull = (value: unknown): string | null =>
    typeof value === "string" && value.trim() ? value : null;
  const numberOrNull = (value: unknown): number | null =>
    typeof value === "number" && !Number.isNaN(value) ? value : null;
  const team = readArray(record.team, `trainers[${index}].team`).map((entry, teamIndex) => ({
    slot: requireNumber(entry.slot ?? teamIndex + 1, `trainers[${index}].team[${teamIndex}].slot`),
    pokemonId: valueOrNull(entry.pokemonId ?? entry.pokemon_id),
    pokemonName: requireString(
      entry.pokemonName ?? entry.pokemon_name,
      `trainers[${index}].team[${teamIndex}].pokemonName`,
    ),
    level: numberOrNull(entry.level),
    gender: valueOrNull(entry.gender),
    ability: valueOrNull(entry.ability),
    heldItem: valueOrNull(entry.heldItem ?? entry.held_item),
    moves: Array.isArray(entry.moves)
      ? entry.moves.filter((move): move is string => typeof move === "string" && Boolean(move.trim()))
      : [],
  }));

  return normalizeTrainerEntry({
    id: requireString(record.id, `trainers[${index}].id`),
    slug: String(record.slug ?? record.name ?? ""),
    name: requireString(record.name, `trainers[${index}].name`),
    indexNumber: numberOrNull(record.indexNumber ?? record.index_number),
    location: requireString(record.location, `trainers[${index}].location`),
    section: valueOrNull(record.section),
    source: requireString(record.source, `trainers[${index}].source`) as TrainerEntry["source"],
    ruleset: requireString(record.ruleset, `trainers[${index}].ruleset`) as TrainerEntry["ruleset"],
    format: (valueOrNull(record.format) as TrainerEntry["format"]) ?? null,
    trainerClass: valueOrNull(record.trainerClass ?? record.trainer_class),
    team,
  });
}

function mapLevelCapRecord(record: RawRecord, index: number): LevelCapEntry {
  return normalizeLevelCapEntry({
    id: requireString(record.id, `levelCaps[${index}].id`),
    slug: String(record.slug ?? record.name ?? ""),
    name: requireString(record.name, `levelCaps[${index}].name`),
    trainer: requireString(record.trainer, `levelCaps[${index}].trainer`),
    location: requireString(record.location, `levelCaps[${index}].location`),
    level: requireNumber(record.level, `levelCaps[${index}].level`),
    pokemonCount: requireString(
      record.pokemonCount ?? record.pokemon_count,
      `levelCaps[${index}].pokemonCount`,
    ),
  });
}

function mapPickupEntryRecord(record: RawRecord, index: number): PickupEntry {
  const valueOrNull = (value: unknown): string | null =>
    typeof value === "string" && value.trim() ? value : null;

  return normalizePickupEntry({
    id: requireString(record.id, `pickupEntries[${index}].id`),
    slug: String(record.slug ?? record.name ?? record.itemName ?? ""),
    name: requireString(record.name, `pickupEntries[${index}].name`),
    table: requireString(record.table, `pickupEntries[${index}].table`) as PickupEntry["table"],
    rateLabel: requireString(
      record.rateLabel ?? record.rate_label,
      `pickupEntries[${index}].rateLabel`,
    ),
    itemId: valueOrNull(record.itemId ?? record.item_id),
    itemName: requireString(
      record.itemName ?? record.item_name,
      `pickupEntries[${index}].itemName`,
    ),
  });
}

async function loadImportBundle(inputDir: string): Promise<ImportBundle> {
  const pokemon = readArray(
    await readJsonFile(resolveInputFile(inputDir, "pokemon.json")),
    "pokemon",
  ).map(mapPokemonRecord);
  const locations = readArray(
    await readJsonFile(resolveInputFile(inputDir, "locations.json")),
    "locations",
  ).map(mapLocationRecord);
  const items = readArray(
    await readJsonFile(resolveInputFile(inputDir, "items.json")),
    "items",
  ).map(mapItemRecord);
  const moves = readArray(
    await readJsonFile(resolveInputFile(inputDir, "moves.json")),
    "moves",
  ).map(mapMoveRecord);
  const machines = readArray(
    await readJsonFile(resolveInputFile(inputDir, "machines.json")),
    "machines",
  ).map(mapMachineRecord);
  const moveCompatibility = readArray(
    await readJsonFile(resolveInputFile(inputDir, "move-compatibility.json")),
    "moveCompatibility",
  ).map(mapMoveCompatibilityRecord);
  const learnsets = readArray(
    await readJsonFile(resolveInputFile(inputDir, "learnsets.json")),
    "learnsets",
  ).map(mapLearnsetRecord);
  const encounters = readArray(
    await readJsonFile(resolveInputFile(inputDir, "encounters.json")),
    "encounters",
  ).map(mapEncounterRecord);
  const itemLocations = readArray(
    await readJsonFile(resolveInputFile(inputDir, "item-locations.json")),
    "itemLocations",
  ).map(mapItemLocationRecord);
  const trainers = readArray(
    await readJsonFile(resolveInputFile(inputDir, "trainers.json")),
    "trainers",
  ).map(mapTrainerRecord);
  const levelCaps = readArray(
    await readJsonFile(resolveInputFile(inputDir, "level-caps.json")),
    "levelCaps",
  ).map(mapLevelCapRecord);
  const pickupEntries = readArray(
    await readJsonFile(resolveInputFile(inputDir, "pickup-entries.json")),
    "pickupEntries",
  ).map(mapPickupEntryRecord);

  validateCoreData({
    pokemon,
    locations,
    items,
    moves,
    machines,
    moveCompatibility,
    learnsets,
    encounters,
    itemLocations,
    trainers,
    levelCaps,
    pickupEntries,
  });

  return {
    pokemon,
    locations,
    items,
    moves,
    machines,
    moveCompatibility,
    learnsets,
    encounters,
    itemLocations,
    trainers,
    levelCaps,
    pickupEntries,
  };
}

async function writeJson(outputDir: string, fileName: string, data: unknown): Promise<void> {
  await mkdir(outputDir, { recursive: true });
  await writeFile(path.join(outputDir, fileName), `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

async function main(): Promise<void> {
  const inputDir = path.resolve(projectRoot, getFlagValue("--input-dir") ?? defaultInputDir);
  const outputDir = path.resolve(projectRoot, getFlagValue("--output-dir") ?? defaultOutputDir);
  const bundle = await loadImportBundle(inputDir);

  await writeJson(outputDir, "pokemon.json", bundle.pokemon);
  await writeJson(outputDir, "locations.json", bundle.locations);
  await writeJson(outputDir, "items.json", bundle.items);
  await writeJson(outputDir, "moves.json", bundle.moves);
  await writeJson(outputDir, "machines.json", bundle.machines);
  await writeJson(outputDir, "move-compatibility.json", bundle.moveCompatibility);
  await writeJson(outputDir, "learnsets.json", bundle.learnsets);
  await writeJson(outputDir, "encounters.json", bundle.encounters);
  await writeJson(outputDir, "item-locations.json", bundle.itemLocations);
  await writeJson(outputDir, "trainers.json", bundle.trainers);
  await writeJson(outputDir, "level-caps.json", bundle.levelCaps);
  await writeJson(outputDir, "pickup-entries.json", bundle.pickupEntries);

  console.log(`Imported core data from ${inputDir}`);
  console.log(`Wrote normalized output to ${outputDir}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Core import failed: ${message}`);
  process.exitCode = 1;
});
