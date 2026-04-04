import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { MoveCategoryIcon, StatBar, TypeBadgeList, matchupSectionStyle } from "../../../components/dex-visuals";
import PageNavigation from "../../../components/page-navigation";
import ReferenceImage from "../../../components/reference-image";
import { getPokemonMiniSpriteSources, getPokemonPrimaryArt } from "../../../lib/assets";
import {
  getMoveTutorCompatibilityByPokemonId,
  getTmHmCompatibilityByPokemonId,
} from "../../../lib/data/compatibility";
import { getAbilityByName } from "../../../lib/data/abilities";
import { getEncounterItemRowsByPokemonId } from "../../../lib/data/encounters";
import { getLearnsetByPokemonId } from "../../../lib/data/learnsets";
import { getMoveById } from "../../../lib/data/moves";
import { getEvolutionTree, getMegaEvolutionLinks, type EvolutionTreeNode } from "../../../lib/data/pokemon-evolutions";
import { getAllPokemon, getPokemonBySlug } from "../../../lib/data/pokemon";
import {
  formatPokemonStatDelta,
  getMoveEffectSummary,
  getPokemonAbilityDisplayRows,
  getPokemonStatDisplayRows,
} from "../../../lib/data/vanilla";
import { getMatchupAbilityView } from "../../../lib/type-chart";
import { getPokemonDisplayName } from "../../../lib/presentation";

function formatValue(value: number | string | null): string {
  return value === null ? "—" : String(value);
}

function cellStyle(align: "left" | "center" | "right" = "left"): CSSProperties {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid var(--border-soft)",
    textAlign: align,
    verticalAlign: "top",
  };
}

export const dynamicParams = false;

type PokemonDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{
    returnTo?: string;
    ability?: string;
  }>;
};

