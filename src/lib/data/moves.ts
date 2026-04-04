import { coreMoves } from "./core";
import type { MoveEntry } from "../types";

const allMoves = coreMoves as MoveEntry[];
const moves = allMoves.filter((entry) => entry.status !== "removed");
const movesById = new Map(moves.map((entry) => [entry.id, entry]));
const movesBySlug = new Map(moves.map((entry) => [entry.slug, entry]));
const movesByName = new Map(moves.map((entry) => [entry.name.toLowerCase(), entry]));
const removedMoveIds = new Set(allMoves.filter((entry) => entry.status === "removed").map((entry) => entry.id));
const removedMoveNames = new Set(
  allMoves
    .filter((entry) => entry.status === "removed")
    .map((entry) => entry.name.toLowerCase()),
);

export function getMoves(): MoveEntry[] {
  return moves;
}

export function getAllMoves(): MoveEntry[] {
  return allMoves;
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

export function isRemovedMoveId(id: string | null | undefined): boolean {
  return typeof id === "string" && removedMoveIds.has(id);
}

export function isRemovedMoveName(name: string | null | undefined): boolean {
  return typeof name === "string" && removedMoveNames.has(name.toLowerCase());
}

export function getMoveSourceCoverageNote(): string {
  return "The current move source workbook only provides availability status and notes. Type, category, power, accuracy, and PP are not present in the imported source set.";
}

export function hasImportedMoveBattleData(move: MoveEntry): boolean {
  return (
    move.type !== null ||
    move.category !== null ||
    move.power !== null ||
    move.accuracy !== null ||
    move.pp !== null
  );
}

export function getMoveFieldDisplay(value: number | string | null): string {
  return value === null ? "Unavailable in current source files" : String(value);
}

export function getMoveBattleDataRows(move: MoveEntry): Array<{ label: string; value: string }> {
  const rows = [
    move.type ? { label: "Type", value: move.type } : null,
    move.category ? { label: "Category", value: move.category } : null,
    move.power !== null ? { label: "Power", value: String(move.power) } : null,
    move.accuracy !== null ? { label: "Accuracy", value: String(move.accuracy) } : null,
    move.pp !== null ? { label: "PP", value: String(move.pp) } : null,
  ];

  return rows.filter((row): row is { label: string; value: string } => row !== null);
}
