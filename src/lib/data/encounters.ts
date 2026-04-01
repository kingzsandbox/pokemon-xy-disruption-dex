import encountersData from "../../../public/data/encounters.json";
import type { EncounterEntry } from "@/lib/types";

const encounters = encountersData as EncounterEntry[];

export function getEncounters(): EncounterEntry[] {
  return encounters;
}

export function getEncountersByLocation(locationId: string): EncounterEntry[] {
  return encounters.filter((entry) => entry.locationId === locationId);
}
