"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import ReferenceImage from "./reference-image";
import TrainerPhoto from "./trainer-photo";
import { MoveCategoryIcon, TypeBadgeList } from "./dex-visuals";
import { getBattlePokemonImageSources } from "../lib/assets";
import type { BattleCategory, BattleFilter, BattleOccurrence, BattleVariant } from "../lib/data/battles";
import { getMoveByName } from "../lib/data/moves";
import { getBattleDisplayPokemon } from "../lib/data/pokemon";
import { getPokemonDisplayName } from "../lib/presentation";

type BattlesReferenceProps = {
  battles: BattleOccurrence[];
  embedded?: boolean;
};

const filterOptions: Array<{ id: BattleFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "rivals", label: "Rivals & Friends" },
  { id: "gyms", label: "Gyms" },
  { id: "team_flare", label: "Team Flare" },
  { id: "elite_four", label: "Elite Four" },
  { id: "champion", label: "Champion" },
  { id: "optional", label: "Optional Facilities" },
];

function getBattleTitle(trainerName: string): string {
  return trainerName.replace(/\s*\(\d+(?:\s*\/\s*\d+)*\)\s*$/g, "").trim();
}

function categoryStyle(category: BattleCategory) {
  switch (category) {
    case "rival":
      return { background: "#eef4ff", border: "#9ab6ee", accent: "#3567d6" };
    case "gym_trainer":
      return { background: "#f3f8ee", border: "#9ec087", accent: "#4f8a2b" };
    case "gym_leader":
      return { background: "#ecf7db", border: "#7dac4f", accent: "#2f6e14" };
    case "villain":
      return { background: "#fff0e8", border: "#f0ae82", accent: "#df6a2d" };
    case "admin":
      return { background: "#ffe2df", border: "#d47063", accent: "#a83622" };
    case "lysandre":
      return { background: "#3d1218", border: "#6d2b34", accent: "#ffffff" };
    case "elite_four":
      return { background: "#f4eefc", border: "#b9a0dd", accent: "#6f4bc3" };
    case "champion":
      return { background: "#fff7e8", border: "#e1c37b", accent: "#9a6a00" };
    case "facility":
      return { background: "#f5f7fb", border: "#c8d2e3", accent: "#53627d" };
    case "regular":
    default:
      return { background: "#f8fafc", border: "#d3dbe8", accent: "#45546f" };
  }
}

function getRulesetLabel(variant: BattleVariant): string {
  return variant.ruleset === "singles" ? "Singles" : "Doubles";
}

function groupVariantsByRuleset(variants: BattleVariant[]) {
  const singles = variants.filter((variant) => variant.ruleset === "singles");
  const doubles = variants.filter((variant) => variant.ruleset === "doubles");
  return [singles, doubles].filter((group) => group.length > 0);
}

function variantTitle(group: BattleVariant[]): string {
  const base = getRulesetLabel(group[0]);
  if (group.length === 1) {
    return base;
  }
  return `${base} Variants`;
}

function filterBattles(battles: BattleOccurrence[], filter: BattleFilter): BattleOccurrence[] {
  if (filter === "all") {
    return battles;
  }
  return battles.filter((battle) => battle.filters.includes(filter));
}

function groupBattlesByLocation(battles: BattleOccurrence[]) {
  const sections: Array<{ location: string; battles: BattleOccurrence[] }> = [];
  for (const battle of battles) {
    const current = sections[sections.length - 1];
    if (!current || current.location !== battle.location) {
      sections.push({ location: battle.location, battles: [battle] });
    } else {
      current.battles.push(battle);
    }
  }
  return sections;
}

function BattleMoveChip({ moveName }: { moveName: string }) {
  const move = getMoveByName(moveName);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 8px",
        borderRadius: "999px",
        background: "#eef3fa",
        color: "#324158",
        fontSize: "0.84rem",
      }}
    >
      <MoveCategoryIcon category={move?.category ?? null} />
      {move?.type ? <TypeBadgeList types={[move.type]} /> : null}
      <span>{moveName}</span>
    </span>
  );
}

