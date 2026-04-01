import encountersData from "../../../public/data/encounters.json";
import itemLocationsData from "../../../public/data/item-locations.json";
import itemsData from "../../../public/data/items.json";
import locationsData from "../../../public/data/locations.json";
import pokemonData from "../../../public/data/pokemon.json";
import {
  normalizeEncounterEntry,
  normalizeItemEntry,
  normalizeItemLocationEntry,
  normalizeLocationEntry,
  normalizePokemonEntry,
} from "@/lib/normalize";
import type {
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  LocationEntry,
  PokemonEntry,
} from "@/lib/types";
import { validateCoreData } from "@/lib/validate";

const pokemon = (pokemonData as PokemonEntry[]).map(normalizePokemonEntry);
const locations = (locationsData as LocationEntry[]).map(normalizeLocationEntry);
const items = (itemsData as ItemEntry[]).map(normalizeItemEntry);
const encounters = (encountersData as EncounterEntry[]).map(normalizeEncounterEntry);
const itemLocations = (itemLocationsData as ItemLocationEntry[]).map(normalizeItemLocationEntry);

validateCoreData({
  pokemon,
  locations,
  items,
  encounters,
  itemLocations,
});

export const corePokemon = pokemon;
export const coreLocations = locations;
export const coreItems = items;
export const coreEncounters = encounters;
export const coreItemLocations = itemLocations;
