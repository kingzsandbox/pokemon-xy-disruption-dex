import { coreLevelCaps, corePickupEntries } from "./core";
import { getItemById } from "./items";
import type { LevelCapEntry, PickupEntry } from "../types";

const levelCaps = coreLevelCaps as LevelCapEntry[];
const pickupEntries = corePickupEntries as PickupEntry[];

export function getLevelCaps(): LevelCapEntry[] {
  return levelCaps;
}

export function getPickupEntries(): PickupEntry[] {
  return pickupEntries;
}

export function getPickupEntriesByTable(table: PickupEntry["table"]): PickupEntry[] {
  return pickupEntries.filter((entry) => entry.table === table);
}

export function getResolvedPickupEntriesByTable(table: PickupEntry["table"]) {
  return getPickupEntriesByTable(table).map((entry) => ({
    entry,
    item: entry.itemId ? getItemById(entry.itemId) : undefined,
  }));
}
