import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCompatiblePokemonByMachineId,
  getMachineBrowseEntries,
  getMachineBySlug,
  getMachineLocationEntry,
} from "@/lib/data/compatibility";
import { getMoveById } from "@/lib/data/moves";

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

  if (!machine) {
    notFound();
  }

  const move = machine.moveId ? getMoveById(machine.moveId) : undefined;
  const location = getMachineLocationEntry(machine);
  const compatiblePokemon = getCompatiblePokemonByMachineId(machine.id);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <h1 style={{ marginTop: 0 }}>{machine.code}</h1>
      <p style={{ color: "#586379", textTransform: "uppercase" }}>{machine.kind}</p>

      <section style={{ marginTop: "24px" }}>
        <h2>Move Taught</h2>
        {move ? (
          <p>
            <Link href={`/moves/${move.slug}`}>{move.name}</Link>
          </p>
        ) : (
          <p>No linked move record is currently available for this machine.</p>
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
          <p>No machine location has been imported for this record.</p>
        )}
      </section>

      <section style={{ marginTop: "24px" }}>
        <h2>Compatibility</h2>
        {compatiblePokemon.length === 0 ? (
          <p>No compatibility records are currently linked to this machine.</p>
        ) : (
          <>
            <p style={{ color: "#586379" }}>
              {compatiblePokemon.length} compatible Pokemon currently reference this machine.
            </p>
            <ul>
              {compatiblePokemon.slice(0, 40).map((pokemon) => (
                <li key={pokemon.id}>
                  <Link href={`/pokemon/${pokemon.slug}`}>{pokemon.name}</Link>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </main>
  );
}
