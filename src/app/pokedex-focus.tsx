"use client";

import { useEffect } from "react";

type PokedexFocusProps = {
  focusedSlug: string | null;
};

export default function PokedexFocus({ focusedSlug }: PokedexFocusProps) {
  useEffect(() => {
    if (!focusedSlug) {
      return;
    }

    const row = document.getElementById(`pokemon-row-${focusedSlug}`);
    if (!row) {
      return;
    }

    row.scrollIntoView({ block: "center" });
  }, [focusedSlug]);

  return null;
}
