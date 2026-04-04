import itemObtainSupplementalData from "../../../public/data/item-obtain-supplemental.json";
import itemObtainVanillaFallbackData from "../../../public/data/item-obtain-vanilla-fallback.json";
import evolutionLinksData from "../../../public/data/pokemon-evolutions.json";
import { coreEncounters, coreItemLocations, coreItems, coreMachines, corePickupEntries } from "./core";
import { getLocationById, getLocationByName } from "./locations";
import { getPokemonById } from "./pokemon";
import type {
  EncounterEntry,
  ItemEntry,
  ItemLocationEntry,
  ItemLocationReference,
  LocatedItem,
  MachineEntry,
  PokemonEvolutionLink,
  PickupEntry,
} from "../types";

export type BrowseItemEntry = ItemEntry & {
  displayCategoryOverride?: ItemDisplayCategory;
  displayDescriptionOverride?: string;
  sortFamilyOverride?: string;
  sortOrderOverride?: number;
};

const supplementalBrowseItems: ItemEntry[] = [
  {
    id: "item-adventure-rules",
    slug: "adventure-rules",
    name: "Adventure Rules",
    category: "Key Item",
    description: "A handbook for a new Trainer's journey around Kalos.",
  },
  {
    id: "item-bicycle",
    slug: "bicycle",
    name: "Bicycle",
    category: "Key Item",
    description: "A folding bicycle that enables a rider to get around much faster than with Running Shoes.",
  },
  {
    id: "item-dowsing-machine",
    slug: "dowsing-machine",
    name: "Dowsing Machine",
    category: "Key Item",
    description: "It checks for unseen items in the area and makes noise and lights when it finds something.",
  },
  {
    id: "item-exp-share",
    slug: "exp-share",
    name: "Exp. Share",
    category: "Key Item",
    description: "A device that lets all party Pokémon gain experience after battle, even if they did not fight.",
  },
  {
    id: "item-good-rod",
    slug: "good-rod",
    name: "Good Rod",
    category: "Key Item",
    description: "A good, high-performance Fishing Rod for catching Pokémon.",
  },
  {
    id: "item-old-rod",
    slug: "old-rod",
    name: "Old Rod",
    category: "Key Item",
    description: "An old and beat-up Fishing Rod for catching Pokémon.",
  },
  {
    id: "item-super-rod",
    slug: "super-rod",
    name: "Super Rod",
    category: "Key Item",
    description: "An awesome, high-tech Fishing Rod for catching Pokémon.",
  },
  {
    id: "item-mega-ring",
    slug: "mega-ring",
    name: "Mega Ring",
    category: "Key Item",
    description: "This bracelet contains an untold power that somehow enables Pokémon carrying Mega Stones to Mega Evolve.",
  },
  {
    id: "item-dna-splicers",
    slug: "dna-splicers",
    name: "DNA Splicers",
    category: "Key Item",
    description: "A splicer that fuses Kyurem with a certain Pokémon. They are said to have once been one in the beginning.",
  },
  {
    id: "item-holo-caster",
    slug: "holo-caster",
    name: "Holo Caster",
    category: "Key Item",
    description: "A device that projects hologram messages and keeps track of Trainer communications.",
  },
  {
    id: "item-lens-case",
    slug: "lens-case",
    name: "Lens Case",
    category: "Key Item",
    description: "A case for storing decorative contact lenses used around Kalos.",
  },
  {
    id: "item-town-map",
    slug: "town-map",
    name: "Town Map",
    category: "Key Item",
    description: "A very convenient map that can be viewed anytime. It even shows your present location in the region.",
  },
  {
    id: "item-vs-recorder",
    slug: "vs-recorder",
    name: "Vs. Recorder",
    category: "Key Item",
    description: "A device that records battle videos and Battle Maison matches for later playback.",
  },
  {
    id: "item-deep-sea-tooth",
    slug: "deep-sea-tooth",
    name: "Deep Sea Tooth",
    category: "Held Item",
    description: "An item to be held by Clamperl. A fang that gleams a sharp silver, it raises the holder's Sp. Atk stat.",
  },
  {
    id: "item-x-attack",
    slug: "x-attack",
    name: "X Attack",
    category: "Battle Item",
    description: "An item that raises the Attack stat of a Pokémon in battle. It wears off if the Pokémon is withdrawn.",
  },
  {
    id: "item-x-defense",
    slug: "x-defense",
    name: "X Defense",
    category: "Battle Item",
    description: "An item that raises the Defense stat of a Pokémon in battle. It wears off if the Pokémon is withdrawn.",
  },
  {
    id: "item-x-sp-atk",
    slug: "x-sp-atk",
    name: "X Sp. Atk",
    category: "Battle Item",
    description: "An item that raises the Sp. Atk stat of a Pokémon in battle. It wears off if the Pokémon is withdrawn.",
  },
  {
    id: "item-x-sp-def",
    slug: "x-sp-def",
    name: "X Sp. Def",
    category: "Battle Item",
    description: "An item that raises the Sp. Def stat of a Pokémon in battle. It wears off if the Pokémon is withdrawn.",
  },
  {
    id: "item-x-speed",
    slug: "x-speed",
    name: "X Speed",
    category: "Battle Item",
    description: "An item that raises the Speed stat of a Pokémon in battle. It wears off if the Pokémon is withdrawn.",
  },
  {
    id: "item-x-accuracy",
    slug: "x-accuracy",
    name: "X Accuracy",
    category: "Battle Item",
    description: "An item that raises the Accuracy stat of a Pokémon in battle. It wears off if the Pokémon is withdrawn.",
  },
  {
    id: "item-nugget",
    slug: "nugget",
    name: "Nugget",
    category: "Valuable",
    description: "A nugget of pure gold that can be sold at a high price.",
  },
  {
    id: "item-pearl",
    slug: "pearl",
    name: "Pearl",
    category: "Valuable",
    description: "A rather small pearl that can be sold at a high price.",
  },
  {
    id: "item-big-pearl",
    slug: "big-pearl",
    name: "Big Pearl",
    category: "Valuable",
    description: "A quite large pearl that can be sold at a high price.",
  },
  {
    id: "item-stardust",
    slug: "stardust",
    name: "Stardust",
    category: "Valuable",
    description: "Beautiful, red sand that can be sold at a high price.",
  },
  {
    id: "item-star-piece",
    slug: "star-piece",
    name: "Star Piece",
    category: "Valuable",
    description: "A shard of a pretty gem that can be sold at a high price.",
  },
  {
    id: "item-relic-copper",
    slug: "relic-copper",
    name: "Relic Copper",
    category: "Valuable",
    description: "An ancient copper coin that can be sold at a high price.",
  },
  {
    id: "item-relic-silver",
    slug: "relic-silver",
    name: "Relic Silver",
    category: "Valuable",
    description: "An ancient silver ornament that can be sold at a high price.",
  },
  {
    id: "item-relic-gold",
    slug: "relic-gold",
    name: "Relic Gold",
    category: "Valuable",
    description: "An ancient gold ornament that can be sold at a high price.",
  },
  {
    id: "item-relic-vase",
    slug: "relic-vase",
    name: "Relic Vase",
    category: "Valuable",
    description: "An ancient vase that can be sold at a high price.",
  },
  {
    id: "item-relic-crown",
    slug: "relic-crown",
    name: "Relic Crown",
    category: "Valuable",
    description: "An ancient crown that can be sold at a high price.",
  },
  {
    id: "item-relic-statue",
    slug: "relic-statue",
    name: "Relic Statue",
    category: "Valuable",
    description: "An ancient statue that can be sold at a high price.",
  },
  {
    id: "item-kings-rock",
    slug: "kings-rock",
    name: "King's Rock",
    category: "Held Item",
    description: "An item to be held by a Pokémon. It may cause the target to flinch when the holder's attacks hit.",
  },
  {
    id: "item-sachet",
    slug: "sachet",
    name: "Sachet",
    category: "Evolution Item",
    description: "A sachet filled with fragrant perfumes. It is loved by a certain Pokémon.",
  },
  {
    id: "item-whipped-dream",
    slug: "whipped-dream",
    name: "Whipped Dream",
    category: "Evolution Item",
    description: "A soft and sweet treat made of fluffy, puffy, whipped cream. It is loved by a certain Pokémon.",
  },
  {
    id: "item-protector",
    slug: "protector",
    name: "Protector",
    category: "Evolution Item",
    description: "A protective item of some sort. It is extremely stiff and heavy. It is loved by a certain Pokémon.",
  },
  {
    id: "item-electirizer",
    slug: "electirizer",
    name: "Electirizer",
    category: "Evolution Item",
    description: "A box packed with a tremendous amount of electric energy. It is loved by a certain Pokémon.",
  },
  {
    id: "item-magmarizer",
    slug: "magmarizer",
    name: "Magmarizer",
    category: "Evolution Item",
    description: "A box packed with a tremendous amount of magma energy. It is loved by a certain Pokémon.",
  },
  {
    id: "item-reaper-cloth",
    slug: "reaper-cloth",
    name: "Reaper Cloth",
    category: "Evolution Item",
    description: "A cloth imbued with horrifyingly strong spiritual energy. It is loved by a certain Pokémon.",
  },
  {
    id: "item-dubious-disc",
    slug: "dubious-disc",
    name: "Dubious Disc",
    category: "Evolution Item",
    description: "A transparent device overflowing with questionable data. It is loved by a certain Pokémon.",
  },
  {
    id: "item-razor-fang",
    slug: "razor-fang",
    name: "Razor Fang",
    category: "Held Item",
    description: "An item to be held by a Pokémon. It may cause the target to flinch when the holder's attacks hit.",
  },
];

