import encountersData from "../../../public/data/encounters.json";
import itemLocationsData from "../../../public/data/item-locations.json";
import itemsData from "../../../public/data/items.json";
import learnsetsData from "../../../public/data/learnsets.json";
import levelCapsData from "../../../public/data/level-caps.json";
import locationsData from "../../../public/data/locations.json";
import machinesData from "../../../public/data/machines.json";
import moveCompatibilityData from "../../../public/data/move-compatibility.json";
import movesData from "../../../public/data/moves.json";
import pokemonData from "../../../public/data/pokemon.json";
import pickupEntriesData from "../../../public/data/pickup-entries.json";
import trainersData from "../../../public/data/trainers.json";
import {
  normalizeEncounterEntry,
  normalizeItemEntry,
  normalizeItemLocationEntry,
  normalizeLearnsetEntry,
  normalizeLevelCapEntry,
  normalizeLocationEntry,
  normalizeMachineEntry,
  normalizeMoveEntry,
  normalizeMoveCompatibilityEntry,
  normalizePokemonEntry,
  normalizePickupEntry,
  normalizeTrainerEntry,
} from "@/lib/normalize";
import type {
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  LearnsetEntry,
  LevelCapEntry,
  LocationEntry,
  MachineEntry,
  MoveEntry,
  MoveCompatibilityEntry,
  PokemonEntry,
  PickupEntry,
  TrainerEntry,
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
const learnsets = (learnsetsData as LearnsetEntry[]).map(normalizeLearnsetEntry);
const encounters = (encountersData as EncounterEntry[]).map(normalizeEncounterEntry);
const itemLocations = (itemLocationsData as ItemLocationEntry[]).map(normalizeItemLocationEntry);
const trainers = (trainersData as TrainerEntry[]).map(normalizeTrainerEntry);
const levelCaps = (levelCapsData as LevelCapEntry[]).map(normalizeLevelCapEntry);
const pickupEntries = (pickupEntriesData as PickupEntry[]).map(normalizePickupEntry);

validateCoreData({
  pokemon,
  locations,
  items,
  moves,
  machines,
  moveCompatibility,
  learnsets,
  encounters,
  itemLocations,
  trainers,
  levelCaps,
  pickupEntries,
});

export const corePokemon = pokemon;
export const coreLocations = locations;
export const coreItems = items;
export const coreMoves = moves;
export const coreMachines = machines;
export const coreMoveCompatibility = moveCompatibility;
export const coreLearnsets = learnsets;
export const coreEncounters = encounters;
export const coreItemLocations = itemLocations;
export const coreTrainers = trainers;
export const coreLevelCaps = levelCaps;
export const corePickupEntries = pickupEntries;
