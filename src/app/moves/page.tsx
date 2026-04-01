import Link from "next/link";
import { getMoveSourceCoverageNote, getMoves } from "@/lib/data/moves";

export default function MovesPage() {
  const moves = getMoves();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>All Moves</h1>
      <p style={{ color: "#586379" }}>
        Browse every imported move entry, including usable, reduced, and removed moves.
      </p>
      <p style={{ color: "#586379", lineHeight: 1.6 }}>{getMoveSourceCoverageNote()}</p>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {moves.map((move) => (
          <Link
            key={move.id}
            href={`/moves/${move.slug}`}
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong>{move.name}</strong>
            <div style={{ color: "#586379", marginTop: "6px", textTransform: "capitalize" }}>
              {move.status}
              {move.type ? ` • ${move.type}` : ""}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