const items = [
  ...coreItems.filter((item) => item.slug !== "wide-lenss"),
  ...supplementalBrowseItems.filter((supplementalItem) => !coreItems.some((item) => item.slug === supplementalItem.slug)),
] as ItemEntry[];
const itemLocations = coreItemLocations as ItemLocationEntry[];
const pickupEntries = corePickupEntries as PickupEntry[];
const encounters = coreEncounters as EncounterEntry[];
const machines = coreMachines as MachineEntry[];
const supplementalObtainEntries = itemObtainSupplementalData as SupplementalItemObtainEntry[];
const vanillaFallbackEntries = itemObtainVanillaFallbackData as SupplementalItemObtainEntry[];
const itemsById = new Map(items.map((entry) => [entry.id, entry]));
const itemsBySlug = new Map(items.map((entry) => [entry.slug, entry]));
const evolutionLinks = evolutionLinksData as PokemonEvolutionLink[];

export type ItemDisplayCategory =
  | "Key Items"
  | "Evolution Items"
  | "Mega Stones"
  | "Held Items"
  | "Poke Balls"
  | "Medicines"
  | "Modifier Items"
  | "Battle Items"
  | "Berry"
  | "Valuables";

const truePokeBallNames = new Set(
  [
    "Master Ball",
    "Ultra Ball",
    "Great Ball",
    "Poke Ball",
    "Safari Ball",
    "Net Ball",
    "Dive Ball",
    "Nest Ball",
    "Repeat Ball",
    "Timer Ball",
    "Luxury Ball",
    "Premier Ball",
    "Dusk Ball",
    "Heal Ball",
    "Quick Ball",
    "Cherish Ball",
  ].map((entry) => entry.toLowerCase()),
);

