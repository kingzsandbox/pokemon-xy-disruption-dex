import type { PokemonEntry } from "./types";

const typeChart: Record<string, Partial<Record<string, number>>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: { Fire: 0.5, Water: 2, Grass: 0.5, Poison: 0.5, Ground: 2, Flying: 0.5, Bug: 0.5, Rock: 2, Dragon: 0.5, Steel: 0.5 },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5, Ice: 0.5 },
  Fighting: { Normal: 2, Ice: 2, Poison: 0.5, Flying: 0.5, Psychic: 0.5, Bug: 0.5, Rock: 2, Ghost: 0, Dark: 2, Steel: 2, Fairy: 0.5 },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: { Fire: 0.5, Grass: 2, Fighting: 0.5, Poison: 0.5, Flying: 0.5, Psychic: 2, Ghost: 0.5, Dark: 2, Steel: 0.5, Fairy: 0.5 },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

export const pokemonTypes = Object.keys(typeChart);

export type MatchupBucket = {
  label: string;
  multiplier: number;
  types: string[];
};

function getAttackMultiplier(attackingType: string, defendingTypes: string[]): number {
  return defendingTypes.reduce((multiplier, defendingType) => {
    const typeMultiplier = typeChart[attackingType]?.[defendingType] ?? 1;
    return multiplier * typeMultiplier;
  }, 1);
}

function groupTypesByMultiplier(entries: Array<{ type: string; multiplier: number }>): MatchupBucket[] {
  const groups = new Map<number, string[]>();

  for (const entry of entries) {
    const types = groups.get(entry.multiplier) ?? [];
    types.push(entry.type);
    groups.set(entry.multiplier, types);
  }

  return [...groups.entries()]
    .sort((left, right) => right[0] - left[0])
    .map(([multiplier, types]) => ({
      label: multiplier === 0 ? "No effect" : `${multiplier}x`,
      multiplier,
      types: types.sort((left, right) => left.localeCompare(right)),
    }));
}

export function getDefensiveMatchups(pokemon: PokemonEntry): MatchupBucket[] {
  return groupTypesByMultiplier(
    pokemonTypes.map((attackingType) => ({
      type: attackingType,
      multiplier: getAttackMultiplier(attackingType, pokemon.types),
    })),
  ).filter((entry) => entry.multiplier !== 1);
}

export function getOffensiveMatchups(pokemon: PokemonEntry): MatchupBucket[] {
  return groupTypesByMultiplier(
    pokemonTypes.map((defendingType) => ({
      type: defendingType,
      multiplier: Math.max(...pokemon.types.map((attackingType) => getAttackMultiplier(attackingType, [defendingType]))),
    })),
  ).filter((entry) => entry.multiplier !== 1);
}
