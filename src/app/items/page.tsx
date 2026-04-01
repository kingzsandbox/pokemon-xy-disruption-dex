import Link from "next/link";
import { getItemCoverageNote, getItems } from "@/lib/data/items";

export default function ItemsPage() {
  const items = getItems();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>Items</h1>
      <p style={{ color: "#586379" }}>Browse imported item records from the current source set.</p>
      <p style={{ color: "#586379", lineHeight: 1.6 }}>{getItemCoverageNote()}</p>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.slug}`}
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong>{item.name}</strong>
            <div style={{ color: "#586379", marginTop: "6px" }}>{item.category}</div>
          </Link>
        ))}
      </div>
    </main>
  );
}
