"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getSearchResultHref, normalizeQuery } from "../lib/search";
import type { SearchResult } from "../lib/types";

type SearchAutocompleteProps = {
  index: SearchResult[];
  action?: string;
  initialQuery?: string;
  placeholder: string;
  submitLabel?: string;
};

function wrapperStyle() {
  return {
    position: "relative",
    flex: 1,
    minWidth: 0,
  } as const;
}

function inputStyle() {
  return {
    width: "100%",
    padding: "11px 14px",
    border: "1px solid #d8deea",
    borderRadius: "12px",
    background: "#ffffff",
  } as const;
}

function badgeStyle() {
  return {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: "999px",
    background: "#f1f4fa",
    color: "#546176",
    fontSize: "0.78rem",
    textTransform: "capitalize",
  } as const;
}

export default function SearchAutocomplete({
  index,
  action = "/search",
  initialQuery = "",
  placeholder,
  submitLabel = "Search",
}: SearchAutocompleteProps) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [activeIndex, setActiveIndex] = useState(0);
  const normalizedQuery = normalizeQuery(query);

  const suggestions = useMemo(() => {
    if (!normalizedQuery) {
      return [];
    }

    const matches = index.filter((entry) => {
      const haystack = `${entry.title} ${entry.subtitle}`.toLowerCase();
      return haystack.includes(normalizedQuery);
    });

    return matches
      .sort((left, right) => {
        const leftStarts = left.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;
        const rightStarts = right.title.toLowerCase().startsWith(normalizedQuery) ? 0 : 1;

        if (leftStarts !== rightStarts) {
          return leftStarts - rightStarts;
        }

        return left.title.localeCompare(right.title);
      })
      .slice(0, 8);
  }, [index, normalizedQuery]);

  const showSuggestions = suggestions.length > 0;

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (showSuggestions && suggestions[activeIndex]) {
          event.preventDefault();
          router.push(getSearchResultHref(suggestions[activeIndex]));
        }
      }}
      style={{ display: "flex", gap: "10px", marginBottom: "16px" }}
    >
      <div style={wrapperStyle()}>
        <input
          name="q"
          type="search"
          value={query}
          autoComplete="off"
          placeholder={placeholder}
          onChange={(event) => {
            setQuery(event.target.value);
            setActiveIndex(0);
          }}
          onKeyDown={(event) => {
            if (!showSuggestions) {
              return;
            }

            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) => (current + 1) % suggestions.length);
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => (current - 1 + suggestions.length) % suggestions.length);
            }

            if (event.key === "Escape") {
              setQuery("");
              setActiveIndex(0);
            }
          }}
          style={inputStyle()}
        />

        {showSuggestions ? (
          <div
            style={{
              position: "absolute",
              zIndex: 20,
              top: "calc(100% + 8px)",
              left: 0,
              right: 0,
              background: "#ffffff",
              border: "1px solid #d8deea",
              borderRadius: "14px",
              boxShadow: "0 14px 30px rgba(39, 50, 70, 0.12)",
              overflow: "hidden",
            }}
          >
            {suggestions.map((result, indexValue) => (
              <Link
                key={`${result.type}-${result.id}`}
                href={getSearchResultHref(result)}
                onMouseEnter={() => setActiveIndex(indexValue)}
                style={{
                  display: "grid",
                  gap: "4px",
                  padding: "12px 14px",
                  textDecoration: "none",
                  background: indexValue === activeIndex ? "#f7f9fd" : "#ffffff",
                  borderTop: indexValue === 0 ? "none" : "1px solid #eef2f8",
                }}
              >
                <span style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                  <strong style={{ color: "#273246" }}>{result.title}</strong>
                  <span style={badgeStyle()}>{result.type}</span>
                </span>
                <span
                  style={{
                    color: "#667389",
                    fontSize: "0.92rem",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {result.subtitle}
                </span>
              </Link>
            ))}
          </div>
        ) : null}
      </div>

      <button
        type="submit"
        style={{
          padding: "11px 16px",
          border: "1px solid #cc4141",
          borderRadius: "12px",
          background: "#d64a4a",
          color: "#ffffff",
          fontWeight: 700,
          cursor: "pointer",
        }}
      >
        {submitLabel}
      </button>
    </form>
  );
}
