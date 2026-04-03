import type { ItemEntry, PokemonEntry } from "./types";

const hiddenPokedexIds = new Set(["pokemon-0386", "pokemon-0678"]);

function cleanFormLabel(label: string): string {
  return label
    .replace(/\bForme\b/g, "")
    .replace(/\bForm\b/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getPokemonDisplayName(pokemon: Pick<PokemonEntry, "name">): string {
  const match = pokemon.name.match(/^(.+?) \((.+)\)$/);

  if (!match) {
    return pokemon.name;
  }

  const baseName = match[1].trim();
  const rawLabel = match[2].trim();
  const cleanedLabel = cleanFormLabel(rawLabel);
  const normalizedLabel = cleanedLabel
    .replace(/\bZen Mode\b/i, "Zen")
    .replace(/\bStandard Mode\b/i, "Standard")
    .replace(/\bAttack Forme\b/i, "Attack")
    .replace(/\bDefense Forme\b/i, "Defense")
    .replace(/\bNormal Forme\b/i, "Normal")
    .replace(/\bSpeed Forme\b/i, "Speed")
    .replace(/\bAverage Size\b/i, "Average")
    .replace(/\bLarge Size\b/i, "Large")
    .replace(/\bSmall Size\b/i, "Small")
    .replace(/\bSuper Size\b/i, "Super")
    .replace(/\bPlant Cloak\b/i, "Plant Cloak")
    .replace(/\bSandy Cloak\b/i, "Sandy Cloak")
    .replace(/\bTrash Cloak\b/i, "Trash Cloak")
    .trim();

  if (normalizedLabel.toLowerCase().startsWith("mega ")) {
    return normalizedLabel;
  }

  if (normalizedLabel.toLowerCase() === "eternal floette") {
    return "Eternal Floette";
  }

  if (normalizedLabel.toLowerCase().includes(baseName.toLowerCase())) {
    return normalizedLabel;
  }

  return `${baseName} ${normalizedLabel}`.replace(/\s+/g, " ").trim();
}

export function isBrowsablePokedexPokemon(pokemon: PokemonEntry): boolean {
  return !hiddenPokedexIds.has(pokemon.id);
}

export function getItemDisplayName(item: Pick<ItemEntry, "name">): string {
  return item.name;
}
