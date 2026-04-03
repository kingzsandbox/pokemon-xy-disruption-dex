import itemImageReferenceData from "../../../public/data/item-images.json";
import type { ItemEntry } from "../types";

type ItemImageReference = {
  itemId: string;
  itemSlug: string;
  resolvedImageSrc: string | null;
  resolutionType: "real" | "mapped" | "fallback";
  reason: string;
  resolvedFrom: string | null;
};

const itemImageReferences = itemImageReferenceData as ItemImageReference[];
const itemImageById = new Map(itemImageReferences.map((entry) => [entry.itemId, entry]));

export function getItemImageReference(item: Pick<ItemEntry, "id">): ItemImageReference | undefined {
  return itemImageById.get(item.id);
}

