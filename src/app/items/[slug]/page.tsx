import { notFound } from "next/navigation";
import Link from "next/link";
import ItemImage from "@/components/item-image";
import PageNavigation from "@/components/page-navigation";
import {
  getItemBySlug,
  getItemDisplayDescription,
  getItemDisplayName,
  getItemObtainDetails,
  getItems,
} from "@/lib/data/items";

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
        <ItemImage item={item} size={72} />
        <div>
          <h1 style={{ marginTop: 0, marginBottom: "6px" }}>{getItemDisplayName(item)}</h1>
          <p style={{ color: "#586379", margin: 0 }}>{item.category}</p>
        </div>
      </div>
      <p style={{ lineHeight: 1.6 }}>{getItemDisplayDescription(item)}</p>

      {foundLocations.length > 0 ? (
        <section style={{ marginTop: "24px" }}>
          <h2>Where to Obtain</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#f5f7fb" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e6ebf3" }}>Location</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e6ebf3" }}>How</th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid #e6ebf3" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {foundLocations.map((entry) => (
                  <tr key={entry.itemLocationId}>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #e6ebf3" }}>
                      <Link href={`/locations/${entry.location.slug}`}>{entry.location.name}</Link>
                    </td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #e6ebf3" }}>{entry.method}</td>
                    <td style={{ padding: "10px 12px", borderBottom: "1px solid #e6ebf3" }}>{entry.detail ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </main>
  );
}
