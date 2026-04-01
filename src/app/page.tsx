import Link from "next/link";

const quickLinks = [
  {
    label: "Pokémon",
    href: "/pokemon",
    description: "Browse the current sample Pokédex entries and open detail pages.",
  },
  {
    label: "Locations",
    href: "/locations",
    description: "See sample routes, encounter tables, and pickup locations.",
  },
  {
    label: "Items",
    href: "/items",
    description: "Open the starter item index with simple detail pages.",
  },
  {
    label: "Search",
    href: "/search",
    description: "Search across Pokémon, locations, and items by name.",
  },
];

export default function HomePage() {
  return (
    <main
      style={{
        margin: "0 auto",
        maxWidth: "960px",
        padding: "48px 24px 72px",
      }}
    >
      <section style={{ marginBottom: "32px" }}>
        <p
          style={{
            margin: "0 0 12px",
            color: "#6a7487",
            fontSize: "0.95rem",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
          }}
        >
          Static reference app
        </p>
        <h1 style={{ margin: "0 0 12px", fontSize: "clamp(2.2rem, 5vw, 3.8rem)" }}>
          Pokémon X/Y Disruption Dex
        </h1>
        <p
          style={{
            margin: 0,
            maxWidth: "700px",
            color: "#445067",
            fontSize: "1.05rem",
            lineHeight: 1.6,
          }}
        >
          A lightweight Next.js reference for browsing Pokémon, encounter data,
          locations, items, and disruption-related rules from Pokémon X and Y.
        </p>
      </section>

      <section
        aria-label="Search"
        style={{
          marginBottom: "40px",
          padding: "20px",
          border: "1px solid #d7dcea",
          borderRadius: "16px",
          background: "#ffffff",
          boxShadow: "0 10px 30px rgba(23, 32, 51, 0.06)",
        }}
      >
        <label
          htmlFor="search"
          style={{ display: "block", marginBottom: "12px", fontWeight: 600 }}
        >
          Search the dex
        </label>
        <form action="/search" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            id="search"
            name="q"
            type="search"
            placeholder="Search Pokemon, locations, items..."
            style={{
              flex: "1 1 320px",
              padding: "14px 16px",
              border: "1px solid #c8d0e0",
              borderRadius: "12px",
              background: "#fbfcff",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "14px 20px",
              border: 0,
              borderRadius: "12px",
              background: "#d64a4a",
              color: "#ffffff",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            Search
          </button>
        </form>
      </section>

      <section>
        <h2 style={{ margin: "0 0 16px", fontSize: "1.4rem" }}>Quick links</h2>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "16px",
          }}
        >
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "block",
                padding: "18px",
                border: "1px solid #d7dcea",
                borderRadius: "16px",
                background: "#ffffff",
                boxShadow: "0 8px 24px rgba(23, 32, 51, 0.05)",
              }}
            >
              <h3 style={{ margin: "0 0 8px", fontSize: "1.05rem" }}>{link.label}</h3>
              <p style={{ margin: 0, color: "#586379", lineHeight: 1.5 }}>
                {link.description}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
