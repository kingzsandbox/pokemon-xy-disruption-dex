import PageNavigation from "../../components/page-navigation";
import { getLevelCaps } from "../../lib/data/systems";

export default function LevelCapsPage() {
  const levelCaps = getLevelCaps();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Level Caps</h1>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {levelCaps.map((entry) => (
          <article
            key={entry.id}
            style={{
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong>{entry.trainer}</strong>
            <div style={{ color: "#586379", marginTop: "6px" }}>
              {entry.location} • Level Cap {entry.level} • {entry.pokemonCount} Pokémon
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
