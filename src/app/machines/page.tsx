import Link from "next/link";
import PageNavigation from "../../components/page-navigation";
import { getMachineBrowseEntries } from "../../lib/data/compatibility";

export default function MachinesPage() {
  const machines = getMachineBrowseEntries();

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <h1 style={{ marginTop: 0 }}>TMs &amp; HMs</h1>
      <p style={{ color: "#586379" }}>
        Browse TM and HM records by machine code, taught move, location, and compatibility.
      </p>

      <div style={{ display: "grid", gap: "12px", marginTop: "24px" }}>
        {machines.map(({ machine, move, compatibilityCount, location }) => (
          <Link
            key={machine.id}
            href={`/machines/${machine.slug}`}
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong>
              {machine.code} {move ? `- ${move.name}` : ""}
            </strong>
            <div style={{ color: "#586379", marginTop: "6px" }}>
              {[machine.kind.toUpperCase(), location?.name ?? machine.location, compatibilityCount > 0 ? `${compatibilityCount} compatible Pokemon` : null]
                .filter(Boolean)
                .join(" • ")}
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
