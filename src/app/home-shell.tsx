"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import BattlesReference from "../components/battles-reference";
import { MoveCategoryIcon, TypeBadgeList } from "../components/dex-visuals";
import ItemsReference from "../components/items-reference";
import ItemImage from "../components/item-image";
import PageNavigation from "../components/page-navigation";
import PokedexFocus from "./pokedex-focus";
import ReferenceImage from "../components/reference-image";
import { getHomePokemonHref } from "../lib/search";
import type { BattleOccurrence } from "../lib/data/battles";
import { getPokemonDisplayName } from "../lib/presentation";
import type { PokemonAbilitySummaryEntry } from "../lib/data/vanilla";
import type { ItemEntry } from "../lib/types";

type HomeTabKey =
  | "pokedex"
  | "locations"
  | "items"
  | "moves"
  | "machines"
  | "abilities"
  | "battles"
  | "level-caps";

type HomePokemonRow = {
  id: string;
  slug: string;
  dexNumber: number;
  name: string;
  types: string[];
  abilities: PokemonAbilitySummaryEntry[];
  spriteSrc: string | null;
  baseStats: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
};

type HomeLocationRow = {
  id: string;
  slug: string;
  name: string;
  region: string;
};

type HomeMoveRow = {
  id: string;
  slug: string;
  name: string;
  type: string | null;
  category: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  effectSummary: string;
};

type HomeMachineRow = {
  id: string;
  slug: string;
  code: string;
  moveName: string;
  moveType: string | null;
  location: string | null;
  compatibilityCount: number;
};

type HomeAbilityRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
};

type HomeLevelCapRow = {
  id: string;
  trainer: string;
  location: string;
  level: number;
};

type HomeShellProps = {
  pokemon: HomePokemonRow[];
  locations: HomeLocationRow[];
  items: ItemEntry[];
  moves: HomeMoveRow[];
  machines: HomeMachineRow[];
  abilities: HomeAbilityRow[];
  battles: BattleOccurrence[];
  levelCaps: HomeLevelCapRow[];
  activeTab: HomeTabKey;
  focusedSlug: string | null;
  pokemonFilter: "all" | "mega-only";
};

const tabs: Array<{ key: HomeTabKey; label: string; href?: string }> = [
  { key: "pokedex", label: "Pokedex" },
  { key: "locations", label: "Locations" },
  { key: "items", label: "Items" },
  { key: "moves", label: "All Moves" },
  { key: "machines", label: "TMs & HMs" },
  { key: "abilities", label: "Abilities" },
  { key: "battles", label: "Battles", href: "/battles" },
  { key: "level-caps", label: "Level Caps", href: "/systems" },
];

function getFallbackSpriteUrl(dexNumber: number): string {
  return `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${dexNumber}.png`;
}

function bst(stats: HomePokemonRow["baseStats"]): number {
  return (
    stats.hp +
    stats.attack +
    stats.defense +
    stats.specialAttack +
    stats.specialDefense +
    stats.speed
  );
}

function tableCellStyle(align: "left" | "center" | "right" = "left") {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid var(--border-soft)",
    textAlign: align,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  } as const;
}

