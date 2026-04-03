import { notFound } from "next/navigation";
import Link from "next/link";
import { TypeBadgeList } from "@/components/dex-visuals";
import PageNavigation from "@/components/page-navigation";
import ReferenceImage from "@/components/reference-image";
import { getPokemonMiniSpriteSources } from "@/lib/assets";
import { getAbilityBySlug, getAbilities } from "@/lib/data/abilities";
import { getAllPokemon } from "@/lib/data/pokemon";
import { getPokemonDisplayName } from "@/lib/presentation";

type AbilityDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return getAbilities().map((ability) => ({ slug: ability.slug }));
}

export default async function AbilityDetailPage({ params }: AbilityDetailPageProps) {
  const { slug } = await params;
  const ability = getAbilityBySlug(slug);

  if (!ability) {
    notFound();
  }

  const pokemon = getAllPokemon().filter((entry) => entry.abilities.includes(ability.name));

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/abilities" backLabel="Back to Abilities" />
      <h1 style={{ marginTop: 0 }}>{ability.name}</h1>
      <p style={{ color: "#586379" }}>{ability.description}</p>

      <section style={{ marginTop: "24px" }}>
        <h2>Pokémon with this Ability</h2>
        <div style={{ display: "grid", gap: "8px" }}>
          {pokemon.map((entry) => {
            const sprite = getPokemonMiniSpriteSources(entry);
            return (
              <Link
                key={entry.id}
                href={`/pokemon/${entry.slug}?returnTo=${encodeURIComponent(`/?tab=abilities`)}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "52px 1fr",
                  alignItems: "start",
                  gap: "12px",
                  padding: "10px 12px",
                  borderBottom: "1px solid #e6ebf3",
                }}
              >
                <ReferenceImage
                  src={sprite.src}
                  fallbackSrc={sprite.fallbackSrc}
                  alt={entry.name}
                  width={44}
                  height={44}
                  style={{ imageRendering: "pixelated" }}
                />
                <span style={{ display: "grid", gap: "6px", alignContent: "start" }}>
                  <span style={{ color: "#273246", fontWeight: 600 }}>{getPokemonDisplayName(entry)}</span>
                  <TypeBadgeList types={entry.types} />
                </span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}
