import { getPokemonAbilitySummaryEntries } from "./data/vanilla";
import type { PokemonEntry } from "./types";

const typeChart: Record<string, Partial<Record<string, number>>> = {
  Normal: { Rock: 0.5, Ghost: 0, Steel: 0.5 },
  Fire: { Fire: 0.5, Water: 0.5, Grass: 2, Ice: 2, Bug: 2, Rock: 0.5, Dragon: 0.5, Steel: 2 },
  Water: { Fire: 2, Water: 0.5, Grass: 0.5, Ground: 2, Rock: 2, Dragon: 0.5 },
  Electric: { Water: 2, Electric: 0.5, Grass: 0.5, Ground: 0, Flying: 2, Dragon: 0.5 },
  Grass: {
    Fire: 0.5,
    Water: 2,
    Grass: 0.5,
    Poison: 0.5,
    Ground: 2,
    Flying: 0.5,
    Bug: 0.5,
    Rock: 2,
    Dragon: 0.5,
    Steel: 0.5,
  },
  Ice: { Fire: 0.5, Water: 0.5, Grass: 2, Ground: 2, Flying: 2, Dragon: 2, Steel: 0.5, Ice: 0.5 },
  Fighting: {
    Normal: 2,
    Ice: 2,
    Poison: 0.5,
    Flying: 0.5,
    Psychic: 0.5,
    Bug: 0.5,
    Rock: 2,
    Ghost: 0,
    Dark: 2,
    Steel: 2,
    Fairy: 0.5,
  },
  Poison: { Grass: 2, Poison: 0.5, Ground: 0.5, Rock: 0.5, Ghost: 0.5, Steel: 0, Fairy: 2 },
  Ground: { Fire: 2, Electric: 2, Grass: 0.5, Poison: 2, Flying: 0, Bug: 0.5, Rock: 2, Steel: 2 },
  Flying: { Electric: 0.5, Grass: 2, Fighting: 2, Bug: 2, Rock: 0.5, Steel: 0.5 },
  Psychic: { Fighting: 2, Poison: 2, Psychic: 0.5, Dark: 0, Steel: 0.5 },
  Bug: {
    Fire: 0.5,
    Grass: 2,
    Fighting: 0.5,
    Poison: 0.5,
    Flying: 0.5,
    Psychic: 2,
    Ghost: 0.5,
    Dark: 2,
    Steel: 0.5,
    Fairy: 0.5,
  },
  Rock: { Fire: 2, Ice: 2, Fighting: 0.5, Ground: 0.5, Flying: 2, Bug: 2, Steel: 0.5 },
  Ghost: { Normal: 0, Psychic: 2, Ghost: 2, Dark: 0.5 },
  Dragon: { Dragon: 2, Steel: 0.5, Fairy: 0 },
  Dark: { Fighting: 0.5, Psychic: 2, Ghost: 2, Dark: 0.5, Fairy: 0.5 },
  Steel: { Fire: 0.5, Water: 0.5, Electric: 0.5, Ice: 2, Rock: 2, Steel: 0.5, Fairy: 2 },
  Fairy: { Fire: 0.5, Fighting: 2, Poison: 0.5, Dragon: 2, Dark: 2, Steel: 0.5 },
};

type DefensiveAbilityRule = {
  apply: (attackingType: string, multiplier: number) => number;
  note: string;
};

