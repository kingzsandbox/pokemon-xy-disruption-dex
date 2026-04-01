import { coreLocations } from "@/lib/data/core";
import type { LocationEntry } from "@/lib/types";

const locations = coreLocations as LocationEntry[];
const locationsById = new Map(locations.map((entry) => [entry.id, entry]));
const locationsBySlug = new Map(locations.map((entry) => [entry.slug, entry]));
const locationsByNormalizedName = new Map(
  locations.map((entry) => [normalizeLocationName(entry.name), entry]),
);

function normalizeLocationName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getLocations(): LocationEntry[] {
  return locations;
}

export function getLocationBySlug(slug: string): LocationEntry | undefined {
  return locationsBySlug.get(slug);
}

export function getLocationById(id: string): LocationEntry | undefined {
  return locationsById.get(id);
}

export function getLocationByName(name: string): LocationEntry | undefined {
  return locationsByNormalizedName.get(normalizeLocationName(name));
}
