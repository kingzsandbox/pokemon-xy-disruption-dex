import { coreMachines, coreMoveCompatibility } from "@/lib/data/core";
import type {
  MachineEntry,
  MoveMachineLink,
  PokemonMachineCompatibility,
} from "@/lib/types";

const machines = coreMachines as MachineEntry[];
const compatibility = coreMoveCompatibility;

const machinesById = new Map(machines.map((entry) => [entry.id, entry]));
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
