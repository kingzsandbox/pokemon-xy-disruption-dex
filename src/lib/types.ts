export type DexEntryId = string;

export interface NamedEntry {
  id: DexEntryId;
  name: string;
}

export interface PokemonEntry extends NamedEntry {
  dexNumber?: number;
  types?: string[];
}

export interface LocationEntry extends NamedEntry {
  region?: string;
}

export interface ItemEntry extends NamedEntry {
  category?: string;
}

export interface SearchResult<T extends NamedEntry = NamedEntry> {
  item: T;
  score: number;
}