const evolutionItemNames = new Set(
  [
    "Oval Stone",
    "Sun Stone",
    "Moon Stone",
    "Fire Stone",
    "Water Stone",
    "Thunder Stone",
    "Leaf Stone",
    "Shiny Stone",
    "Dusk Stone",
    "Dawn Stone",
    "King's Rock",
    "Dragon Scale",
    "Prism Scale",
    "Sachet",
    "Whipped Dream",
    "Protector",
    "Electirizer",
    "Magmarizer",
    "Reaper Cloth",
    "Dubious Disc",
    "Razor Fang",
    "King's Rock",
    "Metal Coat",
    "Deep Sea Tooth",
    "Deep Sea Scale",
    "Razor Claw",
  ].map((entry) => entry.toLowerCase()),
);

const modifierItemNames = new Set(
  [
    "PP Up",
    "PP Max",
    "Rare Candy",
    "Mysterious Candy",
    "HP Up",
    "Protein",
    "Iron",
    "Calcium",
    "Zinc",
    "Carbos",
    "Ability Capsule",
    "Health Wing",
    "Muscle Wing",
    "Resist Wing",
    "Genius Wing",
    "Clever Wing",
    "Swift Wing",
  ].map((entry) => entry.toLowerCase()),
);

const valuableItemNames = new Set(
  [
    "Nugget",
    "Big Nugget",
    "Pearl",
    "Big Pearl",
    "Pearl String",
    "Stardust",
    "Star Piece",
    "Comet Shard",
    "Big Mushroom",
    "Tiny Mushroom",
    "Balm Mushroom",
    "Rare Bone",
    "Heart Scale",
    "Relic Band",
    "Relic Copper",
    "Relic Silver",
    "Relic Gold",
    "Relic Vase",
    "Relic Crown",
    "Relic Statue",
  ].map((entry) => entry.toLowerCase()),
);

const medicineKeywords = [
  "restores 20 hp",
  "restores 50 hp",
  "restores 60 hp",
  "restores 80 hp",
  "restores 200 hp",
  "restore the pp",
  "restore 10 pp",
  "restore 5 pp",
  "fully restore the pp",
  "fully restores the hp",
  "revives a fainted pokémon",
  "heals all the status problems",
  "heals any status problem",
  "medicine",
  "medicinal herb",
];

const battleOnlyKeywords = [
  "used only once",
  "wears off if the pokémon is withdrawn",
  "raises the power of",
  "raised in battle",
  "single-use item",
  "allows the holder to immediately use a move that normally requires a turn to charge",
  "restore any lowered stat in battle",
  "snaps the holder out of infatuation",
];

const explicitCategoryOverrides: Record<string, ItemDisplayCategory> = {
  "white-herb": "Battle Items",
  "power-herb": "Battle Items",
  "mental-herb": "Battle Items",
  "lucky-punch": "Held Items",
  "scope-lens": "Held Items",
  "razor-claw": "Held Items",
  "razor-fang": "Held Items",
  "heart-scale": "Valuables",
  "metal-coat": "Held Items",
  "dragon-scale": "Evolution Items",
  "deep-sea-tooth": "Held Items",
  "deep-sea-scale": "Held Items",
  "relic-band": "Valuables",
  "sacred-ash": "Medicines",
};
const descriptionOverrides: Record<string, string> = {
  "box-link": "A key device that lets you access your PC Boxes from the field.",
  "relic-band": "A heavy bracelet made by an ancient civilization about 3,000 years ago. It can be sold at a high price.",
};

const displayCategoryOrder: ItemDisplayCategory[] = [
  "Key Items",
  "Evolution Items",
  "Mega Stones",
  "Held Items",
  "Medicines",
  "Modifier Items",
  "Battle Items",
  "Poke Balls",
  "Berry",
  "Valuables",
];

function normalizeItemName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getNormalizedDisplayName(item: Pick<ItemEntry, "name">): string {
  return normalizeItemName(getItemDisplayName(item));
}

