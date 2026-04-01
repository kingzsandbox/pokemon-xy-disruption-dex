import { notFound } from "next/navigation";
import Link from "next/link";
import { getCompatibilityByPokemonId } from "@/lib/data/compatibility";
import { getLearnsetByPokemonId } from "@/lib/data/learnsets";
import { getMoveById } from "@/lib/data/moves";
import { getAllPokemon, getPokemonBySlug } from "@/lib/data/pokemon";

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

  const compatibility = getCompatibilityByPokemonId(pokemon.id);
  const learnset = getLearnsetByPokemonId(pokemon.id);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>{pokemon.name}</h1>
      <p style={{ color: "#586379" }}>
        #{pokemon.dexNumber} • {pokemon.types.join(" / ")}
      </p>

      <section style={{ marginTop: "24px" }}>
        <h2>Stats</h2>
        <ul>
          <li>HP: {pokemon.baseStats.hp}</li>
          <li>Attack: {pokemon.baseStats.attack}</li>
          <li>Defense: {pokemon.baseStats.defense}</li>
          <li>Sp. Atk: {pokemon.baseStats.specialAttack}</li>
          <li>Sp. Def: {pokemon.baseStats.specialDefense}</li>
          <li>Speed: {pokemon.baseStats.speed}</li>
        </ul>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Abilities</h2>
        <ul>
          {pokemon.abilities.map((ability) => (
            <li key={ability}>{ability}</li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Change Summary</h2>
        <p style={{ lineHeight: 1.6 }}>{pokemon.changeSummary}</p>
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>TM / HM / MT Compatibility</h2>
        {compatibility.length === 0 ? (
          <p>No machine compatibility has been imported for this entry yet.</p>
        ) : (
          <ul>
            {compatibility.map((entry) => (
              <li key={entry.compatibilityId}>
                <strong>{entry.machine.code}</strong> •{" "}
                {(() => {
                  const move = entry.machine.moveId ? getMoveById(entry.machine.moveId) : undefined;
                  const moveLabel = entry.machine.name.split(" - ")[1];

                  return move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : moveLabel;
                })()}
                {entry.machine.location ? ` • ${entry.machine.location}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Level-Up Learnset</h2>
        {learnset.length === 0 ? (
          <p>No level-up learnset data has been imported for this entry yet.</p>
        ) : (
          <ul>
            {learnset.map((entry) => {
              const move = entry.moveId ? getMoveById(entry.moveId) : undefined;

              return (
                <li key={entry.learnsetId}>
                  {entry.level !== null ? `Lv. ${entry.level}` : "Level unknown"} •{" "}
                  {move ? <Link href={`/moves/${move.slug}`}>{move.name}</Link> : entry.moveName}
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </main>
  );
}
