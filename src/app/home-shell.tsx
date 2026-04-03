import Link from "next/link";
import type { ReactNode } from "react";
import BattlesReference from "../components/battles-reference";
import { MoveCategoryIcon, TypeBadgeList } from "../components/dex-visuals";
import ItemImage from "../components/item-image";
import PokedexFocus from "./pokedex-focus";
import ReferenceImage from "../components/reference-image";
import { getHomePokemonHref } from "../lib/search";
import type { BattleOccurrence } from "../lib/data/battles";
import { getPokemonDisplayName } from "../lib/presentation";
import type { PokemonAbilitySummaryEntry } from "../lib/data/vanilla";

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

type HomeItemRow = {
  id: string;
  slug: string;
  name: string;
  category: string;
  description: string;
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
  items: HomeItemRow[];
  moves: HomeMoveRow[];
  machines: HomeMachineRow[];
  abilities: HomeAbilityRow[];
  battles: BattleOccurrence[];
  levelCaps: HomeLevelCapRow[];
  activeTab: HomeTabKey;
  focusedSlug: string | null;
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
    borderBottom: "1px solid #e6ebf3",
    textAlign: align,
    verticalAlign: "middle",
    whiteSpace: "nowrap",
  } as const;
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
            display: "flex",
            justifyContent: "space-between",
            gap: "12px",
            padding: "10px 12px",
            borderBottom: "1px solid #e6ebf3",
          }}
        >
          <span style={{ color: "#273246", fontWeight: 600 }}>{row.title}</span>
          <span style={{ color: "#667389", textAlign: "right" }}>{row.meta}</span>
        </Link>
      ))}
    </div>
  );
}

function HomePokedexTable({
  pokemon,
  focusedSlug,
}: {
  pokemon: HomePokemonRow[];
  focusedSlug: string | null;
}) {
  return (
    <div style={{ overflowX: "auto" }}>
      <PokedexFocus focusedSlug={focusedSlug} />
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ background: "#f6f8fc" }}>
            <th style={tableCellStyle("right")}>#</th>
            <th style={tableCellStyle("center")}>Sprite</th>
            <th style={tableCellStyle()}>Pokemon</th>
            <th style={tableCellStyle()}>Type</th>
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
          {pokemon.map((entry) => {
            const href = `/pokemon/${entry.slug}?returnTo=${encodeURIComponent(getHomePokemonHref(entry.slug))}`;
            const rowId = `pokemon-row-${entry.slug}`;
            const isFocused = focusedSlug === entry.slug;

            return (
              <tr
                key={entry.id}
                id={rowId}
                style={{
                  background: isFocused ? "#fff7e8" : "#ffffff",
                  scrollMarginTop: "96px",
                }}
              >
                <td style={tableCellStyle("right")}>{entry.dexNumber}</td>
                <td style={tableCellStyle("center")}>
                  <ReferenceImage
                    src={entry.spriteSrc ?? getFallbackSpriteUrl(entry.dexNumber)}
                    alt={entry.name}
                    width={40}
                    height={40}
                    style={{ imageRendering: "pixelated" }}
                  />
                </td>
                <td style={tableCellStyle()}>
                  <Link href={href}>{getPokemonDisplayName(entry)}</Link>
                </td>
                <td style={tableCellStyle()}>
                  <TypeBadgeList types={entry.types} />
                </td>
                <td style={tableCellStyle()}>
                  <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "6px" }}>
                    {entry.abilities.map((ability) => (
                      <Link
                        key={ability.value}
                        href={`/abilities/${ability.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}
                        style={{ color: "#3d557e" }}
                      >
                        {ability.value}
                        {ability.isHidden ? " (H)" : ""}
                      </Link>
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
      tabContent = (
        <div style={{ display: "grid", gap: "8px" }}>
          {items.map((entry) => (
            <Link
              key={entry.id}
              href={`/items/${entry.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: "56px 1fr",
                alignItems: "center",
                gap: "14px",
                padding: "10px 12px",
                borderBottom: "1px solid #e6ebf3",
              }}
            >
              <ItemImage item={entry} size={40} framed />
              <span>
                <strong style={{ color: "#273246" }}>{entry.name}</strong>
                <div style={{ color: "#667389", marginTop: "6px" }}>{entry.category}</div>
              </span>
            </Link>
          ))}
        </div>
      );
      break;
      case "moves":
      tabContent = (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#f6f8fc" }}>
                <th style={tableCellStyle()}>Move</th>
                <th style={tableCellStyle("center")}>Type</th>
                <th style={tableCellStyle("center")}>Category</th>
                <th style={tableCellStyle("right")}>Power</th>
                <th style={tableCellStyle("right")}>Acc.</th>
                <th style={tableCellStyle("right")}>PP</th>
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
                  <td style={tableCellStyle("right")}>{entry.power ?? "—"}</td>
                  <td style={tableCellStyle("right")}>{entry.accuracy ?? "—"}</td>
                  <td style={tableCellStyle("right")}>{entry.pp ?? "—"}</td>
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
        <CompactLinkList
          rows={machines.map((entry) => ({
            id: entry.id,
            href: `/machines/${entry.slug}`,
            title: `${entry.code} - ${entry.moveName}`,
            meta: [entry.location, `${entry.compatibilityCount} compatible Pokemon`]
              .filter(Boolean)
              .join(" • "),
          }))}
        />
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
                borderBottom: "1px solid #e6ebf3",
              }}
            >
              <span style={{ color: "#273246", fontWeight: 600 }}>{entry.trainer}</span>
              <span style={{ color: "#667389", textAlign: "right" }}>
                {entry.location} • Lv. {entry.level}
              </span>
            </div>
          ))}
        </div>
      );
      break;
    case "pokedex":
    default:
      tabContent = <HomePokedexTable pokemon={pokemon} focusedSlug={focusedSlug} />;
      break;
  }

  return (
    <main style={{ margin: "0 auto", maxWidth: "1400px", padding: "18px 18px 48px" }}>
      <section
        aria-label={tabs.find((tab) => tab.key === activeTab)?.label ?? "Content"}
        style={{
          background: "#ffffff",
          border: "1px solid #dfe5ef",
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
