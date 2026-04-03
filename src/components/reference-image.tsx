"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";

type ReferenceImageProps = {
  src: string | null;
  fallbackSrc?: string | null;
  alt: string;
  width: number;
  height: number;
  style?: CSSProperties;
};

export default function ReferenceImage({
  src,
  fallbackSrc = null,
  alt,
  width,
  height,
  style,
}: ReferenceImageProps) {
  const [currentSrc, setCurrentSrc] = useState(src ?? fallbackSrc ?? "");

  useEffect(() => {
    setCurrentSrc(src ?? fallbackSrc ?? "");
  }, [src, fallbackSrc]);

  return currentSrc ? (
    <img
      src={currentSrc}
      alt={alt}
      width={width}
      height={height}
      loading="lazy"
      onError={() => {
        if (fallbackSrc && currentSrc !== fallbackSrc) {
          setCurrentSrc(fallbackSrc);
        }
      }}
      style={style}
    />
  ) : null;
}