function isHeldEffectItem(item: Pick<ItemEntry, "name" | "category" | "description">): boolean {
  const description = item.description.trim().toLowerCase();
  return (
    /an item to be held by|if held by a pokémon|when held, it strengthens|when held, this item|raises the holder|boosts the holder|boosts the power|slightly boosts the accuracy|holder's attacks hit|the holder's attacks hit|lets the bearer move first occasionally|extends the duration/.test(
      description,
    ) || item.category === "Held Item"
  );
}

function isConsumableBattleItem(item: Pick<ItemEntry, "name" | "category" | "description">): boolean {
  const description = item.description.trim().toLowerCase();
  return (
    battleOnlyKeywords.some((keyword) => description.includes(keyword)) ||
    (item.category === "Battle Item" && !isHeldEffectItem(item))
  );
}

function getEvolutionLinksForItem(itemName: string): PokemonEvolutionLink[] {
  return evolutionLinks.filter((link) => link.method.toLowerCase().includes(`[${itemName.toLowerCase()}]`));
}

function formatPokemonNameList(pokemonNames: string[]): string {
  if (pokemonNames.length === 1) {
    return pokemonNames[0];
  }

  if (pokemonNames.length === 2) {
    return `${pokemonNames[0]} and ${pokemonNames[1]}`;
  }

  return `${pokemonNames.slice(0, -1).join(", ")}, and ${pokemonNames[pokemonNames.length - 1]}`;
}