function getMachineTypeIconSrc(type: string | null | undefined): string | null {
  if (!type) {
    return null;
  }

  return `/sprites/tm-types/${type.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
}

function CompactLinkList({
  rows,
}: {
  rows: Array<{ id: string; href: string; title: string; meta: string }>;
}) {
  return (
    <div style={{ display: "grid", gap: "8px" }}>
      {rows.map((row) => (
        <Link
          key={row.id}
          href={row.href}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr auto",
            alignItems: "center",
            gap: "16px",
            padding: "16px",
            border: "1px solid var(--border-soft)",
            borderRadius: "14px",
            background: "var(--surface-card)",
          }}
        >
          <span style={{ color: "var(--text-body)", fontWeight: 600 }}>{row.title}</span>
          <span style={{ color: "var(--text-muted)", textAlign: "right" }}>{row.meta}</span>
        </Link>
      ))}
    </div>
  );
}

function HomePokedexTable({
  pokemon,
  focusedSlug,
  pokemonFilter,
}: {
  pokemon: HomePokemonRow[];
  focusedSlug: string | null;
  pokemonFilter: "all" | "mega-only";
}) {
  const visiblePokemon =
    pokemonFilter === "mega-only"
      ? pokemon.filter((entry) => getPokemonDisplayName(entry).startsWith("Mega "))
      : pokemon;

  const allHref = "/?tab=pokedex";
  const megaOnlyHref = "/?tab=pokedex&mega=only";
  const pokemonColumnWidth = "300px";
  const pokemonCellInnerWidth = "248px";
  const typeColumnWidth = "128px";

  return (
    <div style={{ overflowX: "auto" }}>
      <nav
        aria-label="Pokédex filters"
        style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}
      >
        <Link
          href={allHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "38px",
            padding: "0 14px",
            borderRadius: "999px",
            border: pokemonFilter === "all" ? "1px solid var(--accent-border)" : "1px solid var(--border-soft)",
            background: pokemonFilter === "all" ? "var(--accent)" : "var(--surface-card)",
            color: pokemonFilter === "all" ? "var(--button-text)" : "var(--text-body)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          All
        </Link>
        <Link
          href={megaOnlyHref}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "38px",
            padding: "0 14px",
            borderRadius: "999px",
            border: pokemonFilter === "mega-only" ? "1px solid var(--accent-border)" : "1px solid var(--border-soft)",
            background: pokemonFilter === "mega-only" ? "var(--accent)" : "var(--surface-card)",
            color: pokemonFilter === "mega-only" ? "var(--button-text)" : "var(--text-body)",
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          Mega Pokemon
        </Link>
      </nav>
      <PokedexFocus focusedSlug={focusedSlug} />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <colgroup>
          <col style={{ width: "56px" }} />
          <col style={{ width: pokemonColumnWidth }} />
          <col style={{ width: typeColumnWidth }} />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
          <col />
        </colgroup>
        <thead>
          <tr style={{ background: "var(--surface-muted)" }}>
            <th style={tableCellStyle("right")}>#</th>
            <th style={{ ...tableCellStyle("center"), width: pokemonColumnWidth }}>Pokemon</th>
            <th style={{ ...tableCellStyle(), width: typeColumnWidth }}>Type</th>
            <th style={tableCellStyle()}>Abilities</th>
            <th style={tableCellStyle("right")}>HP</th>
            <th style={tableCellStyle("right")}>Atk</th>
            <th style={tableCellStyle("right")}>Def</th>
            <th style={tableCellStyle("right")}>SpA</th>
            <th style={tableCellStyle("right")}>SpD</th>
            <th style={tableCellStyle("right")}>Spe</th>
            <th style={tableCellStyle("right")}>BST</th>
          </tr>
        </thead>
        <tbody>
          {visiblePokemon.map((entry) => {
            const href = `/pokemon/${entry.slug}?returnTo=${encodeURIComponent(getHomePokemonHref(entry.slug))}`;
            const rowId = `pokemon-row-${entry.slug}`;
            const isFocused = focusedSlug === entry.slug;

            return (
              <tr
                key={entry.id}
                id={rowId}
                style={{
                  background: isFocused ? "var(--accent-soft)" : "var(--surface-card)",
                  scrollMarginTop: "96px",
                }}
              >
                <td style={tableCellStyle("right")}>{entry.dexNumber}</td>
                <td style={{ ...tableCellStyle("center"), whiteSpace: "normal", width: pokemonColumnWidth }}>
                  <Link
                    href={href}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "72px minmax(0, 1fr)",
                      columnGap: "10px",
                      alignItems: "center",
                      width: pokemonCellInnerWidth,
                      maxWidth: "100%",
                      margin: "0 auto",
                      color: "var(--text-body)",
                      textDecoration: "none",
                    }}
                  >
                    <span
                      style={{
                        width: "72px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ReferenceImage
                        src={entry.spriteSrc ?? getFallbackSpriteUrl(entry.dexNumber)}
                        alt={entry.name}
                        width={56}
                        height={56}
                        style={{ width: "56px", height: "56px", objectFit: "contain", imageRendering: "pixelated" }}
                      />
                    </span>
                    <span
                      style={{
                        minWidth: 0,
                        textAlign: "left",
                        whiteSpace: "normal",
                      }}
                    >
                      {getPokemonDisplayName(entry)}
                    </span>
                  </Link>
                </td>
                <td style={{ ...tableCellStyle(), width: typeColumnWidth }}>
                  <TypeBadgeList types={entry.types} />
                </td>
                <td style={tableCellStyle()}>
                  <span style={{ display: "inline-flex", flexWrap: "wrap" }}>
                    {entry.abilities.map((ability, index) => (
                      <span key={ability.value}>
                        {index > 0 ? ", " : ""}
                        <Link
                          href={`/abilities/${ability.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                          style={{ color: "var(--text-body)" }}
                        >
                          {ability.value}
                          {ability.isHidden ? " (H)" : ""}
                        </Link>
                      </span>
                    ))}
                  </span>
                </td>
                <td style={tableCellStyle("right")}>{entry.baseStats.hp}</td>
                <td style={tableCellStyle("right")}>{entry.baseStats.attack}</td>
                <td style={tableCellStyle("right")}>{entry.baseStats.defense}</td>
                <td style={tableCellStyle("right")}>{entry.baseStats.specialAttack}</td>
                <td style={tableCellStyle("right")}>{entry.baseStats.specialDefense}</td>
                <td style={tableCellStyle("right")}>{entry.baseStats.speed}</td>
                <td style={tableCellStyle("right")}>{bst(entry.baseStats)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function HomeShell({
  pokemon,
  locations,
  items,
  moves,
  machines,
  abilities,
  battles,
  levelCaps,
  activeTab,
  focusedSlug,
  pokemonFilter,
}: HomeShellProps) {
  let tabContent: ReactNode;

  switch (activeTab) {
    case "locations":
      tabContent = (
        <CompactLinkList
          rows={locations.map((entry) => ({
            id: entry.id,
            href: `/locations/${entry.slug}`,
            title: entry.name,
            meta: entry.region,
          }))}
        />
      );
      break;
    case "items":
      tabContent = <ItemsReference items={items} />;
      break;
    case "moves":
      tabContent = (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--surface-muted)" }}>
                <th style={tableCellStyle()}>Move</th>
                <th style={tableCellStyle("center")}>Type</th>
                <th style={tableCellStyle("center")}>Category</th>
                <th style={tableCellStyle("center")}>Power</th>
                <th style={tableCellStyle("center")}>Accuracy</th>
                <th style={tableCellStyle("center")}>PP</th>
                <th style={tableCellStyle()}>Effect</th>
              </tr>
            </thead>
            <tbody>
              {moves.map((entry) => (
                <tr key={entry.id}>
                  <td style={tableCellStyle()}>
                    <Link href={`/moves/${entry.slug}`}>{entry.name}</Link>
                  </td>
                  <td style={tableCellStyle("center")}>
                    {entry.type ? <TypeBadgeList types={[entry.type]} /> : "—"}
                  </td>
                  <td style={tableCellStyle("center")}>
                    <MoveCategoryIcon category={entry.category ?? null} />
                  </td>
                  <td style={tableCellStyle("center")}>{entry.power ?? "—"}</td>
                  <td style={tableCellStyle("center")}>{entry.accuracy ?? "—"}</td>
                  <td style={tableCellStyle("center")}>{entry.pp ?? "—"}</td>
                  <td
                    style={{
                      ...tableCellStyle(),
                      whiteSpace: "normal",
                      minWidth: "260px",
                    }}
                  >
                    {entry.effectSummary}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      break;
    case "machines":
      tabContent = (
        <div style={{ display: "grid", gap: "12px" }}>
          {machines.map((entry) => {
            const machineTypeIconSrc = getMachineTypeIconSrc(entry.moveType);
            return (
              <Link
                key={entry.id}
                href={`/machines/${entry.slug}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "52px 1fr",
                  alignItems: "center",
                  gap: "14px",
                  padding: "16px",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "12px",
                  background: "var(--surface-card)",
                }}
              >
                {machineTypeIconSrc ? (
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      borderRadius: "12px",
                      border: "1px solid var(--border-soft)",
                      background: "var(--surface-card)",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    <img
                      src={machineTypeIconSrc}
                      alt={entry.moveType ?? entry.code}
                      width={32}
                      height={32}
                      style={{ width: "32px", height: "32px", objectFit: "contain" }}
                    />
                  </div>
                ) : (
                  <div style={{ width: "40px", height: "40px" }} />
                )}
                <div>
                  <strong style={{ color: "var(--text-body)" }}>
                    {entry.code} {entry.moveName}
                  </strong>
                  <div style={{ color: "var(--text-muted)", marginTop: "6px" }}>
                    {[entry.location, `${entry.compatibilityCount} compatible Pokemon`]
                      .filter(Boolean)
                      .join(" • ")}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      );
      break;
    case "abilities":
      tabContent = (
        <CompactLinkList
          rows={abilities.map((entry) => ({
            id: entry.id,
            href: `/abilities/${entry.slug}`,
            title: entry.name,
            meta: entry.description,
          }))}
        />
      );
      break;
    case "battles":
      tabContent = <BattlesReference battles={battles} embedded />;
      break;
    case "level-caps":
      tabContent = (
        <div style={{ display: "grid", gap: "8px" }}>
          {levelCaps.map((entry) => (
            <div
              key={entry.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "12px",
                padding: "10px 12px",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <span style={{ color: "var(--text-body)", fontWeight: 600 }}>{entry.trainer}</span>
              <span style={{ color: "var(--text-muted)", textAlign: "right" }}>
                {entry.location} • Lv. {entry.level}
              </span>
            </div>
          ))}
        </div>
      );
      break;
    case "pokedex":
    default:
      tabContent = <HomePokedexTable pokemon={pokemon} focusedSlug={focusedSlug} pokemonFilter={pokemonFilter} />;
      break;
  }

  return (
    <main style={{ margin: "0 auto", maxWidth: "1400px", padding: "18px 18px 48px" }}>
      {activeTab !== "pokedex" ? (
        <PageNavigation backHref="/?tab=pokedex" backLabel="Back to Pokedex" homeHref="/" />
      ) : null}
      <section
        aria-label={tabs.find((tab) => tab.key === activeTab)?.label ?? "Content"}
        style={{
          background: "var(--surface-card)",
          border: "1px solid var(--border-soft)",
          borderRadius: "16px",
          padding: "10px 12px 16px",
          overflow: "hidden",
        }}
      >
        {tabContent}
      </section>
    </main>
  );
}
