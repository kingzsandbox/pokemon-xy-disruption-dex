import { getMoveByName } from '@/lib/data/moves';
import { getTrainerImageSrcByCanonicalRule, getTrainerImageSrcById, getTrainerImageSrcByManifestReuse } from '@/lib/data/trainer-images';
import type { ItemEntry, PokemonEntry } from '@/lib/types';
import { getItemImageReference } from '@/lib/data/item-images';
import { getPokemonSpriteSrcById } from '@/lib/data/pokemon-sprites';

type TrainerImageTarget = {
  trainerId: string;
  trainerSlug?: string | null;
  ruleset?: string | null;
  source?: string | null;
  location?: string | null;
  trainerName?: string | null;
};

export type TrainerPortraitLayout = 'single' | 'duo';

function encodeSvg(svg: string): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function fallbackItemSvg(background: string): string {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="18" fill="${background}" />
    </svg>
  `);
}

function fallbackPanelSvg(background: string): string {
  return encodeSvg(`
    <svg xmlns="http://www.w3.org/2000/svg" width="96" height="96" viewBox="0 0 96 96">
      <rect width="96" height="96" rx="18" fill="${background}" />
      <rect x="18" y="18" width="60" height="60" rx="14" fill="rgba(255,255,255,0.18)" />
    </svg>
  `);
}

const pokemonFallbackPanel = fallbackPanelSvg('#d7dee9');
const boxLinkImageSrc = '/sprites/items/box-link-pc.png';

function normalizeAssetSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function isLikelyDuoName(name: string | null | undefined): boolean {
  if (!name) {
    return false;
  }

  return (
    name.includes(' & ') ||
    name.includes(' / ') ||
    name.includes('Calem / Serena') ||
    name.includes('Grunts (') ||
    name.startsWith('Twins ') ||
    name.includes('Family ')
  );
}

function determineTrainerPortraitLayout(trainerName: string | null | undefined): TrainerPortraitLayout {
  if (isLikelyDuoName(trainerName)) {
    return 'duo';
  }

  return 'single';
}

function extractMachineLabel(item: Pick<ItemEntry, 'name'>): { code: string; moveName: string | null } | null {
  const match = item.name.match(/^(TM|HM)\d+\s*\[(.+)\]$/i);
  if (!match) {
    return null;
  }

  return {
    code: match[1].toUpperCase() + item.name.match(/\d+/)?.[0],
    moveName: match[2]?.trim() ?? null,
  };
}

function getMachineItemImageSrc(item: Pick<ItemEntry, 'name'>): string {
  const machine = extractMachineLabel(item);
  const move = machine?.moveName ? getMoveByName(machine.moveName) : undefined;
  const type = normalizeAssetSlug(move?.type ?? 'Normal');
  return `/sprites/tm-types/${type}.png`;
}

export function getPokemonPrimaryArt(pokemon: PokemonEntry): {
  src: string;
  shinySrc: string | null;
  fallbackSrc: string | null;
} {
  const workbookSprite = getPokemonSpriteSrcById(pokemon.id) ?? null;
  const isFormVariant =
    pokemon.name.includes('(') ||
    pokemon.id === 'pokemon-0386' ||
    pokemon.id === 'pokemon-0678';

  if (isFormVariant) {
    return {
      src: workbookSprite ?? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.dexNumber}.png`,
      shinySrc: null,
      fallbackSrc: pokemonFallbackPanel,
    };
  }

  return {
    src: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vi/x-y/${pokemon.dexNumber}.png`,
    shinySrc: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-vi/x-y/shiny/${pokemon.dexNumber}.png`,
    fallbackSrc: workbookSprite ?? pokemonFallbackPanel,
  };
}

export function getPokemonMiniSprite(pokemon: Pick<PokemonEntry, 'id' | 'dexNumber'>): string | null {
  return (
    getPokemonSpriteSrcById(pokemon.id) ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.dexNumber}.png`
  );
}

export function getPokemonMiniSpriteSources(
  pokemon: Pick<PokemonEntry, 'id' | 'dexNumber'>,
): { src: string | null; fallbackSrc: string } {
  return {
    src: getPokemonMiniSprite(pokemon),
    fallbackSrc: pokemonFallbackPanel,
  };
}

export function getBattlePokemonImageSources(
  pokemon: Pick<PokemonEntry, 'id' | 'dexNumber'> | null,
): { src: string | null; fallbackSrc: string } {
  return {
    src: pokemon ? getPokemonMiniSprite(pokemon) : null,
    fallbackSrc: pokemonFallbackPanel,
  };
}

export function getItemImageSources(item: ItemEntry): { src: string | null; fallbackSrc: string } {
  const reference = getItemImageReference(item);
  const machine = extractMachineLabel(item);

  if (item.slug === 'box-link') {
    return {
      src: boxLinkImageSrc,
      fallbackSrc: boxLinkImageSrc,
    };
  }

  if (machine) {
    const machineSrc = getMachineItemImageSrc(item);
    return {
      src: machineSrc,
      fallbackSrc: machineSrc,
    };
  }

  return {
    src: reference?.resolvedImageSrc ?? null,
    fallbackSrc: fallbackItemSvg('#5b7bb6'),
  };
}

export function getTrainerImageSources(target: TrainerImageTarget): {
  src: string | null;
  layout: TrainerPortraitLayout;
} {
  const src =
    getTrainerImageSrcById(target.trainerId) ??
    getTrainerImageSrcByCanonicalRule(target.trainerName) ??
    getTrainerImageSrcByManifestReuse(target.trainerId, target.trainerName);
  return {
    src,
    layout: determineTrainerPortraitLayout(target.trainerName),
  };
}
