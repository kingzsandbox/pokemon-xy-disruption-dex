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
              gridTemplateColumns: "220px 1fr",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              border: "1px solid var(--border-soft)",
              borderRadius: "14px",
              background: "var(--surface-card)",
            }}
          >
            <strong style={{ color: "var(--text-body)" }}>{ability.name}</strong>
            <span style={{ color: "var(--text-muted)", lineHeight: 1.5 }}>{ability.description}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
