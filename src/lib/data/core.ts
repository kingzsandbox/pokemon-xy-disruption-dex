import encountersData from "../../../public/data/encounters.json";
import itemLocationsData from "../../../public/data/item-locations.json";
import itemsData from "../../../public/data/items.json";
import locationsData from "../../../public/data/locations.json";
import machinesData from "../../../public/data/machines.json";
import moveCompatibilityData from "../../../public/data/move-compatibility.json";
import movesData from "../../../public/data/moves.json";
import pokemonData from "../../../public/data/pokemon.json";
import {
  normalizeEncounterEntry,
  normalizeItemEntry,
  normalizeItemLocationEntry,
  normalizeLocationEntry,
  normalizeMachineEntry,
  normalizeMoveEntry,
  normalizeMoveCompatibilityEntry,
  normalizePokemonEntry,
} from "@/lib/normalize";
import type {
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  LocationEntry,
  MachineEntry,
  MoveEntry,
  MoveCompatibilityEntry,
  PokemonEntry,
} from "@/lib/types";
import { validateCoreData } from "@/lib/validate";

const pokemon = (pokemonData as PokemonEntry[]).map(normalizePokemonEntry);
const locations = (locationsData as LocationEntry[]).map(normalizeLocationEntry);
const items = (itemsData as ItemEntry[]).map(normalizeItemEntry);
const moves = (movesData as MoveEntry[]).map(normalizeMoveEntry);
const machines = (machinesData as MachineEntry[]).map(normalizeMachineEntry);
const moveCompatibility = (moveCompatibilityData as MoveCompatibilityEntry[]).map(
  normalizeMoveCompatibilityEntry,
);
const encounters = (encountersData as EncounterEntry[]).map(normalizeEncounterEntry);
const itemLocations = (itemLocationsData as ItemLocationEntry[]).map(normalizeItemLocationEntry);

validateCoreData({
  pokemon,
  locations,
  items,
  moves,
  machines,
  moveCompatibility,
  encounters,
  itemLocations,
});

export const corePokemon = pokemon;
export const coreLocations = locations;
export const coreItems = items;
export const coreMoves = moves;
export const coreMachines = machines;
export const coreMoveCompatibility = moveCompatibility;
export const coreEncounters = encounters;
export const coreItemLocations = itemLocations;
