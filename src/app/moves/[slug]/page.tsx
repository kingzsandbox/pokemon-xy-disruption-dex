import Link from "next/link";
import { notFound } from "next/navigation";
import { MoveCategoryIcon, TypeBadgeList } from "@/components/dex-visuals";
import PageNavigation from "@/components/page-navigation";
import ReferenceImage from "@/components/reference-image";
import { getPokemonMiniSpriteSources } from "@/lib/assets";
import { getMachineLinksByMoveId } from "@/lib/data/compatibility";
import { getLearnsetByMoveId } from "@/lib/data/learnsets";
import { getMoveBySlug, getMoveBattleDataRows, getMoves, hasImportedMoveBattleData } from "@/lib/data/moves";
import { getPokemonById } from "@/lib/data/pokemon";
import { getPokemonDisplayName } from "@/lib/presentation";
import { getMoveEffectSummary } from "@/lib/data/vanilla";
import { isBrowsableMachine } from "@/lib/data/compatibility";

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

  const machineLinks = getMachineLinksByMoveId(move.id).filter((link) => isBrowsableMachine(link.machine));
  const learnsetLinks = getLearnsetByMoveId(move.id);
  const hasBattleData = hasImportedMoveBattleData(move);
  const battleDataRows = getMoveBattleDataRows(move);
  const effectSummary = getMoveEffectSummary(move.id) ?? "No effect summary listed.";

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/moves" backLabel="Back to All Moves" />
      <h1 style={{ marginTop: 0 }}>{move.name}</h1>
      <p style={{ color: "#586379", lineHeight: 1.7, marginTop: "10px", marginBottom: 0 }}>{effectSummary}</p>

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
                <div style={{ color: "#586379", fontSize: "0.9rem", marginBottom: "6px" }}>{row.label}</div>
                {row.label === "Type" ? (
                  <TypeBadgeList types={[row.value]} />
                ) : row.label === "Category" ? (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <MoveCategoryIcon category={row.value} />
                    <strong>{row.value}</strong>
                  </span>
                ) : (
                  <strong>{row.value}</strong>
                )}
              </div>
            ))}
            {machineLinks.length > 0 ? (
              <div
                style={{
                  padding: "14px",
                  border: "1px solid #d7dcea",
                  borderRadius: "12px",
                  background: "#ffffff",
                  gridColumn: "span 2",
                }}
              >
                <div style={{ color: "#586379", fontSize: "0.9rem", marginBottom: "6px" }}>TM / HM</div>
                <strong>
                  {machineLinks.map((link, index) => (
                    <span key={link.machine.id}>
                      {index > 0 ? ", " : ""}
                      <Link href={`/machines/${link.machine.slug}`}>{link.machine.code}</Link>
                    </span>
                  ))}
                </strong>
                <div style={{ color: "#586379", marginTop: "6px" }}>
                  {machineLinks
                    .map((link) =>
                      link.machine.location ? `${link.machine.code} • ${link.machine.location}` : link.machine.code,
                    )
                    .join(" • ")}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <p style={{ color: "#586379", lineHeight: 1.6 }}>No battle data listed.</p>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Level-Up Learners</h2>
        {learnsetLinks.length === 0 ? (
          <p>No level-up learners listed.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {learnsetLinks.slice(0, 40).map((entry) => {
              const pokemon = getPokemonById(entry.pokemonId);
              if (!pokemon) {
                return null;
              }
              const sprite = getPokemonMiniSpriteSources(pokemon);
              return (
                <Link
                  key={entry.learnsetId}
                  href={`/pokemon/${pokemon.slug}?returnTo=${encodeURIComponent(`/moves/${move.slug}`)}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 72px 1fr auto",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderBottom: "1px solid #e6ebf3",
                  }}
                >
                  <ReferenceImage
                    src={sprite.src}
                    fallbackSrc={sprite.fallbackSrc}
                    alt={pokemon.name}
                    width={44}
                    height={44}
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span style={{ color: "#667389" }}>#{pokemon.dexNumber}</span>
                  <span style={{ color: "#273246", fontWeight: 600 }}>{getPokemonDisplayName(pokemon)}</span>
                  <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                    <TypeBadgeList types={pokemon.types} />
                    {entry.level !== null ? <span style={{ color: "#667389" }}>Lv. {entry.level}</span> : null}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
        {learnsetLinks.length > 40 ? (
          <p style={{ color: "#586379" }}>Showing 40 of {learnsetLinks.length} learners.</p>
        ) : null}
      </section>
    </main>
  );
}
