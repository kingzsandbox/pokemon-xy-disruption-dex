import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import {
  normalizeEncounterEntry,
  normalizeItemEntry,
  normalizeItemLocationEntry,
  normalizeLocationEntry,
  normalizePokemonEntry,
} from "../src/lib/normalize";
import type {
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  LocationEntry,
  PokemonEntry,
} from "../src/lib/types";
import { validateCoreData } from "../src/lib/validate";

type RawRecord = Record<string, unknown>;

type ImportBundle = {
  pokemon: PokemonEntry[];
  locations: LocationEntry[];
  items: ItemEntry[];
  encounters: EncounterEntry[];
  itemLocations: ItemLocationEntry[];
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
  const encounters = readArray(
    await readJsonFile(resolveInputFile(inputDir, "encounters.json")),
    "encounters",
  ).map(mapEncounterRecord);
  const itemLocations = readArray(
    await readJsonFile(resolveInputFile(inputDir, "item-locations.json")),
    "itemLocations",
  ).map(mapItemLocationRecord);

  validateCoreData({
    pokemon,
    locations,
    items,
    encounters,
    itemLocations,
  });

  return {
    pokemon,
    locations,
    items,
    encounters,
    itemLocations,
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
  await writeJson(outputDir, "encounters.json", bundle.encounters);
  await writeJson(outputDir, "item-locations.json", bundle.itemLocations);

  console.log(`Imported core data from ${inputDir}`);
  console.log(`Wrote normalized output to ${outputDir}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Core import failed: ${message}`);
  process.exitCode = 1;
});
