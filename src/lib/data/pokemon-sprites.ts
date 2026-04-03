import spriteIndexData from "../../../public/data/pokemon-sprites.json";

type PokemonSpriteIndexEntry = {
  pokemonId: string;
  slug: string;
  src: string;
};

const spriteIndex = spriteIndexData as PokemonSpriteIndexEntry[];
const spriteByPokemonId = new Map(spriteIndex.map((entry) => [entry.pokemonId, entry.src]));
const spriteBySlug = new Map(spriteIndex.map((entry) => [entry.slug, entry.src]));

export function getPokemonSpriteSrcById(pokemonId: string): string | undefined {
  return spriteByPokemonId.get(pokemonId);
}

export function getPokemonSpriteSrcBySlug(slug: string): string | undefined {
  return spriteBySlug.get(slug);
}
