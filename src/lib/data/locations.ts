import locationsData from "../../../public/data/locations.json";
import type { LocationEntry } from "@/lib/types";

const locations = locationsData as LocationEntry[];

export function getLocations(): LocationEntry[] {
  return locations;
}

export function getLocationBySlug(slug: string): LocationEntry | undefined {
  return locations.find((location) => location.slug === slug);
}

export function getLocationById(id: string): LocationEntry | undefined {
  return locations.find((location) => location.id === id);
}
