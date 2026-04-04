import { notFound } from "next/navigation";
import Link from "next/link";
import { EncounterMethodBadge, TypeBadgeList } from "../../../components/dex-visuals";
import ItemImage from "../../../components/item-image";
import PageNavigation from "../../../components/page-navigation";
import ReferenceImage from "../../../components/reference-image";
import { getPokemonMiniSpriteSources } from "../../../lib/assets";
import { getEncounterHeldItemDetails, getEncountersByLocation } from "../../../lib/data/encounters";
import { getItemDisplayName, getItemSectionsByLocation } from "../../../lib/data/items";
import { getLocationBySlug, getLocationDisplayDescription, getLocations } from "../../../lib/data/locations";
import { getPokemonDisplayName } from "../../../lib/presentation";
import { getPokemonById } from "../../../lib/data/pokemon";

export const dynamicParams = false;

type LocationDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatLocationItemNote(notes: string): string {
  const trimmed = notes.trim();
  const tmShopMatch = trimmed.match(/^Shop - TMs; price ([\d.]+)$/i);
  if (tmShopMatch) {
    const price = Number.parseFloat(tmShopMatch[1]);
    return Number.isFinite(price) ? `TM Shop • ${new Intl.NumberFormat('en-US').format(price)}` : 'TM Shop';
  }

  return trimmed
    .replace(/^Shop - TMs/i, 'TM Shop')
    .replace(/^Shop - /i, 'Shop • ')
    .replace(/;\s*price\s*([\d.]+)/gi, (_, value) => {
      const price = Number.parseFloat(value);
      return Number.isFinite(price) ? ` • ${new Intl.NumberFormat('en-US').format(price)}` : '';
    })
    .replace(/;\s*hidden item/gi, ' • Hidden item')
    .replace(/;\s*hidden/gi, ' • Hidden')
    .replace(/;\s*/g, ' • ')
    .replace(/\s+/g, ' ')
    .trim();
}

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
  const description = getLocationDisplayDescription(location);

  return (
    <main style={{ margin: "0 auto", maxWidth: "980px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/locations" backLabel="Back to Locations" />
      <h1 style={{ marginTop: 0 }}>{location.name}</h1>
      <p style={{ color: "var(--text-muted)" }}>{location.region}</p>
      {description ? <p style={{ lineHeight: 1.6 }}>{description}</p> : null}

      <section style={{ marginTop: "24px" }}>
        <h2>Encounters</h2>
        {encounters.length === 0 ? (
          <p>No encounters listed.</p>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "var(--surface-muted)" }}>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                    Pokémon
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid var(--border-soft)" }}>
                    Type
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                    Method
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid var(--border-soft)" }}>
                    Encounter Rate
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                    Level
                  </th>
                  <th style={{ padding: "10px 12px", textAlign: "left", borderBottom: "1px solid var(--border-soft)" }}>
                    Held Item
                  </th>
                </tr>
              </thead>
              <tbody>
                {encounters.map((encounter) => {
                  const pokemon = getPokemonById(encounter.pokemonId);
                  const heldItems = getEncounterHeldItemDetails(encounter);
                  const sprite = pokemon ? getPokemonMiniSpriteSources(pokemon) : null;
                  return (
                    <tr key={encounter.id}>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "44px 52px 1fr", gap: "10px", alignItems: "center" }}>
                          {pokemon && sprite ? (
                            <ReferenceImage
                              src={sprite.src}
                              fallbackSrc={sprite.fallbackSrc}
                              alt={pokemon.name}
                              width={40}
                              height={40}
                              style={{ imageRendering: "pixelated" }}
                            />
                          ) : (
                          <span />
                        )}
                          <span style={{ color: "var(--text-muted)" }}>{pokemon ? `#${pokemon.dexNumber}` : "—"}</span>
                          <span>
                            {pokemon ? (
                              <Link href={`/pokemon/${pokemon.slug}?returnTo=${encodeURIComponent(`/?tab=locations`)}`}>
                                {getPokemonDisplayName(pokemon)}
                              </Link>
                            ) : (
                              encounter.rawSpecies ?? encounter.pokemonId
                            )}
                          </span>
                        </div>
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "center", borderBottom: "1px solid var(--border-soft)" }}>
                        <TypeBadgeList types={pokemon?.types ?? []} />
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                        <EncounterMethodBadge method={encounter.method} />
                      </td>
                      <td style={{ padding: "10px 12px", textAlign: "right", borderBottom: "1px solid var(--border-soft)" }}>
                        {encounter.rate}%
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                        {encounter.minLevel === encounter.maxLevel
                          ? `Lv. ${encounter.minLevel}`
                          : `Lv. ${encounter.minLevel}-${encounter.maxLevel}`}
                      </td>
                      <td style={{ padding: "10px 12px", borderBottom: "1px solid var(--border-soft)" }}>
                        {heldItems.length > 0 ? (
                          <div style={{ display: "grid", gap: "4px" }}>
                            {heldItems.map((item) => (
                              <span key={`${encounter.id}-${item.itemName}`}>
                                {item.itemSlug ? (
                                  <Link href={`/items/${item.itemSlug}`}>
                                    {item.itemName} ({item.chanceLabel})
                                  </Link>
                                ) : (
                                  `${item.itemName} (${item.chanceLabel})`
                                )}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ color: "var(--text-muted)" }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section style={{ marginTop: "28px" }}>
        <h2>Found / Overworld Items</h2>
        {itemSections.length === 0 ? (
          <p>No found items listed.</p>
        ) : (
          <div style={{ display: "grid", gap: "20px" }}>
            {itemSections.map((section) => (
              <section key={section.key}>
                <h3 style={{ marginBottom: "10px" }}>{section.title}</h3>
                <div style={{ display: "grid", gap: "10px" }}>
                  {section.items.map((item) => (
                    <Link
                      key={item.itemLocationId}
                      href={`/items/${item.item.slug}`}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "48px minmax(0, 1fr)",
                        gap: "12px",
                        alignItems: "center",
                        padding: "12px 14px",
                        border: "1px solid var(--border-soft)",
                        borderRadius: "14px",
                        background: "var(--surface-card)",
                        textDecoration: "none",
                      }}
                    >
                      <ItemImage item={item.item} size={34} framed />
                      <span>
                        <strong style={{ color: "var(--text-body)", display: "block" }}>{getItemDisplayName(item.item)}</strong>
                        {item.notes ? (
                          <span style={{ color: "var(--text-muted)", display: "block", marginTop: "4px" }}>
                            {formatLocationItemNote(item.notes)}
                          </span>
                        ) : null}
                      </span>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
