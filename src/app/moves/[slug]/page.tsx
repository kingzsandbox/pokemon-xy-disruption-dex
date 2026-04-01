import { notFound } from "next/navigation";
import { getMoveBySlug, getMoves } from "@/lib/data/moves";

export const dynamicParams = false;

type MoveDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatStat(value: number | string | null): string {
  return value === null ? "Not imported yet" : String(value);
}

export async function generateStaticParams() {
  return getMoves().map((move) => ({ slug: move.slug }));
}

export default async function MoveDetailPage({ params }: MoveDetailPageProps) {
  const { slug } = await params;
  const move = getMoveBySlug(slug);

  if (!move) {
    notFound();
  }

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>{move.name}</h1>
      <p style={{ color: "#586379", textTransform: "capitalize" }}>{move.status}</p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: "12px",
          marginTop: "24px",
        }}
      >
        {[
          ["Type", formatStat(move.type)],
          ["Category", formatStat(move.category)],
          ["Power", formatStat(move.power)],
          ["Accuracy", formatStat(move.accuracy)],
          ["PP", formatStat(move.pp)],
        ].map(([label, value]) => (
          <div
            key={label}
            style={{
              padding: "14px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <div style={{ color: "#586379", fontSize: "0.9rem", marginBottom: "6px" }}>{label}</div>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <section style={{ marginTop: "24px" }}>
        <h2>Notes</h2>
        <p style={{ lineHeight: 1.6 }}>
          {move.notes ?? "No move notes have been imported from the current source workbook."}
        </p>
      </section>
    </main>
  );
}
