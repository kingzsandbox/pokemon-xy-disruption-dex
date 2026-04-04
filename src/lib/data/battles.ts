import { getPokemonById } from './pokemon';
import { getTrainers } from './trainers';
import type { TrainerBattleFormat, TrainerEntry } from '../types';

export type BattleCategory =
  | 'regular'
  | 'rival'
  | 'gym_trainer'
  | 'gym_leader'
  | 'villain'
  | 'admin'
  | 'lysandre'
  | 'elite_four'
  | 'champion'
  | 'facility';

export type BattleFilter =
  | 'all'
  | 'rivals'
  | 'gyms'
  | 'team_flare'
  | 'elite_four'
  | 'champion'
  | 'optional';

export type BattleVariant = {
  id: string;
  trainerId: string;
  trainerSlug: string;
  source: TrainerEntry['source'];
  ruleset: TrainerEntry['ruleset'];
  format: TrainerBattleFormat;
  indexNumber: number | null;
  variantLabel: string;
  team: Array<{
    slot: number;
    pokemonId: string | null;
    pokemonName: string;
    level: number | null;
    ability: string | null;
    heldItem: string | null;
    moves: string[];
  }>;
};

export type BattleOccurrence = {
  id: string;
  slug: string;
  trainerName: string;
  trainerClass: string | null;
  location: string;
  section: string | null;
  category: BattleCategory;
  categoryLabel: string;
  optional: boolean;
  chronologyOrder: number;
  occurrenceKey: string;
  filters: BattleFilter[];
  variantKinds: string[];
  variants: BattleVariant[];
};

type BattleOccurrenceDraft = {
  id: string;
  slug: string;
  trainerName: string;
  trainerClass: string | null;
  location: string;
  section: string | null;
  category: BattleCategory;
  optional: boolean;
  occurrenceKey: string;
  firstSeenOrder: number;
  indexNumbers: number[];
  variants: BattleVariant[];
};

const rivalNames = ['shauna', 'calem / serena', 'pokemon trainer tierno', 'pokemon trainer trevor'];
const adminNames = ['aliana', 'bryony', 'celosia', 'mable', 'xerosic'];
const eliteFourNames = ['elite four malva', 'elite four drasna', 'elite four wikstrom', 'elite four siebold'];

