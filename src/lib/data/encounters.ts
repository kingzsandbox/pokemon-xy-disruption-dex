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
  heldItemName: string;
  heldItemSlug: string | null;
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

export function getEncounterItemRowsByPokemonId(pokemonId: string): PokemonEncounterItemRow[] {
  return (encountersByPokemon.get(pokemonId) ?? [])
    .filter((entry) => entry.heldItem)
    .map((entry) => {
      const location = getLocationById(entry.locationId);
      if (!location || !entry.heldItem) {
        return null;
      }

      return {
        encounterId: entry.id,
        locationName: location.name,
        locationSlug: location.slug,
        method: entry.method,
        encounterRate: entry.rate,
        levelRange: formatLevelRange(entry),
        heldItemName: entry.heldItem,
        heldItemSlug: getHeldItemSlug(entry.heldItem),
        sourceReference: entry.sourceReference ?? null,
      };
    })
    .filter((entry): entry is PokemonEncounterItemRow => entry !== null)
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
