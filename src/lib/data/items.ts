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

export function getItemDisplayDescription(item: ItemEntry): string {
  if (item.description.startsWith("Imported from ")) {
    return "No in-game description has been imported yet.";
  }

  return item.description;
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

export type LocationItemSectionKey = "tm" | "shop" | "pickup" | "special";

export type LocationItemSection = {
  key: LocationItemSectionKey;
  title: string;
  items: LocatedItem[];
};

function getLocationItemSectionKey(entry: LocatedItem): LocationItemSectionKey {
  const notes = entry.notes.toLowerCase();

  if (entry.item.slug === "box-link") {
    return "special";
  }

  if (entry.item.category === "TM" || notes.startsWith("shop - tms")) {
    return "tm";
  }

  if (notes.startsWith("shop -")) {
    return "shop";
  }

  if (notes.startsWith("trash can") || notes.includes("hidden") || notes.startsWith("gift")) {
    return "pickup";
  }

  return "special";
}

export function getItemSectionsByLocation(locationId: string): LocationItemSection[] {
  const grouped = new Map<LocationItemSectionKey, LocatedItem[]>();

  for (const entry of getItemsByLocation(locationId)) {
    const key = getLocationItemSectionKey(entry);
    const itemsForKey = grouped.get(key) ?? [];
    itemsForKey.push(entry);
    grouped.set(key, itemsForKey);
  }

  const orderedSections: Array<{ key: LocationItemSectionKey; title: string }> = [
    { key: "tm", title: "TMs" },
    { key: "shop", title: "Shop Inventory" },
    { key: "pickup", title: "Pickups and Finds" },
    { key: "special", title: "Special Items" },
  ];

  return orderedSections
    .map(({ key, title }) => ({
      key,
      title,
      items: grouped.get(key) ?? [],
    }))
    .filter((section) => section.items.length > 0);
}
