import { corePokemon } from "@/lib/data/core";
import type { PokemonEntry } from "@/lib/types";

const pokemon = corePokemon as PokemonEntry[];
const pokemonById = new Map(pokemon.map((entry) => [entry.id, entry]));
const pokemonBySlug = new Map(pokemon.map((entry) => [entry.slug, entry]));

export function getAllPokemon(): PokemonEntry[] {
  return pokemon;
}

export function getPokemonBySlug(slug: string): PokemonEntry | undefined {
  return pokemonBySlug.get(slug);
}

export function getPokemonById(id: string): PokemonEntry | undefined {
  return pokemonById.get(id);
}
