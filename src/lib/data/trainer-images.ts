import trainerImagesData from "../../../public/data/trainer-images.json";

type TrainerImageReference = {
  trainerId: string;
  src: string;
  trainerName?: string | null;
};

const trainerImages = trainerImagesData as TrainerImageReference[];
const trainerImageById = new Map(trainerImages.map((entry) => [entry.trainerId, entry]));

function normalizeKey(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const trainerImageByCanonicalName = new Map<string, string>([
  [
    "shauna",
    "/sprites/trainers-workbook/singles-xy-trainers-shauna-137-aquacorde-town.png",
  ],
  [
    "pokemon-trainer-shauna",
    "/sprites/trainers-workbook/singles-xy-trainers-shauna-137-aquacorde-town.png",
  ],
  [
    "pokemon-trainer-tierno",
    "/sprites/trainers-workbook/singles-xy-trainers-pokemon-trainer-tierno-573-route-5.png",
  ],
  [
    "pokemon-trainer-trevor",
    "/sprites/trainers-workbook/singles-xy-trainers-pokemon-trainer-trevor-439-route-7-west.png",
  ],
  [
    "pokemon-professor-sycamore",
    "/sprites/trainers-workbook/singles-xy-trainers-pokemon-prof-sycamore-327-lumiose-city-south-boulevard.png",
  ],
  [
    "pokemon-prof-sycamore",
    "/sprites/trainers-workbook/singles-xy-trainers-pokemon-prof-sycamore-327-lumiose-city-south-boulevard.png",
  ],
  [
    "team-flare-boss-lysandre",
    "/sprites/trainers-workbook/singles-xy-trainers-team-flare-lysandre-303-lumiose-city-magenta-plaza.png",
  ],
  [
    "team-flare-lysandre",
    "/sprites/trainers-workbook/singles-xy-trainers-team-flare-lysandre-303-lumiose-city-magenta-plaza.png",
  ],
  [
    "pokemon-trainer-essentia",
    "/sprites/trainers-workbook/singles-xy-trainers-pokemon-trainer-essentia-511-emma-s-side-quest.png",
  ],
  [
    "pokemon-trainer-malva",
    "/sprites/trainers-workbook/singles-xy-trainers-elite-four-malva-269-pokemon-league.png",
  ],
  [
    "elite-four-malva",
    "/sprites/trainers-workbook/singles-xy-trainers-elite-four-malva-269-pokemon-league.png",
  ],
  [
    "elite-four-siebold",
    "/sprites/trainers-workbook/singles-xy-trainers-elite-four-siebold-271-pokemon-league.png",
  ],
  [
    "elite-four-wikstrom",
    "/sprites/trainers-workbook/singles-xy-trainers-elite-four-wikstrom-187-pokemon-league.png",
  ],
  [
    "elite-four-drasna",
    "/sprites/trainers-workbook/singles-xy-trainers-elite-four-drasna-270-pokemon-league.png",
  ],
  [
    "champion-diantha",
    "/sprites/trainers-workbook/singles-xy-trainers-champion-diantha-276-pokemon-league.png",
  ],
  [
    "pokemon-trainer-az",
    "/sprites/trainers-workbook/singles-xy-trainers-pokemon-trainer-az-602-lumiose-city.png",
  ],
  [
    "team-flare-celosia",
    "/sprites/trainers-workbook/singles-xy-trainers-team-flare-celosia-348-poke-ball-factory.png",
  ],
  [
    "team-flare-bryony",
    "/sprites/trainers-workbook/singles-xy-trainers-team-flare-bryony-350-poke-ball-factory.png",
  ],
  [
    "team-flare-mable",
    "/sprites/trainers-workbook/singles-xy-trainers-team-flare-mable-346-frost-cavern.png",
  ],
  [
    "team-flare-grunt",
    "/sprites/trainers-workbook/singles-xy-trainers-team-flare-grunt-107-glittering-cave.png",
  ],
  [
    "team-flare-admin",
    "/sprites/trainers-workbook/singles-xy-trainers-team-flare-admin-304-poke-ball-factory.png",
  ],
  [
    "calem-serena-604-607",
    "/sprites/trainers-workbook/singles-xy-trainers-calem-serena-435-596-na-route-7-west.png",
  ],
  [
    "calem-serena",
    "/sprites/trainers-workbook/singles-xy-trainers-calem-serena-435-596-na-route-7-west.png",
  ],
  [
    "calem-serena-605-608",
    "/sprites/trainers-workbook/singles-xy-trainers-calem-serena-435-596-na-route-7-west.png",
  ],
  [
    "calem-serena-606-609",
    "/sprites/trainers-workbook/singles-xy-trainers-calem-serena-435-596-na-route-7-west.png",
  ],
  [
    "poke-fan-family-jan-erin",
    "/sprites/trainers-workbook/singles-xy-trainers-poke-fan-family-jan-erin-69-route-6.png",
  ],
  [
    "poke-fan-agnes",
    "/sprites/trainers-workbook/singles-xy-trainers-poke-fan-agnes-68-route-4.png",
  ],
  [
    "poke-fan-gabe",
    "/sprites/trainers-workbook/singles-xy-trainers-poke-fan-gabe-67-route-4.png",
  ],
  [
    "garcon-georges-456-457",
    "/sprites/trainers-workbook/singles-xy-trainers-garcon-jacopo-564-lumiose-city-north.png",
  ],
  [
    "garcon-morris-291-292-450",
    "/sprites/trainers-workbook/singles-xy-trainers-garcon-jacopo-564-lumiose-city-north.png",
  ],
  [
    "garcon-morris-290-293-451",
    "/sprites/trainers-workbook/singles-xy-trainers-garcon-jacopo-564-lumiose-city-north.png",
  ],
  [
    "garcon-jacopo",
    "/sprites/trainers-workbook/singles-xy-trainers-garcon-jacopo-564-lumiose-city-north.png",
  ],
  [
    "baroness-renee",
    "/sprites/trainers-workbook/singles-battle-chateau-baroness-renee-227-battle-chateau.png",
  ],
  [
    "leader-grant",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-grant-76-cyllage-gym.png",
  ],
  [
    "leader-ramos",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-ramos-22-coumarine-gym.png",
  ],
  [
    "leader-clemont",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-clemont-23-lumiose-gym.png",
  ],
  [
    "leader-valerie",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-valerie-24-laverre-gym.png",
  ],
  [
    "leader-olympia",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-olympia-25-anistar-gym.png",
  ],
  [
    "leader-wulfric",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-wulfric-26-snowbelle-gym.png",
  ],
  [
    "leader-korrina",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-korrina-613-geosenge-town.png",
  ],
  [
    "marchioness-viola",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-viola-6-santalune-gym.png",
  ],
  [
    "marquis-grant",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-grant-76-cyllage-gym.png",
  ],
  [
    "marchioness-korrina",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-korrina-613-geosenge-town.png",
  ],
  [
    "marquis-ramos",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-ramos-22-coumarine-gym.png",
  ],
  [
    "marquis-clemont",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-clemont-23-lumiose-gym.png",
  ],
  [
    "marchioness-valerie",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-valerie-24-laverre-gym.png",
  ],
  [
    "marchioness-olympia",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-olympia-25-anistar-gym.png",
  ],
  [
    "marquis-wulfric",
    "/sprites/trainers-workbook/singles-xy-trainers-leader-wulfric-26-snowbelle-gym.png",
  ],
  [
    "grand-duchess-diantha",
    "/sprites/trainers-workbook/singles-xy-trainers-champion-diantha-276-pokemon-league.png",
  ],
  [
    "duchess-malva",
    "/sprites/trainers-workbook/singles-xy-trainers-elite-four-malva-269-pokemon-league.png",
  ],
  [
    "duke-siebold",
    "/sprites/trainers-workbook/singles-xy-trainers-elite-four-siebold-271-pokemon-league.png",
  ],
  [
    "duke-wikstrom",
    "/sprites/trainers-workbook/singles-xy-trainers-elite-four-wikstrom-187-pokemon-league.png",
  ],
  [
    "duchess-drasna",
    "/sprites/trainers-workbook/singles-xy-trainers-elite-four-drasna-270-pokemon-league.png",
  ],
]);

const rangerFemaleNames = new Set(
  [
    "pokemon-ranger-brooke",
    "pokemon-ranger-twiggy",
    "pokemon-ranger-melina",
    "pokemon-ranger-clementine",
    "pokemon-ranger-ambre",
    "pokemon-ranger-petra",
  ].map(normalizeKey),
);

const rangerMaleNames = new Set(
  [
    "pokemon-ranger-chaise",
    "pokemon-ranger-maurice",
    "pokemon-ranger-nash",
    "pokemon-ranger-reed",
    "pokemon-ranger-silas",
    "pokemon-ranger-dean",
    "pokemon-ranger-keith",
    "pokemon-ranger-pedro",
    "pokemon-ranger-lee",
    "pokemon-ranger-bjorn",
    "pokemon-ranger-shinobu",
    "pokemon-ranger-ralf",
  ].map(normalizeKey),
);

const pokeFanFemaleNames = new Set(
  [
    "poke-fan-abigail",
    "poke-fan-lydie",
    "poke-fan-tara",
    "poke-fan-roisin",
  ].map(normalizeKey),
);

const pokeFanMaleNames = new Set(["poke-fan-corey"].map(normalizeKey));

const breederFemaleNames = new Set(
  ["pokemon-breeder-amala", "pokemon-breeder-mercy"].map(normalizeKey),
);

const breederMaleNames = new Set(["pokemon-breeder-foster"].map(normalizeKey));

const classPortraitByKey = new Map<string, string>([
  ["pokemon-ranger-f", "/sprites/trainers-public/xy-pokemon-ranger-f.png"],
  ["pokemon-ranger-m", "/sprites/trainers-public/xy-pokemon-ranger-m.png"],
  ["poke-fan-f", "/sprites/trainers-public/xy-poke-fan-f.png"],
  ["poke-fan-m", "/sprites/trainers-public/xy-poke-fan-m.png"],
  ["pokemon-breeder-f", "/sprites/trainers-public/xy-pokemon-breeder-f.png"],
  ["pokemon-breeder-m", "/sprites/trainers-public/xy-pokemon-breeder-m.png"],
]);

function getCanonicalNameImageSrc(normalizedName: string): string | null {
  return trainerImageByCanonicalName.get(normalizedName) ?? null;
}

function getClassPortraitForName(normalizedName: string): string | null {
  if (rangerFemaleNames.has(normalizedName)) {
    return classPortraitByKey.get("pokemon-ranger-f") ?? null;
  }

  if (rangerMaleNames.has(normalizedName)) {
    return classPortraitByKey.get("pokemon-ranger-m") ?? null;
  }

  if (pokeFanFemaleNames.has(normalizedName)) {
    return classPortraitByKey.get("poke-fan-f") ?? null;
  }

  if (pokeFanMaleNames.has(normalizedName)) {
    return classPortraitByKey.get("poke-fan-m") ?? null;
  }

  if (breederFemaleNames.has(normalizedName)) {
    return classPortraitByKey.get("pokemon-breeder-f") ?? null;
  }

  if (breederMaleNames.has(normalizedName)) {
    return classPortraitByKey.get("pokemon-breeder-m") ?? null;
  }

  return null;
}

export function getTrainerImageSrcById(trainerId: string): string | null {
  return trainerImageById.get(trainerId)?.src ?? null;
}

export function getTrainerImageSrcByCanonicalRule(
  trainerName: string | null | undefined,
): string | null {
  if (!trainerName) {
    return null;
  }

  const normalizedName = normalizeKey(trainerName);
  return getCanonicalNameImageSrc(normalizedName) ?? getClassPortraitForName(normalizedName);
}

function getTrainerReuseKey(name: string | null | undefined): string | null {
  if (!name) {
    return null;
  }

  const normalizedName = normalizeKey(name);
  const explicitPrefixes = [
    "calem-serena",
    "team-flare-grunts",
    "team-flare-grunt",
    "team-flare-admin",
    "team-flare-boss-lysandre",
    "team-flare-celosia",
    "team-flare-bryony",
    "team-flare-aliana",
    "team-flare-mable",
    "pokemon-trainer-shauna",
    "pokemon-trainer-tierno",
    "pokemon-trainer-trevor",
    "pokemon-professor-sycamore",
    "pokemon-trainer-essentia",
    "pokemon-trainer-malva",
    "pokemon-trainer-az",
    "leader-",
    "marchioness-",
    "marquis-",
    "grand-duchess-",
    "grand-duke-",
  ];

  for (const prefix of explicitPrefixes) {
    if (normalizedName.startsWith(prefix)) {
      return prefix.endsWith("-") ? normalizedName : prefix;
    }
  }

  const classPrefixes = [
    "youngster",
    "lass",
    "schoolboy",
    "schoolgirl",
    "roller-skater",
    "preschooler",
    "gardener",
    "rising-star",
    "tourist",
    "backpacker",
    "fisherman",
    "swimmer",
    "sky-trainer",
    "psychic",
    "hiker",
    "battle-girl",
    "ace-trainer",
    "black-belt",
    "beauty",
    "chef",
    "hex-maniac",
    "fairy-tale-girl",
    "punk-guy",
    "punk-girl",
    "mysterious-sisters",
    "artist",
    "brains-brawn",
    "rangers",
    "twins",
    "worker",
    "veteran",
    "lumiose-gang-member",
    "suspicious-woman",
    "suspicious-child",
    "suspicious-lady",
    "scientist",
    "driver",
    "waitress",
    "owner",
    "furisode-girl",
    "garcon",
    "poke-fan",
    "pokemon-ranger",
    "pokemon-breeder",
    "elite-four",
    "champion",
    "baroness",
    "baron",
    "viscountess",
    "viscount",
    "countess",
    "count",
    "earl",
    "duchess",
    "duke",
    "marchioness",
    "marquis",
    "grand-duchess",
    "grand-duke",
  ];

  return classPrefixes.find((prefix) => normalizedName.startsWith(prefix)) ?? normalizedName;
}

export function getTrainerImageSrcByManifestReuse(
  trainerId: string,
  trainerName: string | null | undefined,
): string | null {
  const entry = trainerImageById.get(trainerId);
  if (!entry?.src) {
    return null;
  }

  const targetKey = getTrainerReuseKey(trainerName);
  if (!targetKey) {
    return null;
  }

  const srcKey = normalizeKey(entry.src);
  return srcKey.includes(targetKey) ? entry.src : null;
}
