import vanillaMoveReferenceData from "../../../public/data/vanilla-move-reference.json";
import vanillaPokemonReferenceData from "../../../public/data/vanilla-pokemon-reference.json";
import type {
  BaseStats,
  PokemonAbilityDisplayRow,
  PokemonEntry,
  PokemonStatDisplayRow,
  VanillaMoveReference,
  VanillaPokemonReference,
} from "../types";

const vanillaPokemonReferences = vanillaPokemonReferenceData as VanillaPokemonReference[];
const vanillaMoveReferences = vanillaMoveReferenceData as VanillaMoveReference[];

const vanillaPokemonById = new Map(
  vanillaPokemonReferences.map((entry) => [entry.pokemonId, entry]),
);
const vanillaMoveById = new Map(vanillaMoveReferences.map((entry) => [entry.moveId, entry]));

export function getVanillaPokemonReference(pokemonId: string) {
  return vanillaPokemonById.get(pokemonId);
}

export function getVanillaMoveReference(moveId: string) {
  return vanillaMoveById.get(moveId);
}

export function getPokemonStatDisplayRows(pokemon: PokemonEntry): PokemonStatDisplayRow[] {
  const vanillaReference = getVanillaPokemonReference(pokemon.id);
  const statRows: Array<{ label: string; key: keyof BaseStats }> = [
    { label: "HP", key: "hp" },
    { label: "Attack", key: "attack" },
    { label: "Defense", key: "defense" },
    { label: "Sp. Atk", key: "specialAttack" },
    { label: "Sp. Def", key: "specialDefense" },
    { label: "Speed", key: "speed" },
  ];

  return statRows.map(({ label, key }) => {
    const value = pokemon.baseStats[key];
    const vanillaValue = vanillaReference?.baseStats[key] ?? null;

    return {
      label,
      value,
      delta: vanillaValue === null ? null : value - vanillaValue,
    };
  });
}

function normalizeAbilityName(value: string): string {
  return value.trim().toLowerCase();
}

export type PokemonAbilitySummaryEntry = {
  value: string;
  isHidden: boolean;
};

function dedupeAbilitySlots(slotEntries: PokemonAbilitySummaryEntry[]): PokemonAbilitySummaryEntry[] {
  const deduped: PokemonAbilitySummaryEntry[] = [];

  for (const entry of slotEntries) {
    const existing = deduped.find(
      (candidate) => normalizeAbilityName(candidate.value) === normalizeAbilityName(entry.value),
    );

    if (!existing) {
      deduped.push(entry);
      continue;
    }

    existing.isHidden = existing.isHidden && entry.isHidden;
  }

  return deduped;
}

export function getPokemonAbilitySummaryEntries(pokemon: PokemonEntry): PokemonAbilitySummaryEntry[] {
  const sourceSlots = pokemon.abilitySlots
    ? [
        pokemon.abilitySlots.ability1
          ? { value: pokemon.abilitySlots.ability1, isHidden: false }
          : null,
        pokemon.abilitySlots.ability2
          ? { value: pokemon.abilitySlots.ability2, isHidden: false }
          : null,
        pokemon.abilitySlots.hiddenAbility
          ? { value: pokemon.abilitySlots.hiddenAbility, isHidden: true }
          : null,
      ].filter((entry): entry is PokemonAbilitySummaryEntry => entry !== null)
    : [];

  if (sourceSlots.length > 0) {
    return dedupeAbilitySlots(sourceSlots);
  }

  return dedupeAbilitySlots(
    pokemon.abilities.map((value, index) => ({
      value,
      isHidden: index === 2,
    })),
  );
}

