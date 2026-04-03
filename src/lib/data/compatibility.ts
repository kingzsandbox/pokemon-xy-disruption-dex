import { coreMachines, coreMoveCompatibility } from "./core";
import { getLocationByName } from "./locations";
import { getMoveById } from "./moves";
import { getPokemonById } from "./pokemon";
import type {
  MachineEntry,
  LocationEntry,
  MoveMachineLink,
  PokemonMachineCompatibility,
} from "../types";

const machines = coreMachines as MachineEntry[];
const compatibility = coreMoveCompatibility;

const machinesById = new Map(machines.map((entry) => [entry.id, entry]));
const machinesBySlug = new Map(machines.map((entry) => [entry.slug, entry]));
const compatibilityByPokemonId = new Map<string, PokemonMachineCompatibility[]>();
const machinePokemonIds = new Map<string, string[]>();

function getMachineSortMeta(machine: MachineEntry): { kindOrder: number; numericCode: number } {
  const match = machine.code.match(/^(TM|HM|MT)(\d+)$/i);

  if (!match) {
    return { kindOrder: 99, numericCode: Number.MAX_SAFE_INTEGER };
  }

  const prefix = match[1].toUpperCase();
  const numericCode = Number.parseInt(match[2], 10);
  const kindOrder = prefix === "TM" ? 0 : prefix === "HM" ? 1 : 2;

  return { kindOrder, numericCode };
}

function compareBrowsableMachines(left: MachineEntry, right: MachineEntry): number {
  const leftMeta = getMachineSortMeta(left);
  const rightMeta = getMachineSortMeta(right);

  if (leftMeta.kindOrder !== rightMeta.kindOrder) {
    return leftMeta.kindOrder - rightMeta.kindOrder;
  }

  if (leftMeta.numericCode !== rightMeta.numericCode) {
    return leftMeta.numericCode - rightMeta.numericCode;
  }

  return left.code.localeCompare(right.code);
}

export function isBrowsableMachine(machine: MachineEntry): boolean {
  return machine.kind === "tm" || machine.kind === "hm";
}

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

export function getBrowsableMachines(): MachineEntry[] {
  return machines.filter(isBrowsableMachine).sort(compareBrowsableMachines);
}

export function getMachineByMoveId(moveId: string): MachineEntry[] {
  return machines.filter((entry) => entry.moveId === moveId);
}

export function getCompatibilityByPokemonId(pokemonId: string): PokemonMachineCompatibility[] {
  return compatibilityByPokemonId.get(pokemonId) ?? [];
}

export function getTmHmCompatibilityByPokemonId(
  pokemonId: string,
): PokemonMachineCompatibility[] {
  return getCompatibilityByPokemonId(pokemonId)
    .filter((entry) => isBrowsableMachine(entry.machine))
    .sort((left, right) => compareBrowsableMachines(left.machine, right.machine));
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
  return getBrowsableMachines().map((machine) => ({
    machine,
    move: machine.moveId ? getMoveById(machine.moveId) : undefined,
    compatibilityCount: getCompatibilityCountByMachineId(machine.id),
    location: getMachineLocationEntry(machine),
  }));
}
