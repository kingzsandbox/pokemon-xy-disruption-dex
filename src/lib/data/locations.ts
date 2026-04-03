import { coreLocations } from "./core";
import type { LocationEntry } from "../types";

const locations = coreLocations as LocationEntry[];
const locationsById = new Map(locations.map((entry) => [entry.id, entry]));
const locationsBySlug = new Map(locations.map((entry) => [entry.slug, entry]));
const locationsByNormalizedName = new Map(
  locations.map((entry) => [normalizeLocationName(entry.name), entry]),
);

function normalizeLocationName(value: string): string {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

export function getLocationDisplayDescription(location: Pick<LocationEntry, "description">): string | null {
  const description = location.description.trim();
  if (!description || description.startsWith("Imported location record from source materials for ")) {
    return null;
  }

  return description;
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