const defensiveAbilityRules: Record<string, DefensiveAbilityRule> = {
  levitate: {
    apply: (attackingType, multiplier) => (attackingType === "Ground" ? 0 : multiplier),
    note: "Levitate grants Ground immunity.",
  },
  "water absorb": {
    apply: (attackingType, multiplier) => (attackingType === "Water" ? 0 : multiplier),
    note: "Water Absorb grants Water immunity.",
  },
  "volt absorb": {
    apply: (attackingType, multiplier) => (attackingType === "Electric" ? 0 : multiplier),
    note: "Volt Absorb grants Electric immunity.",
  },
  "lightning rod": {
    apply: (attackingType, multiplier) => (attackingType === "Electric" ? 0 : multiplier),
    note: "Lightning Rod grants Electric immunity.",
  },
  "motor drive": {
    apply: (attackingType, multiplier) => (attackingType === "Electric" ? 0 : multiplier),
    note: "Motor Drive grants Electric immunity.",
  },
  "storm drain": {
    apply: (attackingType, multiplier) => (attackingType === "Water" ? 0 : multiplier),
    note: "Storm Drain grants Water immunity.",
  },
  "dry skin": {
    apply: (attackingType, multiplier) => (attackingType === "Water" ? 0 : multiplier),
    note: "Dry Skin grants Water immunity.",
  },
  "sap sipper": {
    apply: (attackingType, multiplier) => (attackingType === "Grass" ? 0 : multiplier),
    note: "Sap Sipper grants Grass immunity.",
  },
  "flash fire": {
    apply: (attackingType, multiplier) => (attackingType === "Fire" ? 0 : multiplier),
    note: "Flash Fire grants Fire immunity.",
  },
  "thick fat": {
    apply: (attackingType, multiplier) =>
      attackingType === "Fire" || attackingType === "Ice" ? multiplier * 0.5 : multiplier,
    note: "Thick Fat halves Fire- and Ice-type damage.",
  },
  heatproof: {
    apply: (attackingType, multiplier) => (attackingType === "Fire" ? multiplier * 0.5 : multiplier),
    note: "Heatproof halves Fire-type damage.",
  },
  filter: {
    apply: (_attackingType, multiplier) => (multiplier > 1 ? multiplier * 0.75 : multiplier),
    note: "Filter reduces super-effective damage.",
  },
  "solid rock": {
    apply: (_attackingType, multiplier) => (multiplier > 1 ? multiplier * 0.75 : multiplier),
    note: "Solid Rock reduces super-effective damage.",
  },
  "prism armor": {
    apply: (_attackingType, multiplier) => (multiplier > 1 ? multiplier * 0.75 : multiplier),
    note: "Prism Armor reduces super-effective damage.",
  },
};

export const pokemonTypes = Object.keys(typeChart);

export type MatchupBucket = {
  label: string;
  multiplier: number;
  types: string[];
};

export type OffensiveMatchupSection = {
  label: string;
  buckets: MatchupBucket[];
};

export type MatchupAbilityNote = {
  ability: string;
  note: string;
};

export type MatchupAbilityState = {
  id: string;
  ability: string | null;
  note: string | null;
  defensiveMatchups: MatchupBucket[];
  offensiveMatchupSections: OffensiveMatchupSection[];
};

export type MatchupAbilityView = {
  showTabs: boolean;
  states: MatchupAbilityState[];
};

function getUniqueTypes(pokemon: PokemonEntry): string[] {
  return [...new Set(pokemon.types.filter(Boolean))];
}

function normalizeAbilityKey(value: string): string {
  return value.trim().toLowerCase();
}

function getAbilityRule(ability: string | null): DefensiveAbilityRule | null {
  if (!ability) {
    return null;
  }

  return defensiveAbilityRules[normalizeAbilityKey(ability)] ?? null;
}

function formatMultiplierLabel(multiplier: number): string {
  if (multiplier === 0) {
    return "No effect";
  }

  if (Number.isInteger(multiplier)) {
    return `${multiplier}x`;
  }

  return `${Number(multiplier.toFixed(2)).toString()}x`;
}

function getAttackMultiplier(attackingType: string, defendingTypes: string[]): number {
  return defendingTypes.reduce((multiplier, defendingType) => {
    const typeMultiplier = typeChart[attackingType]?.[defendingType] ?? 1;
    return multiplier * typeMultiplier;
  }, 1);
}

function groupTypesByMultiplier(entries: Array<{ type: string; multiplier: number }>): MatchupBucket[] {
  const groups = new Map<number, string[]>();

  for (const entry of entries) {
    const roundedMultiplier = Number(entry.multiplier.toFixed(2));
    const types = groups.get(roundedMultiplier) ?? [];
    types.push(entry.type);
    groups.set(roundedMultiplier, types);
  }

  return [...groups.entries()]
    .sort((left, right) => right[0] - left[0])
    .map(([multiplier, types]) => ({
      label: formatMultiplierLabel(multiplier),
      multiplier,
      types: types.sort((left, right) => left.localeCompare(right)),
    }));
}

