import Link from "next/link";
import { getLevelCaps, getResolvedPickupEntriesByTable } from "@/lib/data/systems";

export default function SystemsPage() {
  const levelCaps = getLevelCaps();
  const commonPickupEntries = getResolvedPickupEntriesByTable("common");
  const rarePickupEntries = getResolvedPickupEntriesByTable("rare");
  const pickupSections = [
    { label: "Common Table", entries: commonPickupEntries },
    { label: "Rare Table", entries: rarePickupEntries },
  ];

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>Systems</h1>
      <p style={{ color: "#586379" }}>
        Browse imported blind level cap checkpoints and pickup system reference tables from the
        current source files.
      </p>

      <section id="level-caps" style={{ marginTop: "32px", scrollMarginTop: "24px" }}>
        <h2>Blind Level Caps</h2>
        <p style={{ color: "#586379" }}>
          Imported from the blind level cap workbook. Each row is a source-backed checkpoint.
        </p>
        <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
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
      </section>

      <section id="pickup-table" style={{ marginTop: "32px", scrollMarginTop: "24px" }}>
        <h2>Pickup Item Tables</h2>
        <p style={{ color: "#586379" }}>
          Imported from the pickup table reference doc. This is a system table, not a location map.
        </p>

        {pickupSections.map(({ label, entries }) => (
          <section key={label} style={{ marginTop: "20px" }}>
            <h3 style={{ marginBottom: "8px" }}>{label}</h3>
            <p style={{ color: "#586379", marginTop: 0 }}>
              {entries[0]?.entry.rateLabel ?? "Rate label not imported."}
            </p>
            <ul>
              {entries.map(({ entry, item }) => (
                <li key={entry.id}>
                  {item ? <Link href={`/items/${item.slug}`}>{item.name}</Link> : entry.itemName}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </section>
    </main>
  );
}