function normalizeMatchValue(value: string): string {
  const repairedValue = value.includes('Ã') ? Buffer.from(value, 'latin1').toString('utf8') : value;
  return repairedValue
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function includesName(name: string, candidates: string[]): boolean {
  const normalizedName = normalizeMatchValue(name);
  return candidates.some((candidate) => normalizedName.includes(normalizeMatchValue(candidate)));
}

function isGymLeaderBattle(lowerName: string, lowerLocation: string): boolean {
  return lowerLocation.includes('gym') && lowerName.startsWith('leader ');
}

function isNonGymKorrinaBattle(lowerName: string, lowerLocation: string, source: TrainerEntry['source']): boolean {
  return lowerName.includes('korrina') && source !== 'battle-chateau' && !lowerLocation.includes('gym');
}

function getBattleCategory(trainer: TrainerEntry): BattleCategory {
  const lowerName = trainer.name.toLowerCase();
  const lowerLocation = trainer.location.toLowerCase();

  if (trainer.source === 'battle-chateau' || trainer.source === 'restaurants') {
    return 'facility';
  }

  if (isNonGymKorrinaBattle(lowerName, lowerLocation, trainer.source)) {
    return 'regular';
  }

  if (lowerName.includes('lysandre')) {
    return 'lysandre';
  }

  if (includesName(lowerName, adminNames) || lowerName.includes('team flare admin')) {
    return 'admin';
  }

  if (lowerName.includes('team flare')) {
    return 'villain';
  }

  if (lowerName.includes('champion diantha')) {
    return 'champion';
  }

  if (includesName(lowerName, eliteFourNames)) {
    return 'elite_four';
  }

  if (isGymLeaderBattle(lowerName, lowerLocation)) {
    return 'gym_leader';
  }

  if (lowerLocation.includes('gym')) {
    return 'gym_trainer';
  }

  if (includesName(lowerName, rivalNames)) {
    return 'rival';
  }

  return 'regular';
}

function getBattleCategoryLabel(category: BattleCategory): string {
  switch (category) {
    case 'rival':
      return 'Rivals & Friends';
    case 'gym_trainer':
      return 'Gym Trainer';
    case 'gym_leader':
      return 'Gym Leader';
    case 'villain':
      return 'Team Flare';
    case 'admin':
      return 'Team Flare Admin';
    case 'lysandre':
      return 'Lysandre';
    case 'elite_four':
      return 'Elite Four';
    case 'champion':
      return 'Champion';
    case 'facility':
      return 'Optional Facility';
    case 'regular':
    default:
      return 'Trainer';
  }
}

function getBattleFilters(category: BattleCategory): BattleFilter[] {
  const filters: BattleFilter[] = ['all'];

  switch (category) {
    case 'rival':
      filters.push('rivals');
      break;
    case 'gym_trainer':
    case 'gym_leader':
      filters.push('gyms');
      break;
    case 'villain':
    case 'admin':
    case 'lysandre':
      filters.push('team_flare');
      break;
    case 'elite_four':
      filters.push('elite_four');
      break;
    case 'champion':
      filters.push('champion');
      break;
    case 'facility':
      filters.push('optional');
      break;
    default:
      break;
  }

  return filters;
}

function getRulesetLabel(ruleset: TrainerEntry['ruleset']): string {
  return ruleset === 'singles' ? 'Singles' : 'Doubles';
}

function getGroupedTrainerName(name: string): string {
  return name.replace(/\s*\(\d+(?:\s*\/\s*\d+)*\)\s*$/g, '').trim();
}

const kalosStarterRules = [
  {
    starterFamily: new Set(['Chespin', 'Quilladin', 'Chesnaught']),
    playerChoice: 'Froakie',
    explanation: 'Water is weak to Grass.',
  },
  {
    starterFamily: new Set(['Fennekin', 'Braixen', 'Delphox']),
    playerChoice: 'Chespin',
    explanation: 'Grass is weak to Fire.',
  },
  {
    starterFamily: new Set(['Froakie', 'Frogadier', 'Greninja']),
    playerChoice: 'Fennekin',
    explanation: 'Fire is weak to Water.',
  },
];

function getKalosStarterVariantRule(variant: BattleVariant) {
  const teamNames = new Set(variant.team.map((member) => member.pokemonName));
  return kalosStarterRules.find((rule) => [...rule.starterFamily].some((name) => teamNames.has(name))) ?? null;
}

function getRivalVariantLabel(trainerName: string, variant: BattleVariant): string | null {
  const normalizedTrainerName = normalizeMatchValue(trainerName);
  const starterRule = getKalosStarterVariantRule(variant);

  if (!starterRule) {
    return null;
  }

  if (normalizedTrainerName.includes('shauna')) {
    return `If ${starterRule.playerChoice} is chosen`;
  }

  if (normalizedTrainerName.includes('calem / serena')) {
    return `If ${starterRule.playerChoice} is chosen`;
  }

  return null;
}

function getOccurrenceGroupingKey(trainer: TrainerEntry, category: BattleCategory): string {
  if (category === "rival") {
    return [
      trainer.source,
      trainer.location,
      trainer.section ?? "",
      getGroupedTrainerName(trainer.name),
      category,
    ].join("|");
  }

  return [
    trainer.source,
    trainer.location,
    trainer.section ?? '',
    trainer.name,
    category,
    trainer.indexNumber ?? 'no-index',
  ].join('|');
}

function getVariantDisplayNames(trainerName: string, variants: BattleVariant[]): string[] {
  if (variants.length <= 1) {
    return [''];
  }

  const rivalLabels = variants.map((variant) => getRivalVariantLabel(trainerName, variant));
  if (rivalLabels.every((label) => label && label.length > 0)) {
    return rivalLabels as string[];
  }

  const varyingSlots: number[] = [];
  const maxSlots = Math.max(...variants.map((variant) => variant.team.length));
  for (let slotIndex = 0; slotIndex < maxSlots; slotIndex += 1) {
    const species = new Set(
      variants.map((variant) => variant.team[slotIndex]?.pokemonName ?? '').filter(Boolean),
    );
    if (species.size > 1) {
      varyingSlots.push(slotIndex);
    }
  }

  return variants.map((variant, index) => {
    const labelParts = varyingSlots
      .map((slotIndex) => variant.team[slotIndex]?.pokemonName ?? '')
      .filter(Boolean);

    if (labelParts.length > 0) {
      return labelParts.join(' / ');
    }

    return `Variant ${index + 1}`;
  });
}

function buildVariant(trainer: TrainerEntry): BattleVariant {
  return {
    id: trainer.id,
    trainerId: trainer.id,
    trainerSlug: trainer.slug,
    source: trainer.source,
    ruleset: trainer.ruleset,
    format: trainer.format,
    indexNumber: trainer.indexNumber,
    variantLabel: '',
    team: trainer.team.map((member) => ({
      slot: member.slot,
      pokemonId: member.pokemonId,
      pokemonName: getPokemonById(member.pokemonId ?? '')?.name ?? member.pokemonName,
      level: member.level,
      ability: member.ability,
      heldItem: member.heldItem,
      moves: member.moves,
    })),
  };
}

function canMergeDrafts(left: BattleOccurrenceDraft, right: BattleOccurrenceDraft): boolean {
  if (left.category !== right.category) {
    return false;
  }

  if (left.location !== right.location || left.section !== right.section || left.trainerName !== right.trainerName) {
    return false;
  }

  if (!['rival', 'facility', 'gym_leader', 'admin', 'lysandre', 'elite_four', 'champion'].includes(left.category)) {
    return false;
  }

  const leftSingles = left.variants.filter((variant) => variant.ruleset === 'singles');
  const rightSingles = right.variants.filter((variant) => variant.ruleset === 'singles');
  const leftSample = leftSingles[0] ?? left.variants[0];
  const rightSample = rightSingles[0] ?? right.variants[0];

  if (!leftSample || !rightSample) {
    return false;
  }

  if (leftSample.team.length !== rightSample.team.length) {
    return false;
  }

  const leftLevels = leftSample.team.map((member) => member.level ?? 0).join(',');
  const rightLevels = rightSample.team.map((member) => member.level ?? 0).join(',');
  if (leftLevels !== rightLevels) {
    return false;
  }

  if (left.indexNumbers.length === 0 || right.indexNumbers.length === 0) {
    return false;
  }

  const maxLeft = Math.max(...left.indexNumbers);
  const minRight = Math.min(...right.indexNumbers);
  return minRight - maxLeft <= 2;
}

function mergeDrafts(drafts: BattleOccurrenceDraft[]): BattleOccurrenceDraft[] {
  const sorted = [...drafts].sort((left, right) => left.firstSeenOrder - right.firstSeenOrder);
  const merged: BattleOccurrenceDraft[] = [];

  for (const draft of sorted) {
    const previous = merged[merged.length - 1];
    if (previous && canMergeDrafts(previous, draft)) {
      previous.variants.push(...draft.variants);
      previous.indexNumbers.push(...draft.indexNumbers);
      continue;
    }

    merged.push({
      ...draft,
      indexNumbers: [...draft.indexNumbers],
      variants: [...draft.variants],
    });
  }

  return merged;
}

function finalizeOccurrence(
  draft: BattleOccurrenceDraft,
  chronologyOrder: number,
): BattleOccurrence {
  const groupedByRuleset = new Map<TrainerEntry['ruleset'], BattleVariant[]>();

  for (const variant of draft.variants) {
    const rulesetVariants = groupedByRuleset.get(variant.ruleset) ?? [];
    rulesetVariants.push(variant);
    groupedByRuleset.set(variant.ruleset, rulesetVariants);
  }

  const orderedVariants = ['singles', 'doubles'].flatMap((ruleset) => {
    const variants = groupedByRuleset.get(ruleset as TrainerEntry['ruleset']) ?? [];
    const labels = getVariantDisplayNames(draft.trainerName, variants);
    return variants.map((variant, index) => ({
      ...variant,
      variantLabel: labels[index] || getRulesetLabel(variant.ruleset),
    }));
  });

  return {
    id: draft.id,
    slug: draft.slug,
    trainerName: draft.trainerName,
    trainerClass: draft.trainerClass,
    location: draft.location,
    section: draft.section,
    category: draft.category,
    categoryLabel: getBattleCategoryLabel(draft.category),
    optional: draft.optional,
    chronologyOrder,
    occurrenceKey: draft.occurrenceKey,
    filters: getBattleFilters(draft.category),
    variantKinds: Array.from(new Set(orderedVariants.map((variant) => getRulesetLabel(variant.ruleset)))),
    variants: orderedVariants,
  };
}

export function getBattles(): BattleOccurrence[] {
  const trainers = getTrainers();
  const storyMap = new Map<string, BattleOccurrenceDraft>();
  const optionalMap = new Map<string, BattleOccurrenceDraft>();
  const storyDrafts: BattleOccurrenceDraft[] = [];
  const optionalDrafts: BattleOccurrenceDraft[] = [];

  trainers.forEach((trainer, index) => {
    const category = getBattleCategory(trainer);
    const optional = category === 'facility';
    const occurrenceKey = getOccurrenceGroupingKey(trainer, category);
    const targetMap = optional ? optionalMap : storyMap;
    const targetList = optional ? optionalDrafts : storyDrafts;

    let draft = targetMap.get(occurrenceKey);
    if (!draft) {
      draft = {
        id: `battle-occurrence-${targetList.length + 1}`,
        slug: trainer.slug,
        trainerName: category === 'rival' ? getGroupedTrainerName(trainer.name) : trainer.name,
        trainerClass: trainer.trainerClass,
        location: trainer.location,
        section: trainer.section,
        category,
        optional,
        occurrenceKey,
        firstSeenOrder: index + 1,
        indexNumbers: trainer.indexNumber !== null ? [trainer.indexNumber] : [],
        variants: [],
      };
      targetMap.set(occurrenceKey, draft);
      targetList.push(draft);
    }

    draft.variants.push(buildVariant(trainer));
  });

  const mergedStoryDrafts = mergeDrafts(storyDrafts);
  const mergedOptionalDrafts = mergeDrafts(optionalDrafts);

  const storyOccurrences = mergedStoryDrafts.map((draft, index) => finalizeOccurrence(draft, index + 1));
  const optionalOccurrences = mergedOptionalDrafts.map((draft, index) =>
    finalizeOccurrence(draft, 900001 + index),
  );

  return [...storyOccurrences, ...optionalOccurrences];
}
