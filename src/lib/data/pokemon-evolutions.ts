import evolutionLinksData from "../../../public/data/pokemon-evolutions.json";
import { getPokemonById } from "./pokemon";
import type { PokemonEvolutionLink, PokemonEntry } from "../types";

export type EvolutionTreeNode = {
  pokemon: PokemonEntry;
  children: Array<{
    method: string;
    node: EvolutionTreeNode;
  }>;
};

export type MegaEvolutionLink = {
  method: string;
  pokemon: PokemonEntry;
};

const rawEvolutionLinks = evolutionLinksData as PokemonEvolutionLink[];
const invalidEvolutionLinkIds = new Set([
  "evolution-pokemon-0120-to-pokemon-0230",
  "evolution-pokemon-0220-to-pokemon-0217",
]);
const correctedEvolutionLinks: PokemonEvolutionLink[] = [
  {
    id: "evolution-pokemon-0120-to-pokemon-0121-corrected",
    fromPokemonId: "pokemon-0120",
    toPokemonId: "pokemon-0121",
    method: "Use [Water Stone]",
  },
  {
    id: "evolution-pokemon-0220-to-pokemon-0221-corrected",
    fromPokemonId: "pokemon-0220",
    toPokemonId: "pokemon-0221",
    method: "Level Up [33]",
  },
];

function isMegaEvolutionMethod(method: string): boolean {
  return /^hold \[[^\]]+\]$/i.test(method);
}

function isMegaPokemon(pokemon: PokemonEntry | undefined): boolean {
  return Boolean(pokemon && /\(Mega /i.test(pokemon.name));
}

function isValidEvolutionLink(link: PokemonEvolutionLink): boolean {
  if (link.fromPokemonId === link.toPokemonId) {
    return false;
  }

  const fromPokemon = getPokemonById(link.fromPokemonId);
  const toPokemon = getPokemonById(link.toPokemonId);

  if (!fromPokemon || !toPokemon) {
    return false;
  }

  if (isMegaPokemon(fromPokemon) || isMegaPokemon(toPokemon) || isMegaEvolutionMethod(link.method)) {
    return false;
  }

  return true;
}

const evolutionLinks = [...rawEvolutionLinks.filter((link) => !invalidEvolutionLinkIds.has(link.id)), ...correctedEvolutionLinks]
  .filter(isValidEvolutionLink);
const linksByFromPokemonId = new Map<string, PokemonEvolutionLink[]>();
const linksByToPokemonId = new Map<string, PokemonEvolutionLink[]>();

for (const link of evolutionLinks) {
  const outgoing = linksByFromPokemonId.get(link.fromPokemonId) ?? [];
  outgoing.push(link);
  linksByFromPokemonId.set(link.fromPokemonId, outgoing);

  const incoming = linksByToPokemonId.get(link.toPokemonId) ?? [];
  incoming.push(link);
  linksByToPokemonId.set(link.toPokemonId, incoming);
}

function comparePokemon(left: PokemonEntry, right: PokemonEntry): number {
  if (left.dexNumber !== right.dexNumber) {
    return left.dexNumber - right.dexNumber;
  }

  return left.name.localeCompare(right.name);
}

function compareLinks(left: PokemonEvolutionLink, right: PokemonEvolutionLink): number {
  const leftPokemon = getPokemonById(left.toPokemonId);
  const rightPokemon = getPokemonById(right.toPokemonId);

  if (leftPokemon && rightPokemon) {
    return comparePokemon(leftPokemon, rightPokemon);
  }

  return left.method.localeCompare(right.method);
}

function formatEvolutionMethod(method: string): string {
  return method
    .replace(/^\/\s*/g, "")
    .replace(/\[([^\]]+)\]/g, "$1")
    .replace(/\s+/g, " ")
    .trim();
}

function getRelatedPokemonIds(pokemonId: string): string[] {
  const visited = new Set<string>();
  const queue = [pokemonId];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) {
      continue;
    }

    visited.add(current);

    for (const link of linksByFromPokemonId.get(current) ?? []) {
      if (!visited.has(link.toPokemonId)) {
        queue.push(link.toPokemonId);
      }
    }

    for (const link of linksByToPokemonId.get(current) ?? []) {
      if (!visited.has(link.fromPokemonId)) {
        queue.push(link.fromPokemonId);
      }
    }
  }

  return [...visited];
}

function buildNode(pokemonId: string, component: Set<string>, visiting: Set<string>): EvolutionTreeNode | null {
  const pokemon = getPokemonById(pokemonId);
  if (!pokemon || visiting.has(pokemonId)) {
    return null;
  }

  visiting.add(pokemonId);

  const children = (linksByFromPokemonId.get(pokemonId) ?? [])
    .filter((link) => component.has(link.toPokemonId))
    .sort(compareLinks)
    .map((link) => {
      const childNode = buildNode(link.toPokemonId, component, visiting);
      if (!childNode) {
        return null;
      }
      return {
        method: formatEvolutionMethod(link.method),
        node: childNode,
      };
    })
    .filter(
      (
        entry,
      ): entry is {
        method: string;
        node: EvolutionTreeNode;
      } => entry !== null,
    );

  visiting.delete(pokemonId);

  return {
    pokemon,
    children,
  };
}

export function getEvolutionLinks(): PokemonEvolutionLink[] {
  return evolutionLinks;
}

export function getMegaEvolutionLinks(pokemonId: string): MegaEvolutionLink[] {
  return rawEvolutionLinks
    .filter((link) => {
      const fromPokemon = getPokemonById(link.fromPokemonId);
      const toPokemon = getPokemonById(link.toPokemonId);
      if (!fromPokemon || !toPokemon) {
        return false;
      }

      return (
        link.fromPokemonId === pokemonId &&
        isMegaEvolutionMethod(link.method) &&
        isMegaPokemon(toPokemon) &&
        fromPokemon.dexNumber === toPokemon.dexNumber
      );
    })
    .sort(compareLinks)
    .map((link) => ({
      method: formatEvolutionMethod(link.method),
      pokemon: getPokemonById(link.toPokemonId)!,
    }));
}

export function getEvolutionTree(pokemonId: string): EvolutionTreeNode[] {
  const componentIds = getRelatedPokemonIds(pokemonId);
  const component = new Set(componentIds);

  const roots = componentIds
    .filter((id) => {
      const incoming = (linksByToPokemonId.get(id) ?? []).filter((link) => component.has(link.fromPokemonId));
      return incoming.length === 0;
    })
    .map((id) => getPokemonById(id))
    .filter((entry): entry is PokemonEntry => entry !== undefined)
    .sort(comparePokemon);

  const rootIds = roots.length > 0 ? roots.map((entry) => entry.id) : componentIds;

  return rootIds
    .map((id) => buildNode(id, component, new Set<string>()))
    .filter((entry): entry is EvolutionTreeNode => entry !== null);
}
