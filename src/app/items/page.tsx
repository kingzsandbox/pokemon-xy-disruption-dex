import Link from "next/link";
import ItemImage from "@/components/item-image";
import PageNavigation from "@/components/page-navigation";
import { getBrowseItems } from "@/lib/data/items";

export default function ItemsPage() {
  const items = getBrowseItems();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>Items</h1>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/items/${item.slug}`}
            style={{
              display: "grid",
              gridTemplateColumns: "56px 1fr",
              alignItems: "center",
              gap: "14px",
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <ItemImage item={item} size={40} framed />
            <span>
              <strong>{item.name}</strong>
              <div style={{ color: "#586379", marginTop: "6px" }}>{item.category}</div>
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
