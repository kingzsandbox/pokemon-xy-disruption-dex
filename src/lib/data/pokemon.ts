import pokemonData from "../../../public/data/pokemon.json";
import type { PokemonEntry } from "@/lib/types";

const pokemon = pokemonData as PokemonEntry[];

export function getAllPokemon(): PokemonEntry[] {
  return pokemon;
}

export function getPokemonBySlug(slug: string): PokemonEntry | undefined {
  return pokemon.find((entry) => entry.slug === slug);
}

export function getPokemonById(id: string): PokemonEntry | undefined {
  return pokemon.find((entry) => entry.id === id);
}
