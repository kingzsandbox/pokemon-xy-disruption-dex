import { notFound } from "next/navigation";
import { getItemBySlug, getItemDisplayDescription, getItems } from "@/lib/data/items";

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

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>{item.name}</h1>
      <p style={{ color: "#586379" }}>{item.category}</p>
      <p style={{ lineHeight: 1.6 }}>{getItemDisplayDescription(item)}</p>
    </main>
  );
}
