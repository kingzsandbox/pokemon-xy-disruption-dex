export type DexEntryId = string;
export type PokemonId = DexEntryId;
export type LocationId = DexEntryId;
export type ItemId = DexEntryId;

export interface NamedEntry {
  id: DexEntryId;
  slug: string;
  name: string;
}

export interface BaseStats {
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
  baseStats: BaseStats;
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
  locationId: LocationId;
  pokemonId: PokemonId;
  method: string;
  minLevel: number;
  maxLevel: number;
  rate: number;
}

export interface ItemLocationEntry {
  id: DexEntryId;
  itemId: ItemId;
  locationId: LocationId;
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
  itemLocationId: DexEntryId;
  locationId: LocationId;
  notes: string;
  item: ItemEntry;
}
