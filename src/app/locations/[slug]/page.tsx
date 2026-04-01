import { notFound } from "next/navigation";
import { getEncountersByLocation } from "@/lib/data/encounters";
import { getItemSectionsByLocation } from "@/lib/data/items";
import { getLocationBySlug, getLocations } from "@/lib/data/locations";
import { getPokemonById } from "@/lib/data/pokemon";

export const dynamicParams = false;

type LocationDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getLocations().map((location) => ({ slug: location.slug }));
}

export default async function LocationDetailPage({ params }: LocationDetailPageProps) {
  const { slug } = await params;
  const location = getLocationBySlug(slug);

  if (!location) {
    notFound();
  }

  const encounters = getEncountersByLocation(location.id);
  const itemSections = getItemSectionsByLocation(location.id);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>{location.name}</h1>
      <p style={{ color: "#586379" }}>{location.region}</p>
      <p style={{ lineHeight: 1.6 }}>{location.description}</p>

      <section style={{ marginTop: "24px" }}>
        <h2>Encounters</h2>
        {encounters.length === 0 ? (
          <p>No encounters listed yet.</p>
        ) : (
          <ul>
            {encounters.map((encounter) => {
              const pokemon = getPokemonById(encounter.pokemonId);
              return (
                <li key={encounter.id}>
                  {pokemon?.name ?? encounter.pokemonId} • {encounter.method} • Lv.{" "}
                  {encounter.minLevel === encounter.maxLevel
                    ? encounter.minLevel
                    : `${encounter.minLevel}-${encounter.maxLevel}`}{" "}
                  • {encounter.rate}% rate
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Items Found Here</h2>
        <p style={{ color: "#586379", lineHeight: 1.6 }}>
          This section currently reflects imported shop inventory, trash can finds, and special
          item placements only. Comprehensive route and field pickup coverage is not present in the
          current source set.
        </p>
        {itemSections.length === 0 ? (
          <p>No imported location item data is available for this area yet.</p>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {itemSections.map((section) => (
              <section key={section.key}>
                <h3 style={{ marginBottom: "10px" }}>{section.title}</h3>
                <ul style={{ marginTop: 0 }}>
                  {section.items.map((item) => (
                    <li key={item.itemLocationId}>
                      {item.item.name}
                      {item.notes ? ` • ${item.notes}` : ""}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
