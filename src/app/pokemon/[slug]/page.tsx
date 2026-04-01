import { notFound } from "next/navigation";
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
    </main>
  );
}
