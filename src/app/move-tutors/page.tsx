import Link from "next/link";
import { MoveCategoryIcon, TypeBadgeList } from "../../components/dex-visuals";
import PageNavigation from "../../components/page-navigation";
import ReferenceImage from "../../components/reference-image";
import { getMoveTutorImageSource } from "../../lib/assets";
import { getMoveTutorBrowseEntries, getCompatiblePokemonByMachineId } from "../../lib/data/compatibility";
import { getPokemonDisplayName } from "../../lib/presentation";
import { getMoveEffectSummary } from "../../lib/data/vanilla";

function cellStyle(align: "left" | "center" = "left") {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid var(--border-soft)",
    textAlign: align,
    verticalAlign: "top",
  } as const;
}

type TutorSection = {
  key: string;
  title: string;
  detail: string;
  imageSrc: string | null;
  tutorIds: string[];
};

const tutorSections: TutorSection[] = [
  {
    key: "laverre-pledge",
    title: "Laverre City",
    detail: "Northeastern cafe in Laverre City. The lass tutor inside teaches the pledge moves to fully friendly starter Pokémon.",
    imageSrc: getMoveTutorImageSource("MT01", "Laverre City"),
    tutorIds: ["machine-mt01", "machine-mt02", "machine-mt03"],
  },
  {
    key: "snowbelle-ultimate",
    title: "Snowbelle City",
    detail: "House southwest of the Gym. The artist tutor here teaches Frenzy Plant, Blast Burn, and Hydro Cannon.",
    imageSrc: getMoveTutorImageSource("MT04", "Snowbelle City"),
    tutorIds: ["machine-mt04", "machine-mt05", "machine-mt06"],
  },
  {
    key: "snowbelle-mythical",
    title: "Snowbelle City",
    detail: "House behind the Pokémon Center, just left of Abomasnow. The Ace Trainer tutor here teaches Secret Sword and Relic Song.",
    imageSrc: getMoveTutorImageSource("MT07", "Snowbelle City"),
    tutorIds: ["machine-mt07", "machine-mt08"],
  },
  {
    key: "route-21-draco",
    title: "Route 21",
    detail: "House on Route 21 (Dernière Way), on the final route before Victory Road. The Black Belt tutor teaches Draco Meteor.",
    imageSrc: getMoveTutorImageSource("MT09", "Route 21"),
    tutorIds: ["machine-mt09"],
  },
];

export default function MoveTutorsPage() {
  const tutors = getMoveTutorBrowseEntries();
  const tutorMap = new Map(tutors.map((entry) => [entry.machine.id, entry]));
  const sections = tutorSections
    .map((section) => ({
      ...section,
      tutors: section.tutorIds.map((id) => tutorMap.get(id)).filter((entry) => entry !== undefined),
    }))
    .filter((section) => section.tutors.length > 0);

  return (
    <main style={{ margin: "0 auto", maxWidth: "1100px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/" backLabel="Back to Pokedex" />
      <h1 style={{ marginTop: 0 }}>Move Tutors</h1>

      <div style={{ display: "grid", gap: "28px", marginTop: "24px" }}>
        {sections.map((section) => (
          <section key={section.key}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: section.imageSrc ? "88px minmax(0, 1fr)" : "1fr",
                gap: "16px",
                alignItems: "center",
                marginBottom: "14px",
              }}
            >
              {section.imageSrc ? (
                <div
                  style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid var(--border-soft)",
                    background: "var(--surface-muted)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <ReferenceImage
                    src={section.imageSrc}
                    fallbackSrc={null}
                    alt={`${section.title} tutor`}
                    width={88}
                    height={88}
                    style={{ width: "88px", height: "88px", objectFit: "cover" }}
                  />
                </div>
              ) : null}
              <div>
                <h2 style={{ marginTop: 0, marginBottom: "8px" }}>{section.title}</h2>
                <p style={{ color: "var(--text-muted)", margin: 0, lineHeight: 1.6 }}>{section.detail}</p>
              </div>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              {section.tutors.map(({ machine, move }) => {
                const compatiblePokemon = getCompatiblePokemonByMachineId(machine.id);
                return (
                  <article
                    key={machine.id}
                    id={machine.slug}
                    style={{
                      border: "1px solid var(--border-soft)",
                      borderRadius: "16px",
                      background: "var(--surface-card)",
                      overflow: "hidden",
                    }}
                  >
                    <div style={{ padding: "14px 16px", borderBottom: "1px solid var(--border-soft)" }}>
                      <strong>
                        {machine.code} {move ? `- ${move.name}` : ""}
                      </strong>
                    </div>

                    {move ? (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                          <thead>
                            <tr style={{ background: "var(--surface-muted)" }}>
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
                            <tr>
                              <td style={cellStyle()}>
                                <Link href={`/moves/${move.slug}`}>{move.name}</Link>
                              </td>
                              <td style={cellStyle("center")}>
                                {move.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                              </td>
                              <td style={cellStyle("center")}>
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    width: "100%",
                                  }}
                                >
                                  <MoveCategoryIcon category={move.category} />
                                </span>
                              </td>
                              <td style={cellStyle("center")}>{move.power ?? "—"}</td>
                              <td style={cellStyle("center")}>{move.accuracy ?? "—"}</td>
                              <td style={cellStyle("center")}>{move.pp ?? "—"}</td>
                              <td style={{ ...cellStyle(), minWidth: "280px", whiteSpace: "normal" }}>
                                {getMoveEffectSummary(move.id) ?? "No effect summary listed."}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div style={{ padding: "14px 16px" }}>No move listed.</div>
                    )}

                    <div style={{ padding: "14px 16px", display: "grid", gap: "8px" }}>
                      <strong>Compatible Pokémon</strong>
                      {compatiblePokemon.length === 0 ? (
                        <span style={{ color: "var(--text-muted)" }}>No compatible Pokémon listed.</span>
                      ) : (
                        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 12px" }}>
                          {compatiblePokemon.map((pokemon) => (
                            <Link
                              key={`${machine.id}-${pokemon.id}`}
                              href={`/pokemon/${pokemon.slug}?returnTo=${encodeURIComponent("/move-tutors")}`}
                              style={{ color: "var(--text-body)" }}
                            >
                              {getPokemonDisplayName(pokemon)}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </main>
  );
}
