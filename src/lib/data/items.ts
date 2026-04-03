import { coreItemLocations, coreItems } from "@/lib/data/core";
import { getLocationById } from "@/lib/data/locations";
import type {
  ItemEntry,
  ItemLocationEntry,
  ItemLocationReference,
  LocatedItem,
} from "@/lib/types";

const items = coreItems as ItemEntry[];
const itemLocations = coreItemLocations as ItemLocationEntry[];
const itemsById = new Map(items.map((entry) => [entry.id, entry]));
const itemsBySlug = new Map(items.map((entry) => [entry.slug, entry]));

export function isMachineItem(item: ItemEntry): boolean {
  return /^(tm|hm|mt)\d+/i.test(item.name) || /^(TM|HM|MT)$/i.test(item.category);
}

export function getItems(): ItemEntry[] {
  return items;
}

export function getBrowseItems(): ItemEntry[] {
  return items.filter((item) => !isMachineItem(item));
}

export function getItemById(id: string): ItemEntry | undefined {
  return itemsById.get(id);
}

export function getItemBySlug(slug: string): ItemEntry | undefined {
  return itemsBySlug.get(slug);
}

export function getItemDisplayDescription(item: ItemEntry): string {
  if (item.description.startsWith("Imported from ")) {
    return "No description listed.";
  }

  return item.description;
}

export function getItemDisplayName(item: Pick<ItemEntry, "name">): string {
  return item.name.replace(/\s*\[(.+?)\]/g, " $1").replace(/\s+/g, " ").trim();
}

export function getItemLocations(): ItemLocationEntry[] {
  return itemLocations;
}

export function getItemCoverageNote(): string {
  return "Imported item-location coverage currently includes shop inventory, trash can finds, and special placements such as Box Link. Comprehensive route and field pickup coverage is not present in the current source set.";
}

export function getItemLocationStatusMessage(hasLocations: boolean): string {
  if (hasLocations) {
    return "Imported location data is available below. Coverage currently includes shop inventory, trash can finds, and special placements only.";
  }

  return "No imported location references are available for this item. Current item-location imports only cover shop inventory, trash can finds, and special placements.";
}

export function getLocationItemStatusMessage(hasItems: boolean): string {
  if (hasItems) {
    return "Imported item-location data is available below. Coverage currently includes shop inventory, trash can finds, and special placements only.";
  }

  return "No imported item-location data is available for this area. Current item-location imports only cover shop inventory, trash can finds, and special placements.";
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

export function getLocationsByItem(itemId: string): ItemLocationReference[] {
  return itemLocations
    .filter((entry) => entry.itemId === itemId)
    .map((entry) => {
      const location = getLocationById(entry.locationId);

      if (!location) {
        return undefined;
      }

      return {
        itemLocationId: entry.id,
        notes: entry.notes,
        location,
      };
    })
    .filter((entry): entry is ItemLocationReference => entry !== undefined);
}

export type ItemObtainDetail = {
  itemLocationId: string;
  notes: string;
  location: ItemLocationReference["location"];
  method: string;
  detail: string | null;
};

function formatPriceLabel(value: string): string | null {
  const price = Number.parseFloat(value);
  return Number.isFinite(price) ? new Intl.NumberFormat("en-US").format(price) : null;
}

function cleanObtainDetail(notes: string): { method: string; detail: string | null } {
  const trimmed = notes.trim();
  const tmShopMatch = trimmed.match(/^Shop - TMs; price ([\d.]+)$/i);
  if (tmShopMatch) {
    const priceLabel = formatPriceLabel(tmShopMatch[1]);
    return { method: "TM Shop", detail: priceLabel ? `${priceLabel}` : null };
  }

  const shopMatch = trimmed.match(/^Shop - (.+)$/i);
  if (shopMatch) {
    return { method: "Shop", detail: shopMatch[1].trim() || null };
  }

  if (/^Gift/i.test(trimmed)) {
    return {
      method: "Gift",
      detail: trimmed.replace(/^Gift\s*-?\s*/i, "").trim() || null,
    };
  }

  if (/^Trash can/i.test(trimmed)) {
    return {
      method: "Trash Can",
      detail: trimmed.replace(/^Trash can\s*-?\s*/i, "").trim() || null,
    };
  }

  if (/berry tree/i.test(trimmed)) {
    return { method: "Berry Tree", detail: trimmed.replace(/;\s*hidden item/gi, "").trim() || null };
  }

  if (/hidden/i.test(trimmed)) {
    return {
      method: "Hidden Item",
      detail: trimmed.replace(/;\s*hidden item/gi, "").replace(/;\s*hidden/gi, "").trim() || null,
    };
  }

  return { method: "Found", detail: trimmed || null };
}

export function getItemObtainDetails(itemId: string): ItemObtainDetail[] {
  return getLocationsByItem(itemId).map((entry) => {
    const parsed = cleanObtainDetail(entry.notes);
    return {
      itemLocationId: entry.itemLocationId,
      notes: entry.notes,
      location: entry.location,
      method: parsed.method,
      detail: parsed.detail,
    };
  });
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
