import { notFound } from "next/navigation";
import Link from "next/link";
import ItemImage from "../../../components/item-image";
import PageNavigation from "../../../components/page-navigation";
import {
  getItemBySlug,
  getItemDisplayCategory,
  getItemDisplayDescription,
  getItemDisplayName,
  getItemObtainDetails,
  getItems,
} from "../../../lib/data/items";

export const dynamicParams = false;

type ItemDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getItems().map((item) => ({ slug: item.slug }));
}

export default async function ItemDetailPage({ params }: ItemDetailPageProps) {
  const { slug } = await params;
  const item = getItemBySlug(slug);

  if (!item) {
    notFound();
  }

  const foundLocations = getItemObtainDetails(item.id);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/items" backLabel="Back to Items" />
      <div style={{ display: "flex", alignItems: "center", gap: "18px", marginBottom: "12px" }}>
        <ItemImage item={item} size={84} />
        <div>
          <h1 style={{ marginTop: 0, marginBottom: "6px" }}>{getItemDisplayName(item)}</h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>{getItemDisplayCategory(item)}</p>
        </div>
      </div>
      <p style={{ lineHeight: 1.6 }}>{getItemDisplayDescription(item)}</p>

      {foundLocations.length > 0 ? (
        <section style={{ marginTop: "24px" }}>
          <h2>Where to Obtain</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)", background: "var(--surface-muted)" }}>Location</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)", background: "var(--surface-muted)" }}>How</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)", background: "var(--surface-muted)" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {foundLocations.map((entry) => (
                  <tr key={entry.itemLocationId}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                      {entry.locationSlug ? (
                        <Link href={`/locations/${entry.locationSlug}`}>{entry.locationName}</Link>
                      ) : (
                        entry.locationName
                      )}
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>{entry.method}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>{entry.detail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <section style={{ marginTop: "24px" }}>
          <h2>Where to Obtain</h2>
          <p>No obtain source is listed for this item.</p>
        </section>
      )}
    </main>
  );
}
