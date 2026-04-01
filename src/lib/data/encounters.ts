import { coreEncounters } from "@/lib/data/core";
import type { EncounterEntry } from "@/lib/types";

const encounters = coreEncounters as EncounterEntry[];
const encountersByLocation = new Map<string, EncounterEntry[]>();

for (const encounter of encounters) {
  const locationEntries = encountersByLocation.get(encounter.locationId) ?? [];
  locationEntries.push(encounter);
  encountersByLocation.set(encounter.locationId, locationEntries);
}

export function getEncounters(): EncounterEntry[] {
  return encounters;
}

export function getEncountersByLocation(locationId: string): EncounterEntry[] {
  return encountersByLocation.get(locationId) ?? [];
}
