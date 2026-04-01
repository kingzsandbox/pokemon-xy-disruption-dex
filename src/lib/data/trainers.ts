import { coreTrainers } from "@/lib/data/core";
import type { TrainerEntry } from "@/lib/types";

const trainers = coreTrainers as TrainerEntry[];
const trainersBySlug = new Map(trainers.map((entry) => [entry.slug, entry]));

export function getTrainers(): TrainerEntry[] {
  return trainers;
}

export function getTrainerBySlug(slug: string): TrainerEntry | undefined {
  return trainersBySlug.get(slug);
}
