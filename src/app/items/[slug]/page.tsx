import { notFound } from "next/navigation";
import Link from "next/link";
import {
  getItemBySlug,
  getItemDisplayDescription,
  getItems,
  getItemLocationStatusMessage,
  getLocationsByItem,
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

  const foundLocations = getLocationsByItem(item.id);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>{item.name}</h1>
      <p style={{ color: "#586379" }}>{item.category}</p>
      <p style={{ lineHeight: 1.6 }}>{getItemDisplayDescription(item)}</p>

      <section style={{ marginTop: "24px" }}>
        <h2>Imported Location Data</h2>
        <p style={{ color: "#586379", lineHeight: 1.6 }}>
          {getItemLocationStatusMessage(foundLocations.length > 0)}
        </p>
        {foundLocations.length === 0 ? (
          <p>This item currently has no linked shop, trash can, or special-placement reference.</p>
        ) : (
          <ul>
            {foundLocations.map((entry) => (
              <li key={entry.itemLocationId}>
                <Link href={`/locations/${entry.location.slug}`}>{entry.location.name}</Link>
                {entry.notes ? ` • ${entry.notes}` : ""}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
