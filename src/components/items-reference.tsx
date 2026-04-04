"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ItemImage from "./item-image";
import { getItemDisplayCategory, getItemDisplayDescription, getItemDisplayName, type BrowseItemEntry, type ItemDisplayCategory } from "../lib/data/items";

type ItemsReferenceProps = {
  items: BrowseItemEntry[];
};

const categoryOrder: Array<"all" | ItemDisplayCategory> = [
  "all",
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

export default function ItemsReference({ items }: ItemsReferenceProps) {
  const [activeCategory, setActiveCategory] = useState<"all" | ItemDisplayCategory>("all");

  const visibleItems = useMemo(
    () =>
      activeCategory === "all"
        ? items
        : items.filter((item) => getItemDisplayCategory(item) === activeCategory),
    [activeCategory, items],
  );

  const groupedItems = useMemo(
    () =>
      visibleItems.reduce<Map<string, BrowseItemEntry[]>>((groups, item) => {
        const displayCategory = getItemDisplayCategory(item);
        const group = groups.get(displayCategory) ?? [];
        group.push(item);
        groups.set(displayCategory, group);
        return groups;
      }, new Map()),
    [visibleItems],
  );

  const sections = [...groupedItems.entries()].sort(
    (left, right) =>
      categoryOrder.indexOf(left[0] as "all" | ItemDisplayCategory) -
      categoryOrder.indexOf(right[0] as "all" | ItemDisplayCategory),
  );

  const visibleFilters = categoryOrder.filter(
    (category) =>
      category === "all" ||
      items.some((item) => getItemDisplayCategory(item) === category),
  );

  return (
    <>
      <nav
        aria-label="Item category filters"
        style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "24px", marginBottom: "24px" }}
      >
        {visibleFilters.map((category) => {
          const active = category === activeCategory;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              style={{
                padding: "8px 12px",
                borderRadius: "999px",
                border: active ? "1px solid var(--accent-border)" : "1px solid var(--border-soft)",
                color: active ? "var(--button-text)" : "var(--text-body)",
                background: active ? "var(--accent)" : "var(--surface-card)",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              {category === "all" ? "All" : category}
            </button>
          );
        })}
      </nav>

      <div style={{ display: "grid", gap: "24px" }}>
        {sections.map(([category, entries]) => (
          <section key={category}>
            <h2 style={{ marginTop: 0, marginBottom: "12px" }}>{category}</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {entries.map((item) => (
                <Link
                  key={item.id}
                  href={`/items/${item.slug}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "64px 1fr",
                    alignItems: "center",
                    gap: "16px",
                    padding: "16px",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "14px",
                    background: "var(--surface-card)",
                  }}
                >
                  <ItemImage item={item} size={48} framed />
                  <span>
                    <strong>{getItemDisplayName(item)}</strong>
                    <div style={{ color: "var(--text-muted)", marginTop: "6px" }}>{getItemDisplayDescription(item)}</div>
                  </span>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}
