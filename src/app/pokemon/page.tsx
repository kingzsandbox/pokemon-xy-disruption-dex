import Link from "next/link";
import { getAllPokemon } from "@/lib/data/pokemon";

export default function PokemonListPage() {
  const pokemon = getAllPokemon();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>Pokémon</h1>
      <p style={{ color: "#586379" }}>Starter sample dataset for the disruption dex.</p>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {pokemon.map((entry) => (
          <Link
            key={entry.id}
            href={`/pokemon/${entry.slug}`}
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong>{entry.name}</strong>
            <div style={{ color: "#586379", marginTop: "6px" }}>
              #{entry.dexNumber} • {entry.types.join(" / ")}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
