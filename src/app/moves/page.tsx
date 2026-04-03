import Link from "next/link";
import { MoveCategoryIcon, TypeBadgeList } from "@/components/dex-visuals";
import PageNavigation from "@/components/page-navigation";
import { getMoveEffectSummary } from "@/lib/data/vanilla";
import { getMoves } from "@/lib/data/moves";

function cellStyle(align: "left" | "center" | "right" = "left") {
  return {
    padding: "10px 12px",
    borderBottom: "1px solid #e6ebf3",
    textAlign: align,
    verticalAlign: "top",
  } as const;
}

export default function MovesPage() {
  const moves = getMoves();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>All Moves</h1>
      <div style={{ overflowX: "auto", marginTop: "24px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f6f8fc" }}>
              <th style={cellStyle()}>Move</th>
              <th style={cellStyle("center")}>Type</th>
              <th style={cellStyle("center")}>Category</th>
              <th style={cellStyle("right")}>Power</th>
              <th style={cellStyle("right")}>Accuracy</th>
              <th style={cellStyle("right")}>PP</th>
              <th style={cellStyle()}>Effect Summary</th>
            </tr>
          </thead>
          <tbody>
            {moves.map((move) => (
              <tr key={move.id}>
                <td style={cellStyle()}>
                  <Link href={`/moves/${move.slug}`}>{move.name}</Link>
                </td>
                <td style={cellStyle("center")}>
                  {move.type ? <TypeBadgeList types={[move.type]} /> : "—"}
                </td>
                <td style={cellStyle("center")}>
                  <MoveCategoryIcon category={move.category} />
                </td>
                <td style={cellStyle("right")}>{move.power ?? "—"}</td>
                <td style={cellStyle("right")}>{move.accuracy ?? "—"}</td>
                <td style={cellStyle("right")}>{move.pp ?? "—"}</td>
                <td style={{ ...cellStyle(), whiteSpace: "normal", minWidth: "280px" }}>
                  {getMoveEffectSummary(move.id) ?? "No effect summary listed."}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
