import { notFound } from "next/navigation";
import Link from "next/link";
import type { CSSProperties } from "react";
import { getTmHmCompatibilityByPokemonId } from "@/lib/data/compatibility";
import { getLearnsetByPokemonId } from "@/lib/data/learnsets";
import { getMoveById } from "@/lib/data/moves";
import { getAllPokemon, getPokemonBySlug } from "@/lib/data/pokemon";
import {
  formatPokemonStatDelta,
  getMoveEffectSummary,
  getPokemonAbilityDisplayRows,
  getPokemonStatDisplayRows,
} from "@/lib/data/vanilla";

function formatValue(value: number | string | null): string {
  return value === null ? "—" : String(value);
}

function cellStyle(): CSSProperties {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid #e3e7f0",
    textAlign: "left",
    verticalAlign: "top",
  };
}

export const dynamicParams = false;

type PokemonDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getAllPokemon().map((pokemon) => ({ slug: pokemon.slug }));
}

export default async function PokemonDetailPage({ params }: PokemonDetailPageProps) {
  const { slug } = await params;
  const pokemon = getPokemonBySlug(slug);

  if (!pokemon) {
    notFound();
  }

  const compatibility = getTmHmCompatibilityByPokemonId(pokemon.id);
  const learnset = getLearnsetByPokemonId(pokemon.id);
  const statRows = getPokemonStatDisplayRows(pokemon);
  const abilityRows = getPokemonAbilityDisplayRows(pokemon);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>{pokemon.name}</h1>
      <p style={{ color: "#586379" }}>
        #{pokemon.dexNumber} • {pokemon.types.join(" / ")}
      </p>

      <section style={{ marginTop: "24px" }}>
        <h2>Stats</h2>
        <ul>
          {statRows.map((row) => (
            <li key={row.label}>
              {row.label}: {row.value}
              {formatPokemonStatDelta(row.delta)}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Abilities</h2>
        <ul>
          {abilityRows.map((ability) => (
            <li key={`${ability.label}-${ability.value}`}>
              {ability.label}: {ability.value}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Level-Up Learnset</h2>
        {learnset.length === 0 ? (
          <p>No level-up learnset data has been imported for this entry yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f7fb" }}>
                  <th style={cellStyle()}>Level</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle()}>Type</th>
                  <th style={cellStyle()}>Category</th>
                  <th style={cellStyle()}>Power</th>
                  <th style={cellStyle()}>Accuracy</th>
                  <th style={cellStyle()}>PP</th>
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
                      <td style={cellStyle()}>{move?.type ?? "—"}</td>
                      <td style={cellStyle()}>{move?.category ?? "—"}</td>
                      <td style={cellStyle()}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle()}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle()}>{formatValue(move?.pp ?? null)}</td>
                      <td style={cellStyle()}>
                        {(entry.moveId ? getMoveEffectSummary(entry.moveId) : null) ??
                          "No Gen 6 effect summary has been imported for this move yet."}
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
          <p>No TM/HM compatibility has been imported for this entry yet.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f7fb" }}>
                  <th style={cellStyle()}>TM/HM #</th>
                  <th style={cellStyle()}>Move</th>
                  <th style={cellStyle()}>Type</th>
                  <th style={cellStyle()}>Category</th>
                  <th style={cellStyle()}>Power</th>
                  <th style={cellStyle()}>Accuracy</th>
                  <th style={cellStyle()}>PP</th>
                  <th style={cellStyle()}>Effect</th>
                  <th style={cellStyle()}>Location</th>
                </tr>
              </thead>
              <tbody>
            {compatibility.map((entry) => (
              <tr key={entry.compatibilityId}>
                <td style={cellStyle()}>{entry.machine.code}</td>
                <td style={cellStyle()}>
                  {(() => {
                    const move = entry.machine.moveId ? getMoveById(entry.machine.moveId) : undefined;
                    const moveLabel = entry.machine.name.split(" - ")[1];

                    return move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : moveLabel;
                  })()}
                </td>
                {(() => {
                  const move = entry.machine.moveId ? getMoveById(entry.machine.moveId) : undefined;
                  return (
                    <>
                      <td style={cellStyle()}>{move?.type ?? "—"}</td>
                      <td style={cellStyle()}>{move?.category ?? "—"}</td>
                      <td style={cellStyle()}>{formatValue(move?.power ?? null)}</td>
                      <td style={cellStyle()}>{formatValue(move?.accuracy ?? null)}</td>
                      <td style={cellStyle()}>{formatValue(move?.pp ?? null)}</td>
                      <td style={cellStyle()}>
                        {(entry.machine.moveId ? getMoveEffectSummary(entry.machine.moveId) : null) ??
                          "No Gen 6 effect summary has been imported for this move yet."}
                      </td>
                    </>
                  );
                })()}
                <td style={cellStyle()}>{entry.machine.location ?? "—"}</td>
              </tr>
            ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