export function getPokemonAbilityDisplayRows(pokemon: PokemonEntry): PokemonAbilityDisplayRow[] {
  const sourceSummary = getPokemonAbilitySummaryEntries(pokemon);
  if (sourceSummary.length > 0) {
    if (sourceSummary.length === 1) {
      return [{ label: "Ability 1", value: sourceSummary[0].value }];
    }

    const rows: PokemonAbilityDisplayRow[] = [];
    let standardIndex = 0;

    for (const entry of sourceSummary) {
      if (entry.isHidden) {
        rows.push({ label: "Hidden Ability", value: entry.value });
        continue;
      }

      standardIndex += 1;
      rows.push({
        label: standardIndex === 1 ? "Ability 1" : "Ability 2",
        value: entry.value,
      });
    }

    return rows;
  }

  if (pokemon.abilitySlots) {
    const sourceBackedRows: PokemonAbilityDisplayRow[] = [];

    if (pokemon.abilitySlots.ability1) {
      sourceBackedRows.push({ label: "Ability 1", value: pokemon.abilitySlots.ability1 });
    }
    if (pokemon.abilitySlots.ability2) {
      sourceBackedRows.push({ label: "Ability 2", value: pokemon.abilitySlots.ability2 });
    }
    if (pokemon.abilitySlots.hiddenAbility) {
      sourceBackedRows.push({
        label: "Hidden Ability",
        value: pokemon.abilitySlots.hiddenAbility,
      });
    }

    if (sourceBackedRows.length > 0) {
      return sourceBackedRows;
    }
  }

  const vanillaReference = getVanillaPokemonReference(pokemon.id);
  const remainingAbilities = [...pokemon.abilities];
  const rows: PokemonAbilityDisplayRow[] = [];

  const slotCandidates: Array<{
    label: PokemonAbilityDisplayRow["label"];
    value: string | null;
  }> = [
    { label: "Ability 1", value: vanillaReference?.abilitySlots.ability1 ?? null },
    { label: "Ability 2", value: vanillaReference?.abilitySlots.ability2 ?? null },
    { label: "Hidden Ability", value: vanillaReference?.abilitySlots.hiddenAbility ?? null },
  ];

  for (const slot of slotCandidates) {
    if (!slot.value) {
      continue;
    }

    const matchingIndex = remainingAbilities.findIndex(
      (ability) => normalizeAbilityName(ability) === normalizeAbilityName(slot.value as string),
    );

    if (matchingIndex === -1) {
      continue;
    }

    const [matchedAbility] = remainingAbilities.splice(matchingIndex, 1);
    rows.push({ label: slot.label, value: matchedAbility });
  }

  if (rows.length === 0) {
    if (remainingAbilities[0]) {
      rows.push({ label: "Ability 1", value: remainingAbilities[0] });
    }
    if (remainingAbilities[1]) {
      rows.push({ label: "Ability 2", value: remainingAbilities[1] });
    }
    if (remainingAbilities[2]) {
      rows.push({ label: "Hidden Ability", value: remainingAbilities[2] });
    }
    return rows;
  }

  for (const ability of remainingAbilities) {
    if (!rows.some((row) => row.label === "Ability 1")) {
      rows.push({ label: "Ability 1", value: ability });
      continue;
    }

    if (!rows.some((row) => row.label === "Ability 2")) {
      rows.push({ label: "Ability 2", value: ability });
      continue;
    }

    if (!rows.some((row) => row.label === "Hidden Ability")) {
      rows.push({ label: "Hidden Ability", value: ability });
      continue;
    }
  }

  const labelOrder: Record<PokemonAbilityDisplayRow["label"], number> = {
    "Ability 1": 0,
    "Ability 2": 1,
    "Hidden Ability": 2,
  };

  return rows.sort((left, right) => labelOrder[left.label] - labelOrder[right.label]);
}

export function formatPokemonStatDelta(delta: number | null): string {
  if (!delta) {
    return "";
  }

  return delta > 0 ? ` (+${delta})` : ` (${delta})`;
}

export function getMoveEffectSummary(moveId: string): string | null {
  const summary = getVanillaMoveReference(moveId)?.effectSummary ?? null;

  if (!summary) {
    return null;
  }

  return summary
    .replace(/\s+In-Depth Effect:.*$/i, "")
    .replace(/\s+Secondary:\s+No effect\.$/i, "")
    .replace(/\.\./g, ".")
    .replace(/\s+/g, " ")
    .trim();
}
