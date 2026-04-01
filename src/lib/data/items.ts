import { coreItemLocations, coreItems } from "@/lib/data/core";
import type { ItemEntry, ItemLocationEntry, LocatedItem } from "@/lib/types";

const items = coreItems as ItemEntry[];
const itemLocations = coreItemLocations as ItemLocationEntry[];
const itemsById = new Map(items.map((entry) => [entry.id, entry]));
const itemsBySlug = new Map(items.map((entry) => [entry.slug, entry]));

export function getItems(): ItemEntry[] {
  return items;
}

export function getItemById(id: string): ItemEntry | undefined {
  return itemsById.get(id);
}

export function getItemBySlug(slug: string): ItemEntry | undefined {
  return itemsBySlug.get(slug);
}

export function getItemLocations(): ItemLocationEntry[] {
  return itemLocations;
}

export function getItemsByLocation(locationId: string): LocatedItem[] {
  return itemLocations
    .filter((entry) => entry.locationId === locationId)
    .map((entry) => {
      const item = getItemById(entry.itemId);

      if (!item) {
        return undefined;
      }

      return {
        itemLocationId: entry.id,
        locationId: entry.locationId,
        notes: entry.notes,
        item,
      };
    })
    .filter((entry): entry is LocatedItem => entry !== undefined);
}
