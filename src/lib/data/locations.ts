import { coreLocations } from "@/lib/data/core";
import type { LocationEntry } from "@/lib/types";

const locations = coreLocations as LocationEntry[];
const locationsById = new Map(locations.map((entry) => [entry.id, entry]));
const locationsBySlug = new Map(locations.map((entry) => [entry.slug, entry]));

export function getLocations(): LocationEntry[] {
  return locations;
}

export function getLocationBySlug(slug: string): LocationEntry | undefined {
  return locationsBySlug.get(slug);
}

export function getLocationById(id: string): LocationEntry | undefined {
  return locationsById.get(id);
}
