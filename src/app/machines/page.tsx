import Link from "next/link";
import PageNavigation from "../../components/page-navigation";
import { getMachineBrowseEntries } from "../../lib/data/compatibility";
import { getMachineItemByCode } from "../../lib/data/items";

function getMachineTypeIconSrc(type: string | null | undefined): string | null {
  if (!type) {
    return null;
  }

  return `/sprites/tm-types/${type.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`;
}

export default function MachinesPage() {
  const machines = getMachineBrowseEntries();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>TMs &amp; HMs</h1>
      <p style={{ color: "var(--text-muted)" }}>
        Browse TM and HM records by machine code, taught move, location, and compatibility.
      </p>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {machines.map(({ machine, move, compatibilityCount, location }) => {
          const machineItem = getMachineItemByCode(machine.code);
          const machineTypeIconSrc = getMachineTypeIconSrc(move?.type);
          const imageAlt = move?.type ?? machine.code;
          return (
            <Link
              key={machine.id}
              href={`/machines/${machine.slug}`}
              style={{
                display: "grid",
                gridTemplateColumns: "52px 1fr",
                alignItems: "center",
                gap: "14px",
                padding: "16px",
                border: "1px solid var(--border-soft)",
                borderRadius: "12px",
                background: "var(--surface-card)",
              }}
            >
              {machineTypeIconSrc ? (
                <div
                  style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "12px",
                    border: "1px solid var(--border-soft)",
                    background: "var(--surface-card)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <img
                    src={machineTypeIconSrc}
                    alt={imageAlt}
                    width={32}
                    height={32}
                    style={{ width: "32px", height: "32px", objectFit: "contain" }}
                  />
                </div>
              ) : (
                <div style={{ width: "40px", height: "40px" }} />
              )}
              <div>
                <strong>
                  {machine.code} {move ? move.name : machineItem ? machineItem.name : machine.code}
                </strong>
                <div style={{ color: "var(--text-muted)", marginTop: "6px" }}>
                  {[machine.kind.toUpperCase(), location?.name ?? machine.location, compatibilityCount > 0 ? `${compatibilityCount} compatible Pokemon` : null]
                    .filter(Boolean)
                    .join(" • ")}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
