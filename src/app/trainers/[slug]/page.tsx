import Link from "next/link";
import { notFound } from "next/navigation";
import PageNavigation from "../../../components/page-navigation";
import { getMoveByName } from "../../../lib/data/moves";
import { getPokemonById } from "../../../lib/data/pokemon";
import { getTrainerBySlug, getTrainers } from "../../../lib/data/trainers";

export const dynamicParams = false;

type TrainerDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getTrainers().map((trainer) => ({ slug: trainer.slug }));
}

export default async function TrainerDetailPage({ params }: TrainerDetailPageProps) {
  const { slug } = await params;
  const trainer = getTrainerBySlug(slug);

  if (!trainer) {
    notFound();
  }

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/trainers" backLabel="Back to Trainers" />
      <h1 style={{ marginTop: 0 }}>{trainer.name}</h1>
      <p style={{ color: "#586379" }}>
        {trainer.location} • {trainer.ruleset}
        {trainer.format ? ` • ${trainer.format}` : ""}
        {trainer.indexNumber !== null ? ` • Index ${trainer.indexNumber}` : ""}
      </p>

      {trainer.section ? (
        <section style={{ marginTop: "24px" }}>
          <h2>Section</h2>
          <p style={{ lineHeight: 1.6 }}>{trainer.section}</p>
        </section>
      ) : null}

      <section style={{ marginTop: "24px" }}>
        <h2>Team</h2>
        <div style={{ display: "grid", gap: "16px" }}>
          {trainer.team.map((member) => {
            const pokemon = member.pokemonId ? getPokemonById(member.pokemonId) : undefined;

            return (
              <article
                key={`${trainer.id}-${member.slot}`}
                style={{
                  padding: "16px",
                  border: "1px solid #d7dcea",
                  borderRadius: "12px",
                  background: "#ffffff",
                }}
              >
                <h3 style={{ marginTop: 0, marginBottom: "8px" }}>
                  Slot {member.slot}:{" "}
                  {pokemon ? (
                    <Link href={`/pokemon/${pokemon.slug}`}>{pokemon.name}</Link>
                  ) : (
                    member.pokemonName
                  )}
                </h3>
                <p style={{ color: "#586379", marginTop: 0 }}>
                  {member.level !== null ? `Lv. ${member.level}` : "Level not imported"}
                  {member.gender ? ` • ${member.gender}` : ""}
                </p>
                <ul style={{ marginBottom: 0 }}>
                  <li>Ability: {member.ability ?? "Not imported"}</li>
                  <li>Held Item: {member.heldItem ?? "None listed"}</li>
                  <li>
                    Moves:{" "}
                    {member.moves.length > 0
                      ? member.moves.map((moveName, index) => {
                          const move = getMoveByName(moveName);

                          return (
                            <span key={`${trainer.id}-${member.slot}-${moveName}`}>
                              {index > 0 ? ", " : ""}
                              {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : moveName}
                            </span>
                          );
                        })
                      : "No moves imported"}
                  </li>
                </ul>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
