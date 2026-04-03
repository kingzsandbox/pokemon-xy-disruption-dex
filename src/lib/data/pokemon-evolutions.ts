import evolutionLinksData from "../../../public/data/pokemon-evolutions.json";
import { getPokemonById } from "@/lib/data/pokemon";
import type { PokemonEvolutionLink, PokemonEntry } from "@/lib/types";

const evolutionLinks = evolutionLinksData as PokemonEvolutionLink[];

export function getEvolutionLinks(): PokemonEvolutionLink[] {
  return evolutionLinks;
}

function getRelatedPokemonIds(pokemonId: string): string[] {
  const visited = new Set<string>();
  const queue = [pokemonId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    for (const link of evolutionLinks) {
      if (link.fromPokemonId === current && !visited.has(link.toPokemonId)) {
        queue.push(link.toPokemonId);
      }
      if (link.toPokemonId === current && !visited.has(link.fromPokemonId)) {
        queue.push(link.fromPokemonId);
      }
    }
  }

  return [...visited];
}

export function getEvolutionFamily(pokemonId: string): {
  pokemon: PokemonEntry;
  incomingMethod: string | null;
}[] {
  const related = getRelatedPokemonIds(pokemonId)
    .map((id) => getPokemonById(id))
    .filter((entry): entry is PokemonEntry => entry !== undefined)
    .sort((left, right) => {
      if (left.dexNumber !== right.dexNumber) {
        return left.dexNumber - right.dexNumber;
      }

      return left.name.localeCompare(right.name);
    });

  return related.map((pokemon) => {
    const incoming = evolutionLinks.find((link) => link.toPokemonId === pokemon.id);
    return {
      pokemon,
      incomingMethod: incoming?.method ?? null,
    };
  });
}