export default function BattlesReference({ battles, embedded = false }: BattlesReferenceProps) {
  const [activeFilter, setActiveFilter] = useState<BattleFilter>("all");
  const [openBattleIds, setOpenBattleIds] = useState<Record<string, boolean>>({});
  const visibleBattles = useMemo(() => filterBattles(battles, activeFilter), [activeFilter, battles]);
  const visibleSections = useMemo(() => groupBattlesByLocation(visibleBattles), [visibleBattles]);
  const Wrapper = embedded ? "section" : "main";

  return (
    <Wrapper style={embedded ? undefined : { margin: "0 auto", maxWidth: "1200px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>Battles</h1>

      <nav
        aria-label="Battle category filters"
        style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}
      >
        {filterOptions
          .filter((option) => option.id === "all" || battles.some((battle) => battle.filters.includes(option.id)))
          .map((option) => {
            const active = option.id === activeFilter;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => setActiveFilter(option.id)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "999px",
                  border: active ? "1px solid #365ecc" : "1px solid #d5dce8",
                  color: active ? "#ffffff" : "#324158",
                  background: active ? "#365ecc" : "#ffffff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {option.label}
              </button>
            );
          })}
      </nav>

      <div key={activeFilter} style={{ display: "grid", gap: "24px" }}>
        {visibleSections.map((section) => (
          <section key={section.location}>
            <h2 style={{ marginTop: 0, marginBottom: "12px" }}>{section.location}</h2>
            <div style={{ display: "grid", gap: "12px" }}>
              {section.battles.map((battle) => {
                const style = categoryStyle(battle.category);
                const isOpen = openBattleIds[battle.id] ?? false;
                return (
                  <details
                    key={battle.id}
                    onToggle={(event) => {
                      const nextOpen = (event.currentTarget as HTMLDetailsElement).open;
                      setOpenBattleIds((current) => {
                        if ((current[battle.id] ?? false) === nextOpen) {
                          return current;
                        }
                        return { ...current, [battle.id]: nextOpen };
                      });
                    }}
                    style={{
                      border: `1px solid ${style.border}`,
                      borderRadius: "18px",
                      background: style.background,
                      overflow: "hidden",
                    }}
                  >
                    <summary style={{ listStyle: "none", cursor: "pointer", padding: "14px 16px" }}>
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "auto minmax(0, 1fr) auto",
                          gap: "14px",
                          alignItems: "center",
                        }}
                      >
                        <TrainerPhoto
                          trainerId={battle.variants[0]?.trainerId ?? battle.id}
                          trainerName={battle.trainerName}
                          trainerSlug={battle.variants[0]?.trainerSlug ?? battle.slug}
                          source={battle.variants[0]?.source ?? null}
                          ruleset={battle.variants[0]?.ruleset ?? null}
                          location={battle.location}
                        />
                        <div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                            <strong>{getBattleTitle(battle.trainerName)}</strong>
                            <span
                              style={{
                                padding: "4px 8px",
                                borderRadius: "999px",
                                background: "rgba(255,255,255,0.72)",
                                color: style.accent,
                                fontSize: "0.82rem",
                                fontWeight: 700,
                              }}
                            >
                              {battle.categoryLabel}
                            </span>
                          </div>
                        </div>
                        <div style={{ color: battle.category === "lysandre" ? "#f3dfe2" : "#667389" }}>Open</div>
                      </div>
                    </summary>

                    {isOpen ? (
                      <div style={{ padding: "0 16px 16px" }}>
                        {battle.section ? (
                          <div style={{ color: "#5c6a80", marginBottom: "14px" }}>{battle.section}</div>
                        ) : null}

                        <div style={{ display: "grid", gap: "14px" }}>
                          {groupVariantsByRuleset(battle.variants).map((variantGroup) => (
                            <section key={`${battle.id}-${variantGroup[0].ruleset}`}>
                              <h3 style={{ marginTop: 0, marginBottom: "10px" }}>{variantTitle(variantGroup)}</h3>
                              <div style={{ display: "grid", gap: "12px" }}>
                                {variantGroup.map((variant) => (
                                  <article
                                    key={variant.id}
                                    style={{
                                      padding: "14px",
                                      borderRadius: "14px",
                                      background: "#ffffff",
                                      border: "1px solid #dde4f0",
                                    }}
                                  >
                                    {variantGroup.length > 1 ? (
                                      <div style={{ color: "#4d5c73", fontWeight: 700, marginBottom: "10px" }}>
                                        {variant.variantLabel}
                                      </div>
                                    ) : null}

                                    <div style={{ display: "grid", gap: "10px" }}>
                                      {variant.team.map((member) => {
                                        const displayPokemon = getBattleDisplayPokemon(member.pokemonId, member.heldItem);
                                        const image = getBattlePokemonImageSources(displayPokemon ?? null);
                                        const label = displayPokemon ? getPokemonDisplayName(displayPokemon) : member.pokemonName;
                                        return (
                                          <article
                                            key={`${variant.id}-${member.slot}`}
                                            style={{
                                              display: "grid",
                                              gridTemplateColumns: "84px minmax(0, 1fr)",
                                              gap: "14px",
                                              padding: "12px",
                                              borderRadius: "14px",
                                              background: "#f8fafc",
                                            }}
                                          >
                                            <div style={{ textAlign: "center" }}>
                                              <ReferenceImage
                                                src={image.src}
                                                fallbackSrc={image.fallbackSrc}
                                                alt={label}
                                                width={64}
                                                height={64}
                                                style={{
                                                  imageRendering: "pixelated",
                                                  display: "block",
                                                  margin: "0 auto",
                                                }}
                                              />
                                              <div style={{ color: "#667389", fontSize: "0.84rem", marginTop: "6px" }}>
                                                #{displayPokemon?.dexNumber ?? "—"}
                                              </div>
                                            </div>

                                            <div>
                                              <div
                                                style={{
                                                  display: "flex",
                                                  flexWrap: "wrap",
                                                  gap: "8px",
                                                  alignItems: "center",
                                                }}
                                              >
                                                <strong>
                                                  {displayPokemon ? (
                                                    <Link href={`/pokemon/${displayPokemon.slug}`}>{label}</Link>
                                                  ) : (
                                                    label
                                                  )}
                                                </strong>
                                                {displayPokemon ? <TypeBadgeList types={displayPokemon.types} /> : null}
                                              </div>
                                              <div style={{ color: "#586379", marginTop: "6px" }}>
                                                Level {member.level ?? "—"}
                                                {member.ability ? ` • Ability: ${member.ability}` : ""}
                                                {member.heldItem ? ` • Held Item: ${member.heldItem}` : ""}
                                              </div>
                                              <div style={{ marginTop: "8px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                                {member.moves.length > 0 ? (
                                                  member.moves.map((moveName) => (
                                                    <BattleMoveChip key={`${variant.id}-${member.slot}-${moveName}`} moveName={moveName} />
                                                  ))
                                                ) : (
                                                  <span style={{ color: "#667389" }}>No moves listed</span>
                                                )}
                                              </div>
                                            </div>
                                          </article>
                                        );
                                      })}
                                    </div>
                                  </article>
                                ))}
                              </div>
                            </section>
                          ))}
                        </div>
                      </div>
                    ) : null}
                  </details>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </Wrapper>
  );
}





