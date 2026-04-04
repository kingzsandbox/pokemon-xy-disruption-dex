import Link from "next/link";
import PageNavigation from "../../components/page-navigation";
import { getLocations } from "../../lib/data/locations";

export default function LocationsPage() {
  const locations = getLocations();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Locations</h1>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {locations.map((location) => (
          <Link
            key={location.id}
            href={`/locations/${location.slug}`}
            style={{
              display: "grid",
              gridTemplateColumns: "1fr auto",
              alignItems: "center",
              gap: "16px",
              padding: "16px",
              border: "1px solid var(--border-soft)",
              borderRadius: "14px",
              background: "var(--surface-card)",
            }}
          >
            <strong style={{ color: "var(--text-body)" }}>{location.name}</strong>
            <span style={{ color: "var(--text-muted)", textAlign: "right" }}>{location.region}</span>
          </Link>
        ))}
      </div>
    </main>
  );
}
