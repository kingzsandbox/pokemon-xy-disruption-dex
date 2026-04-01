import Link from "next/link";
import { searchDex } from "@/lib/search";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q ?? "";
  const results = searchDex(query);

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 12px" }}>Search</h1>
        <form action="/search" style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <input
            name="q"
            defaultValue={query}
            placeholder="Search Pokémon, locations, items..."
            style={{
              flex: "1 1 320px",
              padding: "12px 14px",
              borderRadius: "10px",
              border: "1px solid #c8d0e0",
              background: "#ffffff",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "12px 18px",
              border: 0,
              borderRadius: "10px",
              background: "#d64a4a",
              color: "#ffffff",
              fontWeight: 700,
            }}
          >
            Search
          </button>
        </form>
      </header>

      <p style={{ color: "#586379" }}>
        {query ? `${results.length} result(s) for "${query}"` : "Enter a query to search the dex."}
      </p>

      <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
        {results.map((result) => (
          <Link
            key={`${result.type}-${result.id}`}
            href={`/${result.type === "location" ? "locations" : `${result.type}s`}/${result.slug}`}
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid #d7dcea",
              borderRadius: "12px",
              background: "#ffffff",
            }}
          >
            <strong style={{ display: "block", marginBottom: "4px" }}>{result.title}</strong>
            <span style={{ display: "block", color: "#445067", marginBottom: "4px" }}>
              {result.subtitle}
            </span>
            <span style={{ color: "#6a7487", fontSize: "0.95rem", textTransform: "capitalize" }}>
              {result.type}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
