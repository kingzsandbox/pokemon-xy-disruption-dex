import Link from "next/link";
import SearchAutocomplete from "../search-autocomplete";
import PageNavigation from "../../components/page-navigation";
import { getSearchIndex, getSearchResultHref, searchDex } from "../../lib/search";

type SearchPageProps = {
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q ?? "";
  const searchIndex = getSearchIndex();
  const normalizedQuery = query.trim().toLowerCase();
  const results = !normalizedQuery
    ? []
    : searchIndex
        .filter((entry) => {
          const haystack = `${entry.title} ${entry.subtitle}`.toLowerCase();
          return haystack.includes(normalizedQuery);
        })
        .sort((left, right) => {
          const leftStarts = left.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
          const rightStarts = right.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;

          if (leftStarts !== rightStarts) {
            return leftStarts - rightStarts;
          }

          return left.title.localeCompare(right.title);
        });

  return (
    <main style={{ margin: "0 auto", maxWidth: "900px", padding: "40px 24px 64px" }}>
      <PageNavigation />
      <header style={{ marginBottom: "24px" }}>
        <h1 style={{ margin: "0 0 12px" }}>Search</h1>
        <SearchAutocomplete
          index={searchIndex}
          action="/search"
          initialQuery={query}
          placeholder="Search Pokemon, abilities, items, moves, TMs & HMs, battles, locations, level caps..."
        />
      </header>

      <p style={{ color: "#586379" }}>
        {query ? `${results.length} result(s) for "${query}"` : "Enter a query to search the dex."}
      </p>

      <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
        {results.map((result) => (
          <Link
            key={`${result.type}-${result.id}`}
            href={getSearchResultHref(result)}
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
