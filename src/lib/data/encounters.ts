import { coreEncounters } from "./core";
import { getItemBySlug, getItems } from "./items";
import { getLocationById } from "./locations";
import type { EncounterEntry, EncounterHeldItemDetail } from "../types";

const encounters = coreEncounters as EncounterEntry[];
const encountersByLocation = new Map<string, EncounterEntry[]>();
const encountersByPokemon = new Map<string, EncounterEntry[]>();
const itemNameToSlug = new Map(
  getItems().map((item) => [item.name.toLowerCase(), item.slug]),
);

for (const encounter of encounters) {
  const locationEntries = encountersByLocation.get(encounter.locationId) ?? [];
  locationEntries.push(encounter);
  encountersByLocation.set(encounter.locationId, locationEntries);

  const pokemonEntries = encountersByPokemon.get(encounter.pokemonId) ?? [];
  pokemonEntries.push(encounter);
  encountersByPokemon.set(encounter.pokemonId, pokemonEntries);
}

export function getEncounters(): EncounterEntry[] {
  return encounters;
}

export function getEncountersByLocation(locationId: string): EncounterEntry[] {
  return encountersByLocation.get(locationId) ?? [];
}

export type PokemonEncounterItemRow = {
  encounterId: string;
  locationName: string;
  locationSlug: string;
  method: string;
  encounterRate: number;
  levelRange: string;
  heldItemDisplay: string;
  heldItemEntries: {
    itemName: string;
    itemSlug: string | null;
    chanceLabel: string;
  }[];
  sourceReference: string | null;
};

export type PokemonEncounterRow = {
  encounterId: string;
  locationName: string;
  locationSlug: string;
  method: string;
  methodLabel: string;
  encounterRate: number;
  encounterRateLabel: string;
  levelRange: string;
  heldItemEntries: {
    itemName: string;
    itemSlug: string | null;
    chanceLabel: string;
  }[];
  sourceReference: string | null;
};

export type EncounterHeldItemDisplayDetail = EncounterHeldItemDetail & {
  itemSlug: string | null;
};

function getHeldItemSlug(heldItemName: string): string | null {
  const exact = itemNameToSlug.get(heldItemName.toLowerCase());
  if (exact) {
    return exact;
  }

  const guessedSlug = heldItemName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  return getItemBySlug(guessedSlug)?.slug ?? null;
}

export function getEncounterHeldItemSlug(heldItemName: string): string | null {
  return getHeldItemSlug(heldItemName);
}

export function getEncounterHeldItemDetails(encounter: EncounterEntry): EncounterHeldItemDisplayDetail[] {
  if (encounter.heldItems && encounter.heldItems.length > 0) {
    return encounter.heldItems.map((item) => ({
      ...item,
      itemSlug: getHeldItemSlug(item.itemName),
    }));
  }

  if (!encounter.heldItem) {
    return [];
  }

  return [
    {
      itemName: encounter.heldItem,
      chanceLabel: "",
      chanceValue: null,
      itemSlug: getHeldItemSlug(encounter.heldItem),
    },
  ];
}

function formatLevelRange(encounter: EncounterEntry): string {
  return encounter.minLevel === encounter.maxLevel
    ? `Lv. ${encounter.minLevel}`
    : `Lv. ${encounter.minLevel}-${encounter.maxLevel}`;
}

function formatEncounterRate(encounterRate: number): string {
  const percent = encounterRate <= 1 ? encounterRate * 100 : encounterRate;
  const rounded = Number.isInteger(percent) ? String(percent) : percent.toFixed(2).replace(/\.?0+$/, "");
  return `${rounded}%`;
}

function formatEncounterMethod(method: string): string {
  const normalized = method.trim();
  const methodLabels: Record<string, string> = {
    "Grass/Cave": "Grass / Cave encounter",
    "Old Rod": "Fishing (Old Rod)",
    "Good Rod": "Fishing (Good Rod)",
    "Super Rod": "Fishing (Super Rod)",
    Surf: "Surfing encounter",
    Horde: "Horde encounter",
    "Rock Smash": "Rock Smash encounter",
    "Yellow Flowers": "Yellow flower encounter",
    "Red Flowers": "Red flower encounter",
    "Purple Flowers": "Purple flower encounter",
    "Rough Terrain": "Rough terrain encounter",
    Ambush: "Ambush encounter",
  };

  return methodLabels[normalized] ?? normalized;
}

export function getEncounterRowsByPokemonId(pokemonId: string): PokemonEncounterRow[] {
  return (encountersByPokemon.get(pokemonId) ?? [])
    .map((entry) => {
      const location = getLocationById(entry.locationId);
      if (!location) {
        return null;
      }

      const heldItems = getEncounterHeldItemDetails(entry);

      return {
        encounterId: entry.id,
        locationName: location.name,
        locationSlug: location.slug,
        method: entry.method,
        methodLabel: formatEncounterMethod(entry.method),
        encounterRate: entry.rate,
        encounterRateLabel: formatEncounterRate(entry.rate),
        levelRange: formatLevelRange(entry),
        heldItemEntries: heldItems.map((item) => ({
          itemName: item.itemName,
          itemSlug: item.itemSlug,
          chanceLabel: item.chanceLabel,
        })),
        sourceReference: entry.sourceReference ?? null,
      };
    })
    .filter((entry): entry is PokemonEncounterRow => entry !== null)
    .sort((left, right) => {
      if (left.locationName !== right.locationName) {
        return left.locationName.localeCompare(right.locationName);
      }

      if (left.method !== right.method) {
        return left.method.localeCompare(right.method);
      }

      return right.encounterRate - left.encounterRate;
    });
}

export function getEncounterItemRowsByPokemonId(pokemonId: string): PokemonEncounterItemRow[] {
  return getEncounterRowsByPokemonId(pokemonId)
    .filter((entry) => entry.heldItemEntries.length > 0)
    .map((entry) => {
      return {
        encounterId: entry.encounterId,
        locationName: entry.locationName,
        locationSlug: entry.locationSlug,
        method: entry.method,
        encounterRate: entry.encounterRate,
        levelRange: entry.levelRange,
        heldItemDisplay: entry.heldItemEntries
          .map((item) => `${item.itemName}${item.chanceLabel ? ` (${item.chanceLabel})` : ""}`)
          .join(", "),
        heldItemEntries: entry.heldItemEntries,
        sourceReference: entry.sourceReference,
      };
    })
    .sort((left, right) => {
      if (left.locationName !== right.locationName) {
        return left.locationName.localeCompare(right.locationName);
      }

      if (left.method !== right.method) {
        return left.method.localeCompare(right.method);
      }

      return right.encounterRate - left.encounterRate;
    });
}
