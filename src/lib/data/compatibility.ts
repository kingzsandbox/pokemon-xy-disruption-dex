import { coreMachines, coreMoveCompatibility } from "@/lib/data/core";
import { getLocationByName } from "@/lib/data/locations";
import { getMoveById } from "@/lib/data/moves";
import { getPokemonById } from "@/lib/data/pokemon";
import type {
  MachineEntry,
  LocationEntry,
  MoveMachineLink,
  PokemonMachineCompatibility,
} from "@/lib/types";

const machines = coreMachines as MachineEntry[];
const compatibility = coreMoveCompatibility;

const machinesById = new Map(machines.map((entry) => [entry.id, entry]));
const machinesBySlug = new Map(machines.map((entry) => [entry.slug, entry]));
const compatibilityByPokemonId = new Map<string, PokemonMachineCompatibility[]>();
const machinePokemonIds = new Map<string, string[]>();

for (const entry of compatibility) {
  const machine = machinesById.get(entry.machineId);

  if (!machine) {
    continue;
  }

  const pokemonEntries = compatibilityByPokemonId.get(entry.pokemonId) ?? [];
  pokemonEntries.push({
    compatibilityId: entry.id,
    machine,
  });
  compatibilityByPokemonId.set(entry.pokemonId, pokemonEntries);

  const pokemonIds = machinePokemonIds.get(entry.machineId) ?? [];
  pokemonIds.push(entry.pokemonId);
  machinePokemonIds.set(entry.machineId, pokemonIds);
}

export function getMachines(): MachineEntry[] {
  return machines;
}

export function getMachineBySlug(slug: string): MachineEntry | undefined {
  return machinesBySlug.get(slug);
}

export function getMachineByMoveId(moveId: string): MachineEntry[] {
  return machines.filter((entry) => entry.moveId === moveId);
}

export function getCompatibilityByPokemonId(pokemonId: string): PokemonMachineCompatibility[] {
  return compatibilityByPokemonId.get(pokemonId) ?? [];
}

export function getMachineLinksByMoveId(moveId: string): MoveMachineLink[] {
  return getMachineByMoveId(moveId).map((machine) => ({
    machine,
    compatiblePokemonIds: machinePokemonIds.get(machine.id) ?? [],
  }));
}

export function getCompatibilityCountByMachineId(machineId: string): number {
  return (machinePokemonIds.get(machineId) ?? []).length;
}

export function getCompatiblePokemonByMachineId(machineId: string) {
  return (machinePokemonIds.get(machineId) ?? [])
    .map((pokemonId) => getPokemonById(pokemonId))
    .filter((entry) => entry !== undefined);
}

export function getMachineLocationEntry(machine: MachineEntry): LocationEntry | undefined {
  if (!machine.location) {
    return undefined;
  }

  return getLocationByName(machine.location);
}

export function getMachineBrowseEntries() {
  return machines.map((machine) => ({
    machine,
    move: machine.moveId ? getMoveById(machine.moveId) : undefined,
    compatibilityCount: getCompatibilityCountByMachineId(machine.id),
    location: getMachineLocationEntry(machine),
  }));
}
