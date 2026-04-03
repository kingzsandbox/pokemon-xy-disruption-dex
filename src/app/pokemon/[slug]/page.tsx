import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { MoveCategoryIcon, StatBar, TypeBadgeList, matchupSectionStyle } from "@/components/dex-visuals";
import PageNavigation from "@/components/page-navigation";
import ReferenceImage from "@/components/reference-image";
import { getPokemonMiniSpriteSources, getPokemonPrimaryArt } from "@/lib/assets";
import { getTmHmCompatibilityByPokemonId } from "@/lib/data/compatibility";
import { getEncounterItemRowsByPokemonId } from "@/lib/data/encounters";
import { getLearnsetByPokemonId } from "@/lib/data/learnsets";
import { getMoveById } from "@/lib/data/moves";
import { getEvolutionFamily } from "@/lib/data/pokemon-evolutions";
import { getAllPokemon, getPokemonBySlug } from "@/lib/data/pokemon";
import {
  formatPokemonStatDelta,
  getMoveEffectSummary,
  getPokemonAbilityDisplayRows,
  getPokemonStatDisplayRows,
} from "@/lib/data/vanilla";
import { getOffensiveMatchups, getDefensiveMatchups } from "@/lib/type-chart";
import { getPokemonDisplayName } from "@/lib/presentation";

function formatValue(value: number | string | null): string {
  return value === null ? "—" : String(value);
}

function cellStyle(align: "left" | "center" | "right" = "left"): CSSProperties {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid #e3e7f0",
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
  }>;
};

export async function generateStaticParams() {
  return getAllPokemon().map((pokemon) => ({ slug: pokemon.slug }));
}

export default async function PokemonDetailPage({
  params,
  searchParams,
}: PokemonDetailPageProps) {
  const { slug } = await params;
  const { returnTo } = await searchParams;
  const pokemon = getPokemonBySlug(slug);

  if (!pokemon) {
    notFound();
  }

  const compatibility = getTmHmCompatibilityByPokemonId(pokemon.id);
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
  const evolutionFamily = getEvolutionFamily(pokemon.id);
  const defensiveMatchups = getDefensiveMatchups(pokemon);
  const offensiveMatchups = getOffensiveMatchups(pokemon);
  const displayName = getPokemonDisplayName(pokemon);

  return (
    <main style={{ margin: "0 auto", maxWidth: "1000px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref={backHref} backLabel="Back to Pokedex" />

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) auto",
          gap: "24px",
          alignItems: "start",
        }}
      >
        <div>
          <h1 style={{ marginTop: 0, marginBottom: "10px" }}>{displayName}</h1>
          <p style={{ color: "#586379", marginTop: 0, marginBottom: "14px" }}>#{pokemon.dexNumber}</p>
          <TypeBadgeList types={pokemon.types} />
        </div>

        <div style={{ display: "grid", gap: "12px", justifyItems: "center" }}>
          <div
            style={{
              width: "180px",
              height: "180px",
              border: "1px solid #dfe5ef",
              borderRadius: "18px",
              background: "#ffffff",
              display: "grid",
              placeItems: "center",
            }}
          >
            <ReferenceImage
              src={art.src}
              fallbackSrc={art.fallbackSrc}
              alt={displayName}
              width={160}
              height={160}
              style={{ imageRendering: "pixelated" }}
            />
          </div>
          {art.shinySrc ? (
            <div style={{ textAlign: "center" }}>
              <div
                style={{
                  width: "96px",
                  height: "96px",
                  border: "1px solid #dfe5ef",
                  borderRadius: "14px",
                  background: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  margin: "0 auto 6px",
                }}
              >
                <ReferenceImage
                  src={art.shinySrc}
                  fallbackSrc={null}
                  alt={`${displayName} shiny`}
                  width={72}
                  height={72}
                  style={{ imageRendering: "pixelated" }}
                />
              </div>
              <span style={{ color: "#667389", fontSize: "0.9rem" }}>Shiny</span>
            </div>
          ) : null}
        </div>
      </section>

      <section style={{ marginTop: "28px" }}>
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
        <ul>
          {abilityRows.map((ability) => (
            <li key={`${ability.label}-${ability.value}`}>
              {ability.label}:{" "}
              <Link href={`/abilities/${ability.value.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`}>
                {ability.value}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {encounterItemRows.length > 0 ? (
        <section style={{ marginTop: "24px" }}>
          <h2>Wild Encounter Item Info</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f7fb" }}>
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
                      {entry.heldItemSlug ? (
                        <Link href={`/items/${entry.heldItemSlug}`}>{entry.heldItemName}</Link>
                      ) : (
                        entry.heldItemName
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
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px" }}>
          {evolutionFamily.map((entry) => (
            <div
              key={entry.pokemon.id}
              style={{
                minWidth: "160px",
                padding: "14px",
                border: entry.pokemon.id === pokemon.id ? "2px solid #d64a4a" : "1px solid #dfe5ef",
                borderRadius: "16px",
                background: entry.pokemon.id === pokemon.id ? "#fff5f5" : "#ffffff",
                textAlign: "center",
              }}
            >
              {entry.incomingMethod ? (
                <div style={{ color: "#667389", fontSize: "0.82rem", marginBottom: "8px" }}>
                  {entry.incomingMethod}
                </div>
              ) : (
                <div style={{ height: "20px" }} />
              )}
              {(() => {
                const sprite = getPokemonMiniSpriteSources(entry.pokemon);
                return (
                  <ReferenceImage
                    src={sprite.src}
                    fallbackSrc={sprite.fallbackSrc}
                    alt={entry.pokemon.name}
                    width={72}
                    height={72}
                    style={{ imageRendering: "pixelated" }}
                  />
                );
              })()}
              <div style={{ marginTop: "8px" }}>
                <Link href={`/pokemon/${entry.pokemon.slug}?returnTo=${encodeURIComponent(backHref)}`}>
                  {getPokemonDisplayName(entry.pokemon)}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "24px", display: "grid", gap: "18px" }}>
        <div>
          <h2>Defensive Matchups</h2>
          <div style={{ display: "grid", gap: "10px" }}>
            {defensiveMatchups.map((bucket) => (
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
          <div style={{ display: "grid", gap: "10px" }}>
            {offensiveMatchups.map((bucket) => (
              <div
                key={`${bucket.label}-${bucket.multiplier}`}
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
                <tr style={{ background: "#f5f7fb" }}>
                  <th style={cellStyle()}>Level</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle("center")}>Type</th>
                  <th style={cellStyle("center")}>Category</th>
                  <th style={cellStyle("right")}>Power</th>
                  <th style={cellStyle("right")}>Accuracy</th>
                  <th style={cellStyle("right")}>PP</th>
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
                        <MoveCategoryIcon category={move?.category ?? null} />
                      </td>
                      <td style={cellStyle("right")}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle("right")}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle("right")}>{formatValue(move?.pp ?? null)}</td>
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
                <tr style={{ background: "#f5f7fb" }}>
                  <th style={cellStyle()}>TM/HM #</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle("center")}>Type</th>
                  <th style={cellStyle("center")}>Category</th>
                  <th style={cellStyle("right")}>Power</th>
                  <th style={cellStyle("right")}>Accuracy</th>
                  <th style={cellStyle("right")}>PP</th>
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
                        <MoveCategoryIcon category={move?.category ?? null} />
                      </td>
                      <td style={cellStyle("right")}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle("right")}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle("right")}>{formatValue(move?.pp ?? null)}</td>
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
