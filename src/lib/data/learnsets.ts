import { coreLearnsets } from "./core";
import { getMoveById } from "./moves";
import type { LearnsetEntry, MoveLearnsetLink, PokemonLearnsetMove } from "../types";

const learnsets = coreLearnsets as LearnsetEntry[];
const learnsetsByPokemonId = new Map<string, PokemonLearnsetMove[]>();
const learnsetsByMoveId = new Map<string, MoveLearnsetLink[]>();

for (const entry of learnsets) {
  if (entry.moveId && !getMoveById(entry.moveId)) {
    continue;
  }

  const pokemonEntries = learnsetsByPokemonId.get(entry.pokemonId) ?? [];
  pokemonEntries.push({
    learnsetId: entry.id,
    moveId: entry.moveId,
    moveName: entry.moveName,
    method: entry.method,
    level: entry.level,
  });
  learnsetsByPokemonId.set(entry.pokemonId, pokemonEntries);

  if (entry.moveId) {
    const moveEntries = learnsetsByMoveId.get(entry.moveId) ?? [];
    moveEntries.push({
      learnsetId: entry.id,
      pokemonId: entry.pokemonId,
      level: entry.level,
    });
    learnsetsByMoveId.set(entry.moveId, moveEntries);
  }
}

for (const entries of learnsetsByPokemonId.values()) {
  entries.sort((left, right) => (left.level ?? 999) - (right.level ?? 999) || left.moveName.localeCompare(right.moveName));
}

for (const entries of learnsetsByMoveId.values()) {
  entries.sort((left, right) => (left.level ?? 999) - (right.level ?? 999) || left.pokemonId.localeCompare(right.pokemonId));
}

export function getLearnsets(): LearnsetEntry[] {
  return learnsets;
}

export function getLearnsetByPokemonId(pokemonId: string): PokemonLearnsetMove[] {
  return learnsetsByPokemonId.get(pokemonId) ?? [];
}

export function getLearnsetByMoveId(moveId: string): MoveLearnsetLink[] {
  return learnsetsByMoveId.get(moveId) ?? [];
}
