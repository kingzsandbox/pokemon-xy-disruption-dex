import HomeShell from "./home-shell";
import { getAbilities } from "../lib/data/abilities";
import { getBattles } from "../lib/data/battles";
import { getMachineBrowseEntries } from "../lib/data/compatibility";
import { getBrowseItems } from "../lib/data/items";
import { getLocations } from "../lib/data/locations";
import { getMoves } from "../lib/data/moves";
import { getBrowsablePokedexPokemon } from "../lib/data/pokemon";
import { getPokemonSpriteSrcById } from "../lib/data/pokemon-sprites";
import { getLevelCaps } from "../lib/data/systems";
import { getMoveEffectSummary, getPokemonAbilitySummaryEntries } from "../lib/data/vanilla";

type HomePageProps = {
  searchParams: Promise<{
    tab?: string;
    focus?: string;
  }>;
};

const validTabs = new Set([
  "pokedex",
  "locations",
  "items",
  "moves",
  "machines",
  "abilities",
  "battles",
  "level-caps",
]);

export default async function HomePage({ searchParams }: HomePageProps) {
  const { tab, focus } = await searchParams;
  const activeTab = validTabs.has(tab ?? "") ? tab ?? "pokedex" : "pokedex";

  const pokemon =
    activeTab === "pokedex"
      ? getBrowsablePokedexPokemon().map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          dexNumber: entry.dexNumber,
          name: entry.name,
          types: entry.types,
          abilities: getPokemonAbilitySummaryEntries(entry),
          spriteSrc: getPokemonSpriteSrcById(entry.id) ?? null,
          baseStats: entry.baseStats,
        }))
      : [];

  const locations =
    activeTab === "locations"
      ? getLocations().map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          name: entry.name,
          region: entry.region,
        }))
      : [];

  const items =
    activeTab === "items"
      ? getBrowseItems().map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          name: entry.name,
          category: entry.category,
          description: entry.description,
        }))
      : [];

  const moves =
    activeTab === "moves"
      ? getMoves().map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          name: entry.name,
          type: entry.type,
          category: entry.category,
          power: entry.power,
          accuracy: entry.accuracy,
          pp: entry.pp,
          effectSummary: getMoveEffectSummary(entry.id) ?? "No effect summary listed.",
        }))
      : [];

  const machines =
    activeTab === "machines"
      ? getMachineBrowseEntries().map(({ machine, move, compatibilityCount, location }) => ({
          id: machine.id,
          slug: machine.slug,
          code: machine.code,
          moveName: move?.name ?? machine.name.split(" - ")[1] ?? machine.name,
          location: location?.name ?? machine.location,
          compatibilityCount,
        }))
      : [];

  const abilities =
    activeTab === "abilities"
      ? getAbilities().map((entry) => ({
          id: entry.id,
          slug: entry.slug,
          name: entry.name,
          description: entry.description,
        }))
      : [];

  const battles = activeTab === "battles" ? getBattles() : [];

  const levelCaps =
    activeTab === "level-caps"
      ? getLevelCaps().map((entry) => ({
          id: entry.id,
          trainer: entry.trainer,
          location: entry.location,
          level: entry.level,
        }))
      : [];

  return (
    <HomeShell
      pokemon={pokemon}
      locations={locations}
      items={items}
      moves={moves}
      machines={machines}
      abilities={abilities}
      battles={battles}
      levelCaps={levelCaps}
      activeTab={activeTab as
        | "pokedex"
        | "locations"
        | "items"
        | "moves"
        | "machines"
        | "abilities"
        | "battles"
        | "level-caps"}
      focusedSlug={focus ?? null}
    />
  );
}

