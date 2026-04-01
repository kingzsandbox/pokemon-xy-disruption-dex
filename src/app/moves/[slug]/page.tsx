import { notFound } from "next/navigation";
import { getMachineLinksByMoveId } from "@/lib/data/compatibility";
import { getLearnsetByMoveId } from "@/lib/data/learnsets";
import {
  getMoveBySlug,
  getMoveBattleDataRows,
  getMoves,
  getMoveSourceCoverageNote,
  hasImportedMoveBattleData,
} from "@/lib/data/moves";
import { getPokemonById } from "@/lib/data/pokemon";

export const dynamicParams = false;

type MoveDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getMoves().map((move) => ({ slug: move.slug }));
}

export default async function MoveDetailPage({ params }: MoveDetailPageProps) {
  const { slug } = await params;
  const move = getMoveBySlug(slug);

  if (!move) {
    notFound();
  }

  const machineLinks = getMachineLinksByMoveId(move.id);
  const learnsetLinks = getLearnsetByMoveId(move.id);
  const hasBattleData = hasImportedMoveBattleData(move);
  const battleDataRows = getMoveBattleDataRows(move);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>{move.name}</h1>
      <p style={{ color: "#586379", textTransform: "capitalize" }}>{move.status}</p>

      <section style={{ marginTop: "24px" }}>
        <h2>Battle Data</h2>
        {hasBattleData ? (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "12px",
            }}
          >
            {battleDataRows.map((row) => (
              <div
                key={row.label}
                style={{
                  padding: "14px",
                  border: "1px solid #d7dcea",
                  borderRadius: "12px",
                  background: "#ffffff",
                }}
              >
                <div style={{ color: "#586379", fontSize: "0.9rem", marginBottom: "6px" }}>
                  {row.label}
                </div>
                <strong>{row.value}</strong>
              </div>
            ))}
          </div>
        ) : (
          <p style={{ color: "#586379", lineHeight: 1.6 }}>{getMoveSourceCoverageNote()}</p>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Notes</h2>
        <p style={{ lineHeight: 1.6 }}>
          {move.notes ?? "No move note is listed for this move in the current source workbook."}
        </p>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>TM / HM / MT Linkage</h2>
        {machineLinks.length === 0 ? (
          <p>No TM/HM/MT linkage has been imported for this move.</p>
        ) : (
          <>
            <p style={{ color: "#586379" }}>
              Imported machine linkage is available for this move.
            </p>
            <ul>
            {machineLinks.map((link) => (
              <li key={link.machine.id}>
                <strong>{link.machine.code}</strong>
                {link.machine.location ? ` • ${link.machine.location}` : ""}
                {link.compatiblePokemonIds.length > 0
                  ? ` • ${link.compatiblePokemonIds.length} compatible Pokémon`
                  : ""}
                {link.compatiblePokemonIds.length > 0 ? (
                  <div style={{ color: "#586379", marginTop: "4px" }}>
                    {link.compatiblePokemonIds
                      .slice(0, 6)
                      .map((pokemonId) => getPokemonById(pokemonId)?.name ?? pokemonId)
                      .join(", ")}
                  </div>
                ) : null}
              </li>
            ))}
            </ul>
          </>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Level-Up Learners</h2>
        {learnsetLinks.length === 0 ? (
          <p>No level-up learnset linkage has been imported for this move.</p>
        ) : (
          <>
            <p style={{ color: "#586379" }}>
              Imported level-up learner data is available for this move.
            </p>
            <ul>
              {learnsetLinks.slice(0, 40).map((entry) => (
                <li key={entry.learnsetId}>
                  {getPokemonById(entry.pokemonId)?.name ?? entry.pokemonId}
                  {entry.level !== null ? ` • Lv. ${entry.level}` : ""}
                </li>
              ))}
            </ul>
          </>
        )}
        {learnsetLinks.length > 40 ? (
          <p style={{ color: "#586379" }}>
            Showing 40 of {learnsetLinks.length} imported level-up learners.
          </p>
        ) : null}
      </section>
    </main>
  );
}
