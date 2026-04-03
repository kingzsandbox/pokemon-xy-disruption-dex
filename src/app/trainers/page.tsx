import Link from "next/link";
import PageNavigation from "../../components/page-navigation";
import { getTrainers } from "../../lib/data/trainers";

export default function TrainersPage() {
  const trainers = getTrainers();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Trainers</h1>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {trainers.map((trainer) => (
          <Link
            key={trainer.id}
            href={`/trainers/${trainer.slug}`}
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong>{trainer.name}</strong>
            <div style={{ color: "#586379", marginTop: "6px" }}>
              {trainer.location} • {trainer.ruleset}
              {trainer.format ? ` • ${trainer.format}` : ""}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
