import { corePokemon } from "@/lib/data/core";
import { getPokemonDisplayName, isBrowsablePokedexPokemon } from "@/lib/presentation";
import type { PokemonEntry } from "@/lib/types";

const pokemon = corePokemon as PokemonEntry[];
const pokemonById = new Map(pokemon.map((entry) => [entry.id, entry]));
const pokemonBySlug = new Map(pokemon.map((entry) => [entry.slug, entry]));
const megaPokemonByStone = new Map<string, PokemonEntry>();

const irregularMegaStoneNames: Record<string, string> = {
  "Mega Abomasnow": "Abomasite",
  "Mega Altaria": "Altarianite",
  "Mega Audino": "Audinite",
  "Mega Banette": "Banettite",
  "Mega Diancie": "Diancite",
  "Mega Gallade": "Galladite",
  "Mega Garchomp": "Garchompite",
  "Mega Heracross": "Heracronite",
  "Mega Lopunny": "Lopunnite",
  "Mega Lucario": "Lucarionite",
  "Mega Manectric": "Manectite",
  "Mega Sablenite": "Sablenite",
  "Mega Salamence": "Salamencite",
};

function getMegaStoneNames(entry: PokemonEntry): string[] {
  const displayName = getPokemonDisplayName(entry);
  if (!displayName.startsWith("Mega ")) {
    return [];
  }

  if (irregularMegaStoneNames[displayName]) {
    return [irregularMegaStoneNames[displayName]];
  }

  const megaLabel = displayName.slice(5).trim();
  switch (megaLabel) {
    case "Charizard X":
      return ["Charizardite X"];
    case "Charizard Y":
      return ["Charizardite Y"];
    case "Mewtwo X":
      return ["Mewtwonite X"];
    case "Mewtwo Y":
      return ["Mewtwonite Y"];
    default:
      return [`${megaLabel}ite`];
  }
}

for (const entry of pokemon) {
  for (const stoneName of getMegaStoneNames(entry)) {
    megaPokemonByStone.set(stoneName.toLowerCase(), entry);
  }
}

export function getAllPokemon(): PokemonEntry[] {
  return pokemon;
}

export function getBrowsablePokedexPokemon(): PokemonEntry[] {
  return pokemon.filter(isBrowsablePokedexPokemon);
}

export function getPokemonBySlug(slug: string): PokemonEntry | undefined {
  return pokemonBySlug.get(slug);
}

export function getPokemonById(id: string): PokemonEntry | undefined {
  return pokemonById.get(id);
}

export function getBattleDisplayPokemon(
  pokemonId: string | null,
  heldItem: string | null,
): PokemonEntry | undefined {
  const basePokemon = pokemonId ? getPokemonById(pokemonId) : undefined;

  if (!basePokemon || !heldItem) {
    return basePokemon;
  }

  const megaPokemon = megaPokemonByStone.get(heldItem.trim().toLowerCase());
  if (!megaPokemon) {
    return basePokemon;
  }

  return megaPokemon.dexNumber === basePokemon.dexNumber ? megaPokemon : basePokemon;
}
