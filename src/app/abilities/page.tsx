import Link from "next/link";
import PageNavigation from "../../components/page-navigation";
import { getAbilities } from "../../lib/data/abilities";

export default function AbilitiesPage() {
  const abilities = getAbilities();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Abilities</h1>
      <div style={{ display: "grid", gap: "12px" }}>
        {abilities.map((ability) => (
          <Link
            key={ability.id}
            href={`/abilities/${ability.slug}`}
            style={{
              display: "grid",
              gap: "4px",
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong style={{ color: "#273246" }}>{ability.name}</strong>
            <span style={{ color: "#586379", lineHeight: 1.5 }}>{ability.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
