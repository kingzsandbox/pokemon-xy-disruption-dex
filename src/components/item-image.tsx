"use client";

import ReferenceImage from "./reference-image";
import { getItemImageSources } from "../lib/assets";
import type { ItemEntry } from "../lib/types";

type ItemImageProps = {
  item: ItemEntry;
  size: number;
  framed?: boolean;
};

export default function ItemImage({ item, size, framed = false }: ItemImageProps) {
  const image = getItemImageSources(item);
  const frameSize = size + 16;

  if (!framed) {
    return (
      <ReferenceImage
        src={image.src}
        fallbackSrc={image.fallbackSrc}
        alt={item.name}
        width={size}
        height={size}
        style={{ display: "block" }}
      />
    );
  }

  return (
    <div
      style={{
        width: `${frameSize}px`,
        height: `${frameSize}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "14px",
        background: "linear-gradient(180deg, #f8fafe 0%, #edf2fb 100%)",
        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
      }}
    >
      <ReferenceImage
        src={image.src}
        fallbackSrc={image.fallbackSrc}
        alt={item.name}
        width={size}
        height={size}
        style={{ display: "block" }}
      />
    </div>
  );
}
