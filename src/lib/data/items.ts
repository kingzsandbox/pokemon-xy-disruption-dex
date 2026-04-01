import itemLocationsData from "../../../public/data/item-locations.json";
import itemsData from "../../../public/data/items.json";
import type { ItemEntry, ItemLocationEntry, LocatedItem } from "@/lib/types";

const items = itemsData as ItemEntry[];
const itemLocations = itemLocationsData as ItemLocationEntry[];

export function getItems(): ItemEntry[] {
  return items;
}

export function getItemBySlug(slug: string): ItemEntry | undefined {
  return items.find((item) => item.slug === slug);
}

export function getItemsByLocation(locationId: string): LocatedItem[] {
  return itemLocations
    .filter((entry) => entry.locationId === locationId)
    .map((entry) => {
      const item = items.find((candidate) => candidate.id === entry.itemId);

      if (!item) {
        return undefined;
      }

      return {
        locationId: entry.locationId,
        notes: entry.notes,
        item,
      };
    })
    .filter((entry): entry is LocatedItem => entry !== undefined);
}