function serializeBuckets(buckets: MatchupBucket[]): string {
  return buckets
    .map((bucket) => `${bucket.multiplier}:${bucket.types.join("|")}`)
    .join(";");
}

function getRelevantDefensiveAbilityRules(pokemon: PokemonEntry): MatchupAbilityNote[] {
  return getPokemonAbilitySummaryEntries(pokemon)
    .map((entry) => ({ ability: entry.value, rule: getAbilityRule(entry.value) }))
    .filter((entry): entry is { ability: string; rule: DefensiveAbilityRule } => Boolean(entry.rule))
    .map((entry) => ({
      ability: entry.ability,
      note: entry.rule.note,
    }));
}

function buildDefensiveMatchups(types: string[], ability: string | null): MatchupBucket[] {
  const abilityRule = getAbilityRule(ability);

  return groupTypesByMultiplier(
    pokemonTypes.map((attackingType) => {
      const baseMultiplier = getAttackMultiplier(attackingType, types);
      const multiplier = abilityRule ? abilityRule.apply(attackingType, baseMultiplier) : baseMultiplier;
      return {
        type: attackingType,
        multiplier,
      };
    }),
  ).filter((entry) => entry.multiplier !== 1);
}

function buildOffensiveBucketsForAttackingTypes(attackingTypes: string[]): MatchupBucket[] {
  const entries: Array<{ type: string; multiplier: number }> = [];

  for (const defendingType of pokemonTypes) {
    const multiplier = attackingTypes.reduce(
      (value, attackingType) => value * getAttackMultiplier(attackingType, [defendingType]),
      1,
    );

    if (multiplier !== 1) {
      entries.push({ type: defendingType, multiplier });
    }
  }

  return groupTypesByMultiplier(entries);
}

function buildOffensiveMatchupSections(pokemon: PokemonEntry): OffensiveMatchupSection[] {
  const types = getUniqueTypes(pokemon);
  const sections = types.map((type) => ({
    label: `${type}-type attacks`,
    buckets: buildOffensiveBucketsForAttackingTypes([type]),
  }));

  if (pokemon.slug === "hawlucha") {
    sections.push({
      label: "Flying Press",
      buckets: buildOffensiveBucketsForAttackingTypes(["Fighting", "Flying"]),
    });
  }

  return sections;
}

export function getMatchupAbilityNotes(pokemon: PokemonEntry): MatchupAbilityNote[] {
  return getRelevantDefensiveAbilityRules(pokemon);
}

export function getDefensiveMatchups(pokemon: PokemonEntry): MatchupBucket[] {
  const types = getUniqueTypes(pokemon);
  const abilityEntries = getPokemonAbilitySummaryEntries(pokemon);
  const primaryAbility = abilityEntries.length === 1 ? abilityEntries[0].value : null;
  return buildDefensiveMatchups(types, primaryAbility);
}

export function getOffensiveMatchups(pokemon: PokemonEntry): OffensiveMatchupSection[] {
  return buildOffensiveMatchupSections(pokemon);
}

export function getMatchupAbilityView(pokemon: PokemonEntry): MatchupAbilityView {
  const types = getUniqueTypes(pokemon);
  const offensiveMatchupSections = buildOffensiveMatchupSections(pokemon);
  const abilityEntries = getPokemonAbilitySummaryEntries(pokemon);

  if (abilityEntries.length === 0) {
    return {
      showTabs: false,
      states: [
        {
          id: "default",
          ability: null,
          note: null,
          defensiveMatchups: buildDefensiveMatchups(types, null),
          offensiveMatchupSections,
        },
      ],
    };
  }

  const states = abilityEntries.map((entry) => {
    const rule = getAbilityRule(entry.value);
    return {
      id: entry.value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      ability: entry.value,
      note: rule?.note ?? null,
      defensiveMatchups: buildDefensiveMatchups(types, entry.value),
      offensiveMatchupSections,
    };
  });

  const distinctProfiles = new Set(states.map((state) => serializeBuckets(state.defensiveMatchups)));
  const showTabs = states.length > 1 && distinctProfiles.size > 1;

  return {
    showTabs,
    states,
  };
}
