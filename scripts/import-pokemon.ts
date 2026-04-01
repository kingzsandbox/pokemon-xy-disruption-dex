import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { normalizePokemonEntry } from "../src/lib/normalize";
import type { PokemonEntry } from "../src/lib/types";
import { validateCoreData } from "../src/lib/validate";

type RawRecord = Record<string, unknown>;

const projectRoot = path.resolve(__dirname, "..", "..");
const defaultInputFile = path.join(projectRoot, "raw", "core", "pokemon.json");
const defaultOutputFile = path.join(projectRoot, "public", "data", "pokemon.json");

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

async function readJsonFile(filePath: string): Promise<unknown> {
  const contents = await readFile(filePath, "utf8");
  return JSON.parse(contents) as unknown;
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
      record.changeSummary ?? record.change_summary ?? "Imported Pokemon entry pending review.",
      `pokemon[${index}].changeSummary`,
    ),
  });
}

async function loadExistingCoreData(): Promise<{
  locations: unknown[];
  items: unknown[];
  encounters: unknown[];
  itemLocations: unknown[];
}> {
  const [locations, items, encounters, itemLocations] = await Promise.all([
    readJsonFile(path.join(projectRoot, "public", "data", "locations.json")),
    readJsonFile(path.join(projectRoot, "public", "data", "items.json")),
    readJsonFile(path.join(projectRoot, "public", "data", "encounters.json")),
    readJsonFile(path.join(projectRoot, "public", "data", "item-locations.json")),
  ]);

  return {
    locations: Array.isArray(locations) ? locations : [],
    items: Array.isArray(items) ? items : [],
    encounters: Array.isArray(encounters) ? encounters : [],
    itemLocations: Array.isArray(itemLocations) ? itemLocations : [],
  };
}

async function main(): Promise<void> {
  const inputFile = path.resolve(projectRoot, getFlagValue("--input-file") ?? defaultInputFile);
  const outputFile = path.resolve(projectRoot, getFlagValue("--output-file") ?? defaultOutputFile);
  const pokemonSource = readArray(await readJsonFile(inputFile), "pokemon");
  const pokemon = pokemonSource.map(mapPokemonRecord);
  const existingCore = await loadExistingCoreData();

  validateCoreData({
    pokemon,
    locations: existingCore.locations as never[],
    items: existingCore.items as never[],
    encounters: existingCore.encounters as never[],
    itemLocations: existingCore.itemLocations as never[],
  });

  await mkdir(path.dirname(outputFile), { recursive: true });
  await writeFile(outputFile, `${JSON.stringify(pokemon, null, 2)}\n`, "utf8");

  console.log(`Imported pokemon data from ${inputFile}`);
  console.log(`Wrote normalized pokemon output to ${outputFile}`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`Pokemon import failed: ${message}`);
  process.exitCode = 1;
});
