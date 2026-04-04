import { getMoveByName } from './data/moves';
import { getTrainerImageSrcByCanonicalRule, getTrainerImageSrcById, getTrainerImageSrcByManifestReuse } from './data/trainer-images';
import type { ItemEntry, PokemonEntry } from './types';
import { getItemImageReference } from './data/item-images';
import { getPokemonSpriteSrcById } from './data/pokemon-sprites';

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
const mysteriousCandyImageSrc = '/sprites/items/mysterious-candy.png';

const moveTutorPortraits = {
  laverrePledge: '/sprites/trainers-workbook/singles-xy-trainers-lass-anna-45-santalune-forest.png',
  snowbelleUltimate: '/sprites/trainers-workbook/singles-xy-trainers-artist-pierre-90-route-7-west.png',
  snowbelleMythical: '/sprites/trainers-workbook/singles-xy-trainers-ace-trainer-adelbert-65-route-22.png',
  route21DracoMeteor: '/sprites/trainers-workbook/singles-xy-trainers-black-belt-cadoc-104-route-8-cliffside.png',
} as const;

function normalizeAssetSlug(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const supplementalItemSpriteOverrides: Record<string, string> = {
  "adventure-rules": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/town-map.png",
  nugget: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/nugget.png",
  pearl: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/pearl.png",
  "big-pearl": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/big-pearl.png",
  stardust: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/stardust.png",
  "star-piece": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/star-piece.png",
  "relic-band": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-band.png",
  "relic-copper": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-copper.png",
  "relic-silver": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-silver.png",
  "relic-gold": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-gold.png",
  "relic-vase": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-vase.png",
  "relic-crown": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-crown.png",
  "relic-statue": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/relic-statue.png",
  bicycle: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/bicycle.png",
  "dowsing-machine": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dowsing-machine.png",
  "exp-share": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/exp-share.png",
  "good-rod": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/good-rod.png",
  "dna-splicers": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dna-splicers.png",
  "old-rod": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/old-rod.png",
  "super-rod": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/super-rod.png",
  "mega-ring": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/mega-ring.png",
  "town-map": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/town-map.png",
  "vs-recorder": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/vs-recorder.png",
  "holo-caster": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/tea.png",
  "lens-case": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/scope-lens.png",
  "deep-sea-tooth": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/deep-sea-tooth.png",
  "kings-rock": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/kings-rock.png",
  sachet: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/sachet.png",
  "whipped-dream": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/whipped-dream.png",
  protector: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/protector.png",
  electirizer: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/electirizer.png",
  magmarizer: "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/magmarizer.png",
  "reaper-cloth": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/reaper-cloth.png",
  "dubious-disc": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/dubious-disc.png",
  "razor-fang": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/razor-fang.png",
  "x-attack": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-attack.png",
  "x-defense": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-defense.png",
  "x-sp-atk": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-sp-atk.png",
  "x-sp-def": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-sp-def.png",
  "x-speed": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-speed.png",
  "x-accuracy": "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/x-accuracy.png",
};

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

  if (item.slug === 'mysterious-candy') {
    return {
      src: mysteriousCandyImageSrc,
      fallbackSrc: mysteriousCandyImageSrc,
    };
  }

  if (machine) {
    const machineSrc = getMachineItemImageSrc(item);
    return {
      src: machineSrc,
      fallbackSrc: machineSrc,
    };
  }

  const remoteSpriteSrc =
    supplementalItemSpriteOverrides[item.slug] ??
    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${normalizeAssetSlug(item.slug)}.png`;

  return {
    src: reference?.resolvedImageSrc ?? remoteSpriteSrc,
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

export function getMoveTutorImageSource(machineCode: string, locationName: string | null | undefined): string | null {
  const normalizedCode = machineCode.trim().toUpperCase();
  const normalizedLocation = (locationName ?? '').trim().toLowerCase();

  if (normalizedLocation === 'laverre city') {
    return moveTutorPortraits.laverrePledge;
  }

  if (normalizedLocation === 'route 21') {
    return moveTutorPortraits.route21DracoMeteor;
  }

  if (normalizedLocation === 'snowbelle city') {
    if (normalizedCode === 'MT07' || normalizedCode === 'MT08') {
      return moveTutorPortraits.snowbelleMythical;
    }

    return moveTutorPortraits.snowbelleUltimate;
  }

  return null;
}
