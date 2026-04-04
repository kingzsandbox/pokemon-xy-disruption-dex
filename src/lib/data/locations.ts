import { coreEncounters, coreItemLocations, coreLocations } from "./core";
import type { LocationEntry } from "../types";

const allLocations = coreLocations as LocationEntry[];
const encounterLocationIds = new Set((coreEncounters as Array<{ locationId: string }>).map((entry) => entry.locationId));
const itemLocationIds = new Set((coreItemLocations as Array<{ locationId: string }>).map((entry) => entry.locationId));
const hiddenLocationSlugs = new Set(
  allLocations
    .filter((entry) => {
      const description = entry.description.trim();
      const hasDescription =
        description.length > 0 && !description.startsWith("Imported location record from source materials for ");
      return !hasDescription && !encounterLocationIds.has(entry.id) && !itemLocationIds.has(entry.id);
    })
    .map((entry) => entry.slug),
);
const locations = allLocations.filter((entry) => !hiddenLocationSlugs.has(entry.slug));
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
