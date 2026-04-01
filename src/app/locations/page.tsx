import Link from "next/link";
import { getLocations } from "@/lib/data/locations";

export default function LocationsPage() {
  const locations = getLocations();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>Locations</h1>
      <p style={{ color: "#586379" }}>Browse imported encounter and item locations.</p>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {locations.map((location) => (
          <Link
            key={location.id}
            href={`/locations/${location.slug}`}
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong>{location.name}</strong>
            <div style={{ color: "#586379", marginTop: "6px" }}>{location.region}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
