import Link from "next/link";
import { notFound } from "next/navigation";
import { MoveCategoryIcon, TypeBadgeList } from "../../../components/dex-visuals";
import PageNavigation from "../../../components/page-navigation";
import ReferenceImage from "../../../components/reference-image";
import { getPokemonMiniSpriteSources } from "../../../lib/assets";
import {
  getCompatiblePokemonByMachineId,
  getMachineBrowseEntries,
  getMachineBySlug,
  getMachineLocationEntry,
  isBrowsableMachine,
} from "../../../lib/data/compatibility";
import { getMoveById } from "../../../lib/data/moves";
import { getPokemonDisplayName } from "../../../lib/presentation";
import { getMoveEffectSummary } from "../../../lib/data/vanilla";

export const dynamicParams = false;

type MachineDetailPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  return getMachineBrowseEntries().map(({ machine }) => ({ slug: machine.slug }));
}

export default async function MachineDetailPage({ params }: MachineDetailPageProps) {
  const { slug } = await params;
  const machine = getMachineBySlug(slug);

  if (!machine || !isBrowsableMachine(machine)) {
    notFound();
  }

  const move = machine.moveId ? getMoveById(machine.moveId) : undefined;
  const location = getMachineLocationEntry(machine);
  const compatiblePokemon = getCompatiblePokemonByMachineId(machine.id);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation backHref="/machines" backLabel="Back to TMs & HMs" />
      <h1 style={{ marginTop: 0 }}>{machine.code}</h1>
      <p style={{ color: "#586379", textTransform: "uppercase" }}>{machine.kind}</p>

      <section style={{ marginTop: "24px" }}>
        <h2>Move Taught</h2>
        {move ? (
          <div style={{ display: "grid", gap: "10px" }}>
            <p>
              <Link href={`/moves/${move.slug}`}>{move.name}</Link>
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", alignItems: "center" }}>
              {move.type ? <TypeBadgeList types={[move.type]} /> : null}
              <span style={{ display: "inline-flex", alignItems: "center", gap: "8px" }}>
                <MoveCategoryIcon category={move.category} />
                <span>{move.category ?? "—"}</span>
              </span>
              <span>Power {move.power ?? "—"}</span>
              <span>Accuracy {move.accuracy ?? "—"}</span>
              <span>PP {move.pp ?? "—"}</span>
            </div>
            <p style={{ lineHeight: 1.6, margin: 0 }}>{getMoveEffectSummary(move.id) ?? "No effect summary listed."}</p>
          </div>
        ) : (
          <p>No move listed.</p>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Location</h2>
        {location ? (
          <p>
            <Link href={`/locations/${location.slug}`}>{location.name}</Link>
          </p>
        ) : machine.location ? (
          <p>{machine.location}</p>
        ) : (
          <p>No location listed.</p>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Compatibility</h2>
        {compatiblePokemon.length === 0 ? (
          <p>No compatible Pokémon listed.</p>
        ) : (
          <div style={{ display: "grid", gap: "10px" }}>
            {compatiblePokemon.slice(0, 40).map((pokemon) => {
              const sprite = getPokemonMiniSpriteSources(pokemon);
              return (
                <Link
                  key={pokemon.id}
                  href={`/pokemon/${pokemon.slug}?returnTo=${encodeURIComponent(`/machines/${machine.slug}`)}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "52px 72px 1fr auto",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 12px",
                    borderBottom: "1px solid #e6ebf3",
                  }}
                >
                  <ReferenceImage
                    src={sprite.src}
                    fallbackSrc={sprite.fallbackSrc}
                    alt={pokemon.name}
                    width={44}
                    height={44}
                    style={{ imageRendering: "pixelated" }}
                  />
                  <span style={{ color: "#667389" }}>#{pokemon.dexNumber}</span>
                  <span style={{ color: "#273246", fontWeight: 600 }}>{getPokemonDisplayName(pokemon)}</span>
                  <TypeBadgeList types={pokemon.types} />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