function getEvolutionDescriptionForItem(itemName: string): string | null {
  const relatedLinks = getEvolutionLinksForItem(itemName).filter(
    (link) => /^level up while holding /i.test(link.method) || /^use \[/i.test(link.method) || /\/ use \[/i.test(link.method),
  );
  if (relatedLinks.length === 0) {
    return null;
  }

  const useItemDescriptions = relatedLinks
    .filter((link) => /^use \[/i.test(link.method) || /\/ use \[/i.test(link.method))
    .map((link) => {
      const fromPokemon = getPokemonById(link.fromPokemonId);
      const toPokemon = getPokemonById(link.toPokemonId);
      if (!fromPokemon || !toPokemon) {
        return null;
      }

      const lowerMethod = link.method.toLowerCase();
      const qualifier = lowerMethod.includes("male")
        ? " male"
        : lowerMethod.includes("female")
          ? " female"
          : "";

      return `Use it on${qualifier} ${fromPokemon.name} to evolve it into ${toPokemon.name}.`;
    })
    .filter((entry): entry is string => entry !== null);

  if (useItemDescriptions.length > 0) {
    return useItemDescriptions.join(" ");
  }

  const descriptions = relatedLinks
    .filter((link) => /^level up while holding /i.test(link.method))
    .map((link) => {
      const fromPokemon = getPokemonById(link.fromPokemonId);
      const toPokemon = getPokemonById(link.toPokemonId);
      if (!fromPokemon || !toPokemon) {
        return null;
      }

      return `Levels up ${fromPokemon.name} into ${toPokemon.name} while it is holding this item.`;
    })
    .filter((entry): entry is string => entry !== null);

  if (descriptions.length === 0) {
    return null;
  }

  if (descriptions.length === 1) {
    return descriptions[0];
  }

  const groupedTargets = relatedLinks
    .map((link) => {
      const fromPokemon = getPokemonById(link.fromPokemonId);
      const toPokemon = getPokemonById(link.toPokemonId);
      if (!fromPokemon || !toPokemon) {
        return null;
      }
      return `${fromPokemon.name} into ${toPokemon.name}`;
    })
    .filter((entry): entry is string => entry !== null);

  return `Levels up ${formatPokemonNameList(groupedTargets)} while the Pokémon is holding this item.`;
}

function getItemFamilyGroupKey(item: Pick<ItemEntry, "name" | "slug" | "category" | "description">): string {
  const category = getItemDisplayCategory(item);
  const name = getNormalizedDisplayName(item);

  if (category === "Medicines" && /(potion|full restore|moomoo milk)/.test(name)) {
    return "potion";
  }

  if (category === "Medicines" && /(revive|revival herb)/.test(name)) {
    return "revive";
  }

  if (category === "Medicines" && /(ether|elixir)/.test(name)) {
    return "pp recovery";
  }

  if (category === "Modifier Items" && name.endsWith(" wing")) {
    return "wing";
  }

  if (
    category === "Modifier Items" &&
    new Set(["calcium", "carbos", "hp up", "pp up", "pp max", "iron", "zinc", "protein"]).has(name)
  ) {
    return "training booster";
  }

  if (category === "Evolution Items" && name.endsWith(" stone")) {
    return "stone";
  }

  if (category === "Battle Items" && (/^x /.test(name) || name === "guard spec." || name === "dire hit")) {
    return "x item";
  }

  if (category === "Battle Items" && name.endsWith(" gem")) {
    return "gem";
  }

  if (category === "Held Items" && name.endsWith(" incense")) {
    return "incense";
  }

  if (category === "Key Items" && name.endsWith(" rod")) {
    return "rod";
  }

  if (category === "Mega Stones") {
    return "mega stone";
  }

  return name;
}

function getItemFamilyMemberKey(item: Pick<ItemEntry, "name" | "slug" | "category" | "description">): string {
  const name = getNormalizedDisplayName(item);
  const familyKey = getItemFamilyGroupKey(item);

  if (familyKey === "incense") {
    return name.replace(/\s+incense$/, "").trim();
  }

  if (familyKey === "wing") {
    return name.replace(/\s+wing$/, "").trim();
  }

  if (familyKey === "training booster") {
    return name;
  }

  if (familyKey === "stone") {
    return name.replace(/\s+stone$/, "").trim();
  }

  if (familyKey === "gem") {
    return name.replace(/\s+gem$/, "").trim();
  }

  if (familyKey === "rod") {
    return name.replace(/\s+rod$/, "").trim();
  }

  return name;
}

export function isMachineItem(item: Pick<ItemEntry, "name" | "category">): boolean {
  return /^(tm|hm|mt)\d+/i.test(item.name) || /^(TM|HM|MT)$/i.test(item.category);
}

export function getItems(): ItemEntry[] {
  return items;
}

export function getBrowseItems(): ItemEntry[] {
  return buildBrowseItems()
    .filter((item) => !isMachineItem(item))
    .slice()
    .sort((left, right) => {
      const categoryCompare =
        displayCategoryOrder.indexOf(getItemDisplayCategory(left)) -
        displayCategoryOrder.indexOf(getItemDisplayCategory(right));
      if (categoryCompare !== 0) {
        return categoryCompare;
      }

      const groupCompare = getItemFamilyGroupKey(left).localeCompare(getItemFamilyGroupKey(right));
      if (groupCompare !== 0) {
        return groupCompare;
      }

      const sortOrderCompare = getItemCategorySortOrder(left) - getItemCategorySortOrder(right);
      if (sortOrderCompare !== 0) {
        return sortOrderCompare;
      }

      const familyMemberCompare = getItemFamilyMemberKey(left).localeCompare(getItemFamilyMemberKey(right));
      if (familyMemberCompare !== 0) {
        return familyMemberCompare;
      }

      return getItemDisplayName(left).localeCompare(getItemDisplayName(right));
    });
}

export function getItemById(id: string): ItemEntry | undefined {
  return itemsById.get(id);
}

export function getItemBySlug(slug: string): ItemEntry | undefined {
  return itemsBySlug.get(slug);
}

export function getMachineItemByCode(machineCode: string): ItemEntry | undefined {
  return items.find(
    (item) => item.name === machineCode || item.name.startsWith(`${machineCode} [`),
  );
}

export function getItemDisplayDescription(item: ItemEntry): string {
  const browseItem = item as BrowseItemEntry;
  if (browseItem.displayDescriptionOverride) {
    return browseItem.displayDescriptionOverride;
  }

  if (descriptionOverrides[item.slug]) {
    return descriptionOverrides[item.slug];
  }

  const evolutionDescription = getEvolutionDescriptionForItem(getItemDisplayName(item));
  if (evolutionDescription && getItemDisplayCategory(item) === "Evolution Items") {
    return evolutionDescription;
  }

  if (item.description.startsWith("Imported from ")) {
    return "No description listed.";
  }

  return item.description;
}

export function getItemDisplayName(item: Pick<ItemEntry, "name">): string {
  return item.name.replace(/\s*\[(.+?)\]/g, " $1").replace(/\s+/g, " ").trim();
}

export function getItemDisplayCategory(item: Pick<ItemEntry, "name" | "slug" | "category" | "description">): ItemDisplayCategory {
  const browseItem = item as BrowseItemEntry;
  if (browseItem.displayCategoryOverride) {
    return browseItem.displayCategoryOverride;
  }

  const name = getNormalizedDisplayName(item);
  const description = item.description.trim().toLowerCase();

  if (explicitCategoryOverrides[item.slug]) {
    return explicitCategoryOverrides[item.slug];
  }

  if (item.slug === "box-link" || item.category === "Key Item") {
    return "Key Items";
  }

  if (item.category === "Berry") {
    return "Berry";
  }

  if ((item.category === "Mega Stone" && name.includes("ite")) || /mega stone|mega evolve/.test(description)) {
    return "Mega Stones";
  }

  if (item.category === "Gem" || name.endsWith(" gem")) {
    return "Battle Items";
  }

  if (evolutionItemNames.has(name)) {
    return "Evolution Items";
  }

  if (
    modifierItemNames.has(name) ||
    /raise the maximum pp|raises the maximum pp|level by one|raises the base points|switches a pokémon's ability/.test(description)
  ) {
    return "Modifier Items";
  }

  if (
    item.category === "Medicine" ||
    medicineKeywords.some((keyword) => description.includes(keyword))
  ) {
    return "Medicines";
  }

  if (isConsumableBattleItem(item)) {
    return "Battle Items";
  }

  if (isHeldEffectItem(item)) {
    return "Held Items";
  }

  if (
    truePokeBallNames.has(name) ||
    item.category === "Poke Ball" ||
    /used for catching|comfortably encapsulating|a somewhat different pok[eé] ball|a quite rare pok[eé] ball/.test(description)
  ) {
    return "Poke Balls";
  }

  if (
    item.category === "Valuable" ||
    valuableItemNames.has(name) ||
    /can be sold at a high price|can be sold for a high price/.test(description)
  ) {
    return "Valuables";
  }

  return "Held Items";
}

function getItemCategorySortOrder(item: Pick<ItemEntry, "name" | "slug" | "category" | "description">): number {
  const browseItem = item as BrowseItemEntry;
  if (typeof browseItem.sortOrderOverride === "number") {
    return browseItem.sortOrderOverride;
  }

  const category = getItemDisplayCategory(item);
  const name = getNormalizedDisplayName(item);

  if (category === "Medicines") {
    const medicineRanks: Record<string, number> = {
      "potion": 1,
      "super potion": 2,
      "hyper potion": 3,
      "max potion": 4,
      "full restore": 5,
      "moomoo milk": 6,
      "revive": 10,
      "max revive": 11,
      "revival herb": 12,
      "ether": 20,
      "max ether": 21,
      "elixir": 22,
      "max elixir": 23,
    };

    if (medicineRanks[name] !== undefined) {
      return medicineRanks[name];
    }
  }

  if (category === "Key Items") {
    const rodRanks: Record<string, number> = {
      "old rod": 1,
      "good rod": 2,
      "super rod": 3,
    };

    if (rodRanks[name] !== undefined) {
      return rodRanks[name];
    }
  }

  return 999;
}

function buildBrowseItems(): BrowseItemEntry[] {
  const baseItems = items.filter((item) => !isMachineItem(item)).map((item) => ({ ...item })) as BrowseItemEntry[];
  const duplicatedRoleEntries: BrowseItemEntry[] = [];

  for (const baseItem of baseItems) {
    const displayName = getItemDisplayName(baseItem);
    const evolutionDescription = getEvolutionDescriptionForItem(displayName);
    if (!evolutionDescription) {
      continue;
    }

    if (getItemDisplayCategory(baseItem) !== "Evolution Items") {
      duplicatedRoleEntries.push({
        ...baseItem,
        id: `${baseItem.id}-evolution-items`,
        displayCategoryOverride: "Evolution Items",
        displayDescriptionOverride: evolutionDescription,
      });
    } else {
      baseItem.displayDescriptionOverride = evolutionDescription;
    }

    if (!isHeldEffectItem(baseItem)) {
      continue;
    }

    if (getItemDisplayCategory(baseItem) !== "Held Items") {
      duplicatedRoleEntries.push({
        ...baseItem,
        id: `${baseItem.id}-held-items`,
        displayCategoryOverride: "Held Items",
      });
    }
  }

  return [...baseItems, ...duplicatedRoleEntries];
}

export function getItemLocations(): ItemLocationEntry[] {
  return itemLocations;
}

export function getItemCoverageNote(): string {
  return "Imported item-location coverage currently includes shop inventory, trash can finds, and special placements such as Box Link. Comprehensive route and field pickup coverage is not present in the current source set.";
}

export function getItemLocationStatusMessage(hasLocations: boolean): string {
  if (hasLocations) {
    return "Imported location data is available below. Coverage currently includes shop inventory, trash can finds, and special placements only.";
  }

  return "No imported location references are available for this item. Current item-location imports only cover shop inventory, trash can finds, and special placements.";
}

export function getLocationItemStatusMessage(hasItems: boolean): string {
  if (hasItems) {
    return "Imported item-location data is available below. Coverage currently includes shop inventory, trash can finds, and special placements only.";
  }

  return "No imported item-location data is available for this area. Current item-location imports only cover shop inventory, trash can finds, and special placements.";
}

export function getItemsByLocation(locationId: string): LocatedItem[] {
  return itemLocations
    .filter((entry) => entry.locationId === locationId)
    .map((entry) => {
      const item = getItemById(entry.itemId);

      if (!item) {
        return undefined;
      }

      return {
        itemLocationId: entry.id,
        locationId: entry.locationId,
        notes: entry.notes,
        item,
      };
    })
    .filter((entry): entry is LocatedItem => entry !== undefined);
}

export function getLocationsByItem(itemId: string): ItemLocationReference[] {
  return itemLocations
    .filter((entry) => entry.itemId === itemId)
    .map((entry) => {
      const location = getLocationById(entry.locationId);

      if (!location) {
        return undefined;
      }

      return {
        itemLocationId: entry.id,
        notes: entry.notes,
        location,
      };
    })
    .filter((entry): entry is ItemLocationReference => entry !== undefined);
}

export type ItemObtainDetail = {
  itemLocationId: string;
  notes: string;
  locationName: string;
  locationSlug: string | null;
  method: string;
  detail: string | null;
  source: "internal" | "vanilla";
};

type SupplementalItemObtainEntry = {
  id: string;
  itemId: string;
  itemName: string;
  locationName: string;
  notes: string;
  source: "internal" | "vanilla";
};

type ItemObtainSourceEntry = {
  id: string;
  locationName: string;
  notes: string;
  source: "internal" | "vanilla";
};

function formatPriceLabel(value: string): string | null {
  const price = Number.parseFloat(value);
  return Number.isFinite(price) ? new Intl.NumberFormat("en-US").format(price) : null;
}

function cleanObtainDetail(notes: string): { method: string; detail: string | null } {
  const trimmed = notes.trim();
  const badgeShopMatch = trimmed.match(/^Shop - (\d+ Gym Badge(?:s)?|No Gym Badges?); price ([\d.]+)$/i);
  if (badgeShopMatch) {
    const priceLabel = formatPriceLabel(badgeShopMatch[2]);
    return {
      method: "Shop",
      detail: [badgeShopMatch[1], priceLabel].filter(Boolean).join(" • ") || null,
    };
  }

  const tmShopMatch = trimmed.match(/^Shop - TMs; price ([\d.]+)$/i);
  if (tmShopMatch) {
    const priceLabel = formatPriceLabel(tmShopMatch[1]);
    return { method: "TM Shop", detail: priceLabel ? `${priceLabel}` : null };
  }

  const genericShopMatch = trimmed.match(/^Shop - (.+?); price ([\d.]+)$/i);
  if (genericShopMatch) {
    const priceLabel = formatPriceLabel(genericShopMatch[2]);
    return {
      method: "Shop",
      detail: [genericShopMatch[1].trim(), priceLabel].filter(Boolean).join(" • ") || null,
    };
  }

  const shopMatch = trimmed.match(/^Shop - (.+)$/i);
  if (shopMatch) {
    return { method: "Shop", detail: shopMatch[1].trim() || null };
  }

  const vendorPriceMatch = trimmed.match(/^Vendor - (.+?); price ([\d.]+)$/i);
  if (vendorPriceMatch) {
    const priceLabel = formatPriceLabel(vendorPriceMatch[2]);
    return {
      method: "Facility Shop",
      detail: [vendorPriceMatch[1].trim(), priceLabel ? `${priceLabel} BP` : null].filter(Boolean).join(" • ") || null,
    };
  }

  const vendorMatch = trimmed.match(/^Vendor - (.+)$/i);
  if (vendorMatch) {
    return {
      method: "Facility Shop",
      detail: vendorMatch[1].trim() || null,
    };
  }

  const pickupMatch = trimmed.match(/^Pickup - (.+?);\s*(.+)$/i);
  if (pickupMatch) {
    return {
      method: "Pickup",
      detail: [pickupMatch[1].trim(), pickupMatch[2].trim()].filter(Boolean).join(" • ") || null,
    };
  }

  const wildHeldItemMatch = trimmed.match(/^Wild Held Item - (.+?);\s*(.+?);\s*(.+?);\s*(.+?)(?:;\s*Held by (.+))?$/i);
  if (wildHeldItemMatch) {
    return {
      method: "Wild Held Item",
      detail: [wildHeldItemMatch[5] ? `Held by ${wildHeldItemMatch[5]}` : null, wildHeldItemMatch[1], wildHeldItemMatch[2], wildHeldItemMatch[3], wildHeldItemMatch[4]]
        .filter(Boolean)
        .join(" • "),
    };
  }

  const moveTutorMatch = trimmed.match(/^Move Tutor - (.+)$/i);
  if (moveTutorMatch) {
    return {
      method: "Move Tutor",
      detail: moveTutorMatch[1].trim() || null,
    };
  }

  const machineMatch = trimmed.match(/^TM\/HM - (.+)$/i);
  if (machineMatch) {
    return {
      method: "TM/HM",
      detail: machineMatch[1].trim() || null,
    };
  }

  if (/^Gift/i.test(trimmed)) {
    return {
      method: "Gift",
      detail: trimmed.replace(/^Gift\s*-?\s*/i, "").trim() || null,
    };
  }

  if (/^Trash can/i.test(trimmed)) {
    return {
      method: "Trash Can",
      detail: trimmed.replace(/^Trash can\s*-?\s*/i, "").trim() || null,
    };
  }

  if (/berry tree/i.test(trimmed)) {
    return { method: "Berry Tree", detail: trimmed.replace(/;\s*hidden item/gi, "").trim() || null };
  }

  if (/hidden/i.test(trimmed)) {
    return {
      method: "Hidden Item",
      detail: trimmed.replace(/;\s*hidden item/gi, "").replace(/;\s*hidden/gi, "").trim() || null,
    };
  }

  return { method: "Found", detail: trimmed || null };
}

function getItemMachineEntries(item: ItemEntry): SupplementalItemObtainEntry[] {
  const matchingMachines = machines.filter(
    (machine) =>
      machine.name === item.name ||
      machine.code === item.name ||
      item.name.startsWith(`${machine.code} [`),
  );

  return matchingMachines.map((machine) => ({
    id: `machine-${machine.id}`,
    itemId: item.id,
    itemName: item.name,
    locationName: machine.location ?? "Move Tutor",
    notes:
      machine.kind === "mt"
        ? `Move Tutor - ${machine.code}`
        : `TM/HM - ${machine.code}`,
    source: "internal",
  }));
}

function getItemPickupEntries(item: ItemEntry): SupplementalItemObtainEntry[] {
  return pickupEntries
    .filter((entry) => entry.itemId === item.id)
    .map((entry) => ({
      id: `pickup-${entry.id}`,
      itemId: item.id,
      itemName: item.name,
      locationName: "Pickup",
      notes: `${entry.table === "common" ? "Pickup - Common Table" : "Pickup - Rare Table"}; ${entry.rateLabel}`,
      source: "internal",
    }));
}

function getItemEncounterEntries(item: ItemEntry): SupplementalItemObtainEntry[] {
  const entries: SupplementalItemObtainEntry[] = [];

  for (const encounter of encounters) {
    const heldItems = encounter.heldItems ?? [];
    const matchingHeldItem = heldItems.find((heldItem) => heldItem.itemName === item.name);
    if (!matchingHeldItem) {
      continue;
    }

    const location = getLocationById(encounter.locationId);
    const pokemon = getPokemonById(encounter.pokemonId);
    if (!location) {
      continue;
    }

    const levelLabel =
      encounter.minLevel === encounter.maxLevel
        ? `Lv. ${encounter.minLevel}`
        : `Lv. ${encounter.minLevel}-${encounter.maxLevel}`;
    const encounterRateLabel = `${encounter.rate}% encounter`;

    entries.push({
      id: `encounter-${encounter.id}`,
      itemId: item.id,
      itemName: item.name,
      locationName: location.name,
      notes: `Wild Held Item - ${encounter.method}; ${matchingHeldItem.chanceLabel}; ${encounterRateLabel}; ${levelLabel}${pokemon ? `; Held by ${pokemon.name}` : ""}`,
      source: "internal",
    });
  }

  return entries;
}

function parseObtainEntries(
  entries: ItemObtainSourceEntry[],
): ItemObtainDetail[] {
  const deduped = new Map<string, ItemObtainDetail>();

  for (const entry of entries) {
    const parsed = cleanObtainDetail(entry.notes);
    const location = getLocationByName(entry.locationName);
    const key = `${entry.locationName}::${parsed.method}::${parsed.detail ?? ""}`;

    if (deduped.has(key)) {
      continue;
    }

    deduped.set(key, {
      itemLocationId: entry.id,
      notes: entry.notes,
      locationName: entry.locationName,
      locationSlug: location?.slug ?? null,
      method: parsed.method,
      detail: parsed.detail,
      source: entry.source,
    });
  }

  return [...deduped.values()];
}

export function getItemObtainDetails(itemId: string): ItemObtainDetail[] {
  const item = getItemById(itemId);
  if (!item) {
    return [];
  }

  const internalEntries: ItemObtainSourceEntry[] = [
    ...getLocationsByItem(itemId).map((entry) => ({
      id: entry.itemLocationId,
      locationName: entry.location.name,
      notes: entry.notes,
      source: "internal" as const,
    })),
    ...supplementalObtainEntries
      .filter((entry) => entry.itemId === itemId && entry.source === "internal")
      .map((entry) => ({
        id: entry.id,
        locationName: entry.locationName,
        notes: entry.notes,
        source: "internal" as const,
      })),
    ...getItemPickupEntries(item),
    ...getItemEncounterEntries(item),
    ...getItemMachineEntries(item),
  ];

  const internalDetails = parseObtainEntries(internalEntries);
  if (internalDetails.length > 0) {
    return internalDetails;
  }

  return parseObtainEntries(
    vanillaFallbackEntries
      .filter((entry) => entry.itemId === itemId)
      .map((entry) => ({
        id: entry.id,
        locationName: entry.locationName,
        notes: entry.notes,
        source: "vanilla" as const,
      })),
  );
}

export type LocationItemSectionKey = "tm" | "shop" | "pickup" | "special";

export type LocationItemSection = {
  key: LocationItemSectionKey;
  title: string;
  items: LocatedItem[];
};

function getLocationItemSectionKey(entry: LocatedItem): LocationItemSectionKey {
  const notes = entry.notes.toLowerCase();

  if (entry.item.slug === "box-link") {
    return "special";
  }

  if (entry.item.category === "TM" || notes.startsWith("shop - tms")) {
    return "tm";
  }

  if (notes.startsWith("shop -")) {
    return "shop";
  }

  if (notes.startsWith("trash can") || notes.includes("hidden") || notes.startsWith("gift")) {
    return "pickup";
  }

  return "special";
}

export function getItemSectionsByLocation(locationId: string): LocationItemSection[] {
  const grouped = new Map<LocationItemSectionKey, LocatedItem[]>();

  for (const entry of getItemsByLocation(locationId)) {
    const key = getLocationItemSectionKey(entry);
    const itemsForKey = grouped.get(key) ?? [];
    itemsForKey.push(entry);
    grouped.set(key, itemsForKey);
  }

  const orderedSections: Array<{ key: LocationItemSectionKey; title: string }> = [
    { key: "tm", title: "TMs" },
    { key: "shop", title: "Shop Inventory" },
    { key: "pickup", title: "Pickups and Finds" },
    { key: "special", title: "Special Items" },
  ];

  return orderedSections
    .map(({ key, title }) => ({
      key,
      title,
      items: grouped.get(key) ?? [],
    }))
    .filter((section) => section.items.length > 0);
}
