import { coreMoves } from "@/lib/data/core";
import type { MoveEntry } from "@/lib/types";

const moves = coreMoves as MoveEntry[];
const movesById = new Map(moves.map((entry) => [entry.id, entry]));
const movesBySlug = new Map(moves.map((entry) => [entry.slug, entry]));
const movesByName = new Map(moves.map((entry) => [entry.name.toLowerCase(), entry]));

export function getMoves(): MoveEntry[] {
  return moves;
}

export function getMoveById(id: string): MoveEntry | undefined {
  return movesById.get(id);
}

export function getMoveBySlug(slug: string): MoveEntry | undefined {
  return movesBySlug.get(slug);
}

export function getMoveByName(name: string): MoveEntry | undefined {
  return movesByName.get(name.toLowerCase());
}
