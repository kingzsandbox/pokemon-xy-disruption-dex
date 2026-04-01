export type DexEntryId = string;

export interface NamedEntry {
  id: DexEntryId;
  slug: string;
  name: string;
}

export interface PokemonStats {
  hp: number;
  attack: number;
  defense: number;
  specialAttack: number;
  specialDefense: number;
  speed: number;
}

export interface PokemonEntry extends NamedEntry {
  dexNumber: number;
  types: string[];
  stats: PokemonStats;
  abilities: string[];
  changeSummary: string;
}

export interface LocationEntry extends NamedEntry {
  region: string;
  description: string;
}

export interface ItemEntry extends NamedEntry {
  category: string;
  description: string;
}

export interface EncounterEntry {
  id: DexEntryId;
  locationId: string;
  pokemonId: string;
  method: string;
  level: number;
  rate: number;
}

export interface ItemLocationEntry {
  id: DexEntryId;
  itemId: string;
  locationId: string;
  notes: string;
}

export type SearchResultType = "pokemon" | "location" | "item";

export interface SearchResult {
  id: DexEntryId;
  type: SearchResultType;
  title: string;
  subtitle: string;
  slug: string;
}

export interface LocatedItem {
  locationId: string;
  notes: string;
  item: ItemEntry;
}
