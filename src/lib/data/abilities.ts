import abilitiesData from "../../../public/data/abilities.json";
import type { AbilityEntry } from "../types";

const abilities = (abilitiesData as AbilityEntry[]).slice().sort((left, right) => left.name.localeCompare(right.name));
const abilitiesById = new Map(abilities.map((entry) => [entry.id, entry]));
const abilitiesBySlug = new Map(abilities.map((entry) => [entry.slug, entry]));
const abilitiesByName = new Map(abilities.map((entry) => [entry.name.toLowerCase(), entry]));

export function getAbilities(): AbilityEntry[] {
  return abilities;
}

export function getAbilityById(id: string): AbilityEntry | undefined {
  return abilitiesById.get(id);
}

export function getAbilityBySlug(slug: string): AbilityEntry | undefined {
  return abilitiesBySlug.get(slug);
}

export function getAbilityByName(name: string): AbilityEntry | undefined {
  return abilitiesByName.get(name.toLowerCase());
}
