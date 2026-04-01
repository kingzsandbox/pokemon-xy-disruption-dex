export type DexEntryId = string;
export type PokemonId = DexEntryId;
export type LocationId = DexEntryId;
export type ItemId = DexEntryId;
export type MoveId = DexEntryId;
export type MachineId = DexEntryId;
export type LearnsetId = DexEntryId;
export type TrainerId = DexEntryId;
export type LevelCapId = DexEntryId;
export type PickupEntryId = DexEntryId;

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

export type MoveStatus = "usable" | "reduced" | "removed";

export interface MoveEntry extends NamedEntry {
  type: string | null;
  category: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  status: MoveStatus;
  notes: string | null;
}

export type MachineKind = "tm" | "hm" | "mt";

export interface MachineEntry extends NamedEntry {
  code: string;
  kind: MachineKind;
  moveId: MoveId | null;
  location: string | null;
}

export interface MoveCompatibilityEntry {
  id: DexEntryId;
  pokemonId: PokemonId;
  machineId: MachineId;
  moveId: MoveId | null;
}

export type LearnsetMethod = "level-up";

export interface LearnsetEntry {
  id: LearnsetId;
  pokemonId: PokemonId;
  moveId: MoveId | null;
  moveName: string;
  method: LearnsetMethod;
  level: number | null;
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

export type SearchResultType = "pokemon" | "location" | "item" | "move" | "trainer" | "system";

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

export interface PokemonMachineCompatibility {
  compatibilityId: DexEntryId;
  machine: MachineEntry;
}

export interface MoveMachineLink {
  machine: MachineEntry;
  compatiblePokemonIds: PokemonId[];
}

export interface PokemonLearnsetMove {
  learnsetId: LearnsetId;
  moveId: MoveId | null;
  moveName: string;
  method: LearnsetMethod;
  level: number | null;
}

export interface MoveLearnsetLink {
  learnsetId: LearnsetId;
  pokemonId: PokemonId;
  level: number | null;
}

export type TrainerRuleset = "singles" | "doubles";
export type TrainerSource = "xy-trainers" | "restaurants" | "battle-chateau";
export type TrainerBattleFormat = "single" | "double" | null;

export interface TrainerPokemonEntry {
  slot: number;
  pokemonId: PokemonId | null;
  pokemonName: string;
  level: number | null;
  gender: string | null;
  ability: string | null;
  heldItem: string | null;
  moves: string[];
}

export interface TrainerEntry extends NamedEntry {
  indexNumber: number | null;
  location: string;
  section: string | null;
  source: TrainerSource;
  ruleset: TrainerRuleset;
  format: TrainerBattleFormat;
  trainerClass: string | null;
  team: TrainerPokemonEntry[];
}

export interface LevelCapEntry extends NamedEntry {
  trainer: string;
  location: string;
  level: number;
  pokemonCount: string;
}

export type PickupTableType = "common" | "rare";

export interface PickupEntry extends NamedEntry {
  table: PickupTableType;
  rateLabel: string;
  itemId: ItemId | null;
  itemName: string;
}