function EvolutionTreeBranch({
  node,
  currentPokemonId,
  backHref,
}: {
  node: EvolutionTreeNode;
  currentPokemonId: string;
  backHref: string;
}) {
  const sprite = getPokemonMiniSpriteSources(node.pokemon);
  const megaLinks = getMegaEvolutionLinks(node.pokemon.id);

  return (
    <div style={{ display: "grid", gap: "12px" }}>
      <div
        style={{
          width: "fit-content",
          minWidth: "160px",
          padding: "14px",
          border: node.pokemon.id === currentPokemonId ? "2px solid var(--accent)" : "1px solid var(--border-soft)",
          borderRadius: "16px",
          background: node.pokemon.id === currentPokemonId ? "var(--accent-soft)" : "var(--surface-card)",
          textAlign: "center",
        }}
      >
        <ReferenceImage
          src={sprite.src}
          fallbackSrc={sprite.fallbackSrc}
          alt={node.pokemon.name}
          width={72}
          height={72}
          style={{ imageRendering: "pixelated" }}
        />
        <div style={{ marginTop: "8px" }}>
          <Link href={`/pokemon/${node.pokemon.slug}?returnTo=${encodeURIComponent(backHref)}`}>
            {getPokemonDisplayName(node.pokemon)}
          </Link>
        </div>
      </div>

      {node.children.length > 0 ? (
        <div
          style={{
            marginLeft: "24px",
            paddingLeft: "18px",
            borderLeft: "2px solid var(--border-soft)",
            display: "grid",
            gap: "14px",
          }}
        >
          {node.children.map((child) => (
            <div key={`${node.pokemon.id}-${child.node.pokemon.id}`} style={{ display: "grid", gap: "8px" }}>
              <div
                style={{
                  color: "var(--text-muted)",
                  fontSize: "0.84rem",
                  fontWeight: 600,
                }}
              >
                {child.method}
              </div>
              <EvolutionTreeBranch node={child.node} currentPokemonId={currentPokemonId} backHref={backHref} />
            </div>
          ))}
        </div>
      ) : null}

      {megaLinks.length > 0 ? (
        <div
          style={{
            marginLeft: "24px",
            paddingLeft: "18px",
            borderLeft: "2px dashed var(--border-strong)",
            display: "grid",
            gap: "12px",
          }}
        >
          {megaLinks.map((megaLink) => {
            const megaSprite = getPokemonMiniSpriteSources(megaLink.pokemon);
            return (
              <div key={`${node.pokemon.id}-${megaLink.pokemon.id}`} style={{ display: "grid", gap: "8px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.84rem", fontWeight: 700 }}>
                  Mega Evolution • {megaLink.method}
                </div>
                <div
                  style={{
                    width: "fit-content",
                    minWidth: "180px",
                    padding: "14px",
                    border:
                      megaLink.pokemon.id === currentPokemonId
                        ? "2px solid var(--accent)"
                        : "1px dashed var(--border-strong)",
                    borderRadius: "16px",
                    background:
                      megaLink.pokemon.id === currentPokemonId
                        ? "var(--accent-soft)"
                        : "var(--surface-card)",
                    textAlign: "center",
                  }}
                >
                  <ReferenceImage
                    src={megaSprite.src}
                    fallbackSrc={megaSprite.fallbackSrc}
                    alt={megaLink.pokemon.name}
                    width={72}
                    height={72}
                    style={{ imageRendering: "pixelated" }}
                  />
                  <div style={{ marginTop: "8px" }}>
                    <Link href={`/pokemon/${megaLink.pokemon.slug}?returnTo=${encodeURIComponent(backHref)}`}>
                      {getPokemonDisplayName(megaLink.pokemon)}
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

export async function generateStaticParams() {
  return getAllPokemon().map((pokemon) => ({ slug: pokemon.slug }));
}

export default async function PokemonDetailPage({
  params,
  searchParams,
}: PokemonDetailPageProps) {
  const { slug } = await params;
  const { returnTo, ability } = await searchParams;
  const pokemon = getPokemonBySlug(slug);

  if (!pokemon) {
    notFound();
  }

  const compatibility = getTmHmCompatibilityByPokemonId(pokemon.id);
  const moveTutorCompatibility = getMoveTutorCompatibilityByPokemonId(pokemon.id);
  const learnset = getLearnsetByPokemonId(pokemon.id);
  const statRows = getPokemonStatDisplayRows(pokemon);
  const abilityRows = getPokemonAbilityDisplayRows(pokemon);
  const encounterItemRows = getEncounterItemRowsByPokemonId(pokemon.id);
  const backHref = returnTo ?? "/?tab=pokedex";
  const bst =
    pokemon.baseStats.hp +
    pokemon.baseStats.attack +
    pokemon.baseStats.defense +
    pokemon.baseStats.specialAttack +
    pokemon.baseStats.specialDefense +
    pokemon.baseStats.speed;
  const art = getPokemonPrimaryArt(pokemon);
  const baseEvolutionAnchor =
    /\(Mega /i.test(pokemon.name)
      ? getAllPokemon().find((entry) => entry.dexNumber === pokemon.dexNumber && !/\(Mega /i.test(entry.name))
      : null;
  const evolutionTree = getEvolutionTree(baseEvolutionAnchor?.id ?? pokemon.id);
  const matchupAbilityView = getMatchupAbilityView(pokemon);
  const activeMatchupState =
    matchupAbilityView.states.find((state) => state.id === ability) ?? matchupAbilityView.states[0];
  const abilityCards = abilityRows.map((row) => {
    const abilityEntry = getAbilityByName(row.value);
    const matchupState =
      matchupAbilityView.states.find((state) => state.ability === row.value) ??
      matchupAbilityView.states.find((state) => state.ability === null) ??
      null;

    return {
      ...row,
      description: abilityEntry?.description ?? "No ability description listed.",
      matchupNote: matchupState?.note ?? null,
    };
  });
  const displayName = getPokemonDisplayName(pokemon);

  return (
    <main style={{ margin: "0 auto", maxWidth: "1000px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref={backHref} backLabel="Back to Pokedex" />

      <section>
        <div>
          <h1 style={{ marginTop: 0, marginBottom: "10px" }}>{displayName}</h1>
          <p style={{ color: "var(--text-muted)", marginTop: 0, marginBottom: "14px" }}>#{pokemon.dexNumber}</p>
          <TypeBadgeList types={pokemon.types} />
          <div
            style={{
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "16px",
              marginTop: "12px",
              marginBottom: "16px",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  border: "1px solid var(--border-soft)",
                  borderRadius: "14px",
                  background: "var(--surface-card)",
                  display: "grid",
                  placeItems: "center",
                  marginBottom: "6px",
                }}
              >
                <ReferenceImage
                  src={art.src}
                  fallbackSrc={art.fallbackSrc}
                  alt={displayName}
                  width={96}
                  height={96}
                  style={{ width: "96px", height: "96px", objectFit: "contain", imageRendering: "pixelated" }}
                />
              </div>
              <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Normal</span>
            </div>
            {art.shinySrc ? (
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    width: "96px",
                    height: "96px",
                    border: "1px solid var(--border-soft)",
                    borderRadius: "14px",
                    background: "var(--surface-card)",
                    display: "grid",
                    placeItems: "center",
                    marginBottom: "6px",
                  }}
                >
                  <ReferenceImage
                    src={art.shinySrc}
                    fallbackSrc={null}
                    alt={`${displayName} shiny`}
                    width={96}
                    height={96}
                    style={{ width: "96px", height: "96px", objectFit: "contain", imageRendering: "pixelated" }}
                  />
                </div>
                <span style={{ color: "var(--text-muted)", fontSize: "0.9rem" }}>Shiny</span>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Stats</h2>
        <div style={{ display: "grid", gap: "10px" }}>
          {statRows.map((row) => (
            <div
              key={row.label}
              style={{
                display: "grid",
                gridTemplateColumns: "92px 52px 1fr",
                gap: "12px",
                alignItems: "center",
              }}
            >
              <strong>{row.label}</strong>
              <span>
                {row.value}
                {formatPokemonStatDelta(row.delta)}
              </span>
              <StatBar value={row.value} />
            </div>
          ))}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "92px 52px",
              gap: "12px",
              alignItems: "center",
            }}
          >
            <strong>BST</strong>
            <span>{bst}</span>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Abilities</h2>
        <div style={{ display: "grid", gap: "14px" }}>
          {abilityCards.map((ability) => (
            <article
              key={`${ability.label}-${ability.value}`}
              style={{
                padding: "16px 18px",
                border: "1px solid var(--border-soft)",
                borderRadius: "16px",
                background: "linear-gradient(180deg, var(--surface-card) 0%, var(--surface-muted) 100%)",
                display: "grid",
                gap: "10px",
              }}
            >
              <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", alignItems: "center" }}>
                <span
                  style={{
                    padding: "4px 8px",
                    borderRadius: "999px",
                    background: "var(--surface-elevated)",
                    color: "var(--text-muted)",
                    fontSize: "0.82rem",
                    fontWeight: 700,
                  }}
                >
                  {ability.label}
                </span>
                <strong>
                  <Link href={`/abilities/${ability.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                    {ability.value}
                  </Link>
                </strong>
              </div>
              <div style={{ color: "var(--text-body)", lineHeight: 1.6 }}>{ability.description}</div>
              {ability.matchupNote ? (
                <div
                  style={{
                    padding: "10px 12px",
                    borderRadius: "12px",
                    background: "var(--surface-elevated)",
                    color: "var(--text-body)",
                  }}
                >
                  <strong style={{ display: "block", marginBottom: "6px" }}>Matchup impact</strong>
                  <span>{ability.matchupNote}</span>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      {encounterItemRows.length > 0 ? (
        <section style={{ marginTop: "24px" }}>
          <h2>Wild Encounter Item Info</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={cellStyle()}>Location</th>
                  <th style={cellStyle()}>Method</th>
                  <th style={cellStyle("right")}>Encounter Rate</th>
                  <th style={cellStyle()}>Held Item</th>
                  <th style={cellStyle()}>Levels</th>
                </tr>
              </thead>
              <tbody>
                {encounterItemRows.map((entry) => (
                  <tr key={entry.encounterId}>
                    <td style={cellStyle()}>
                      <Link href={`/locations/${entry.locationSlug}`}>{entry.locationName}</Link>
                    </td>
                    <td style={cellStyle()}>{entry.method}</td>
                    <td style={cellStyle("right")}>{entry.encounterRate}</td>
                    <td style={cellStyle()}>
                      {entry.heldItemEntries.length > 0 ? (
                        <div style={{ display: "grid", gap: "4px" }}>
                          {entry.heldItemEntries.map((item) => (
                            <span key={`${entry.encounterId}-${item.itemName}`}>
                              {item.itemSlug ? (
                                <Link href={`/items/${item.itemSlug}`}>
                                  {item.itemName}
                                  {item.chanceLabel ? ` (${item.chanceLabel})` : ""}
                                </Link>
                              ) : (
                                `${item.itemName}${item.chanceLabel ? ` (${item.chanceLabel})` : ""}`
                              )}
                            </span>
                          ))}
                        </div>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={cellStyle()}>{entry.levelRange}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}

      <section style={{ marginTop: "24px" }}>
        <h2>Evolution Tree</h2>
        <div style={{ display: "grid", gap: "18px" }}>
          {evolutionTree.map((root) => (
            <EvolutionTreeBranch
              key={root.pokemon.id}
              node={root}
              currentPokemonId={pokemon.id}
              backHref={backHref}
            />
          ))}
        </div>
      </section>

      <section id="matchups" style={{ marginTop: "24px", display: "grid", gap: "18px", scrollMarginTop: "108px" }}>
        <div>
          <h2>Defensive Matchups</h2>
          {matchupAbilityView.showTabs ? (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "10px",
                marginBottom: "12px",
              }}
            >
              {matchupAbilityView.states.map((state) => {
                const active = state.id === activeMatchupState.id;
                const params = new URLSearchParams();
                if (returnTo) {
                  params.set("returnTo", returnTo);
                }
                params.set("ability", state.id);
                return (
                  <Link
                    key={`${pokemon.id}-${state.id}`}
                    href={`/pokemon/${pokemon.slug}?${params.toString()}#matchups`}
                    scroll={false}
                    style={{
                      padding: "8px 12px",
                      borderRadius: "999px",
                      border: active ? "1px solid var(--accent-border)" : "1px solid var(--border-soft)",
                      background: active ? "var(--accent)" : "var(--surface-card)",
                      color: active ? "var(--button-text)" : "var(--text-body)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {state.ability}
                  </Link>
                );
              })}
            </div>
          ) : null}
          <div style={{ display: "grid", gap: "10px" }}>
            {activeMatchupState.defensiveMatchups.map((bucket) => (
              <div
                key={`${bucket.label}-${bucket.multiplier}`}
                style={{
                  ...matchupSectionStyle(bucket.multiplier, "defensive"),
                  padding: "12px 14px",
                  borderRadius: "14px",
                }}
              >
                <strong style={{ display: "block", marginBottom: "8px" }}>{bucket.label}</strong>
                <TypeBadgeList types={bucket.types} />
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2>Offensive Matchups</h2>
          {(() => {
            const flyingPressSection = activeMatchupState.offensiveMatchupSections.find(
              (section) => section.label === "Flying Press",
            );
            const regularSections = activeMatchupState.offensiveMatchupSections.filter(
              (section) => section.label !== "Flying Press",
            );

            return (
              <div style={{ display: "grid", gap: "14px" }}>
                <div
                  style={{
                    display: "grid",
                    gap: "14px",
                    gridTemplateColumns:
                      regularSections.length > 1 ? "repeat(2, minmax(0, 1fr))" : "minmax(0, 1fr)",
                  }}
                >
                  {regularSections.map((section) => (
                    <div key={`${pokemon.id}-${section.label}`} style={{ display: "grid", gap: "10px", alignContent: "start" }}>
                      <strong>{section.label}</strong>
                      {section.buckets.map((bucket) => (
                        <div
                          key={`${section.label}-${bucket.label}-${bucket.multiplier}`}
                          style={{
                            ...matchupSectionStyle(bucket.multiplier, "offensive"),
                            padding: "12px 14px",
                            borderRadius: "14px",
                          }}
                        >
                          <strong style={{ display: "block", marginBottom: "8px" }}>{bucket.label}</strong>
                          <TypeBadgeList types={bucket.types} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>

                {flyingPressSection ? (
                  <div key={`${pokemon.id}-${flyingPressSection.label}`} style={{ display: "grid", gap: "10px" }}>
                    <strong>{flyingPressSection.label}</strong>
                    {flyingPressSection.buckets.map((bucket) => (
                      <div
                        key={`${flyingPressSection.label}-${bucket.label}-${bucket.multiplier}`}
                        style={{
                          ...matchupSectionStyle(bucket.multiplier, "offensive"),
                          padding: "12px 14px",
                          borderRadius: "14px",
                        }}
                      >
                        <strong style={{ display: "block", marginBottom: "8px" }}>{bucket.label}</strong>
                        <TypeBadgeList types={bucket.types} />
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })()}
        </div>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Level-Up Learnset</h2>
        {learnset.length === 0 ? (
          <p>No level-up moves listed.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={cellStyle()}>Level</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle("center")}>Type</th>
                  <th style={cellStyle("center")}>Category</th>
                  <th style={cellStyle("center")}>Power</th>
                  <th style={cellStyle("center")}>Accuracy</th>
                  <th style={cellStyle("center")}>PP</th>
                  <th style={cellStyle()}>Effect</th>
                </tr>
              </thead>
              <tbody>
                {learnset.map((entry) => {
                  const move = entry.moveId ? getMoveById(entry.moveId) : undefined;

                  return (
                    <tr key={entry.learnsetId}>
                      <td style={cellStyle()}>{entry.level !== null ? entry.level : "—"}</td>
                      <td style={cellStyle()}>
                        {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : entry.moveName}
                      </td>
                      <td style={cellStyle("center")}>
                        {move?.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                      </td>
                      <td style={cellStyle("center")}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                          <MoveCategoryIcon category={move?.category ?? null} />
                        </span>
                      </td>
                      <td style={cellStyle("center")}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.pp ?? null)}</td>
                      <td style={cellStyle()}>
                        {(entry.moveId ? getMoveEffectSummary(entry.moveId) : null) ??
                          "No effect summary listed."}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>TMs &amp; HMs</h2>
        {compatibility.length === 0 ? (
          <p>No TM or HM moves listed.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={cellStyle()}>TM/HM #</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle("center")}>Type</th>
                  <th style={cellStyle("center")}>Category</th>
                  <th style={cellStyle("center")}>Power</th>
                  <th style={cellStyle("center")}>Accuracy</th>
                  <th style={cellStyle("center")}>PP</th>
                  <th style={cellStyle()}>Effect</th>
                  <th style={cellStyle()}>Location</th>
                </tr>
              </thead>
              <tbody>
                {compatibility.map((entry) => {
                  const move = entry.machine.moveId ? getMoveById(entry.machine.moveId) : undefined;
                  const moveLabel = entry.machine.name.split(" - ")[1];
                  return (
                    <tr key={entry.compatibilityId}>
                      <td style={cellStyle()}>{entry.machine.code}</td>
                      <td style={cellStyle()}>
                        {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : moveLabel}
                      </td>
                      <td style={cellStyle("center")}>
                        {move?.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                      </td>
                      <td style={cellStyle("center")}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                          <MoveCategoryIcon category={move?.category ?? null} />
                        </span>
                      </td>
                      <td style={cellStyle("center")}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.pp ?? null)}</td>
                      <td style={cellStyle()}>
                        {(entry.machine.moveId ? getMoveEffectSummary(entry.machine.moveId) : null) ??
                          "No effect summary listed."}
                      </td>
                      <td style={cellStyle()}>{entry.machine.location ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Move Tutors</h2>
        {moveTutorCompatibility.length === 0 ? (
          <p>No move tutor moves listed.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={cellStyle()}>Tutor</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle("center")}>Type</th>
                  <th style={cellStyle("center")}>Category</th>
                  <th style={cellStyle("center")}>Power</th>
                  <th style={cellStyle("center")}>Accuracy</th>
                  <th style={cellStyle("center")}>PP</th>
                  <th style={cellStyle()}>Effect</th>
                  <th style={cellStyle()}>Location</th>
                </tr>
              </thead>
              <tbody>
                {moveTutorCompatibility.map((entry) => {
                  const move = entry.machine.moveId ? getMoveById(entry.machine.moveId) : undefined;
                  const moveLabel = entry.machine.name.split(" - ")[1];
                  return (
                    <tr key={entry.compatibilityId}>
                      <td style={cellStyle()}>{entry.machine.code}</td>
                      <td style={cellStyle()}>
                        {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : moveLabel}
                      </td>
                      <td style={cellStyle("center")}>
                        {move?.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                      </td>
                      <td style={cellStyle("center")}>
                        <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: "100%" }}>
                          <MoveCategoryIcon category={move?.category ?? null} />
                        </span>
                      </td>
                      <td style={cellStyle("center")}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle("center")}>{formatValue(move?.pp ?? null)}</td>
                      <td style={cellStyle()}>
                        {(entry.machine.moveId ? getMoveEffectSummary(entry.machine.moveId) : null) ??
                          "No effect summary listed."}
                      </td>
                      <td style={cellStyle()}>{entry.machine.location ?? "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
