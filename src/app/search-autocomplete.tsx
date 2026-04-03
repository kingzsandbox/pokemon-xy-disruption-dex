"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
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

const GROUP_ORDER = ["pokemon", "moves", "items", "locations", "machines", "abilities"] as const;

const GROUP_LABELS: Record<(typeof GROUP_ORDER)[number], string> = {
  pokemon: "Pokemon",
  moves: "Moves",
  items: "Items",
  locations: "Locations",
  machines: "TMs & HMs",
  abilities: "Abilities",
};

const GROUP_BADGE_LABELS: Record<(typeof GROUP_ORDER)[number], string> = {
  pokemon: "Pokemon",
  moves: "Move",
  items: "Item",
  locations: "Location",
  machines: "TM/HM",
  abilities: "Ability",
};

const RESULT_TYPE_TO_GROUP: Partial<Record<SearchResult["type"], (typeof GROUP_ORDER)[number]>> = {
  pokemon: "pokemon",
  move: "moves",
  item: "items",
  location: "locations",
  machine: "machines",
  ability: "abilities",
};

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
  const [debouncedQuery, setDebouncedQuery] = useState(initialQuery);
  const [isFocused, setIsFocused] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const normalizedQuery = normalizeQuery(debouncedQuery);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedQuery(query);
    }, 150);

    return () => {
      clearTimeout(timeout);
    };
  }, [query]);

  useEffect(() => {
    return () => {
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current);
      }
    };
  }, []);

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

  const groupedSuggestions = useMemo(() => {
    const groups = GROUP_ORDER.map((group) => ({
      key: group,
      label: GROUP_LABELS[group],
      results: suggestions.filter((entry) => RESULT_TYPE_TO_GROUP[entry.type] === group),
    })).filter((group) => group.results.length > 0);

    return groups;
  }, [suggestions]);

  const flattenedSuggestions = groupedSuggestions.flatMap((group) => group.results);
  const showSuggestions = isFocused && flattenedSuggestions.length > 0;

  return (
    <form
      action={action}
      onSubmit={(event) => {
        if (showSuggestions && flattenedSuggestions[activeIndex]) {
          event.preventDefault();
          const href = getSearchResultHref(flattenedSuggestions[activeIndex]);
          setIsFocused(false);
          router.push(href);
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
          onFocus={() => {
            if (blurTimeoutRef.current) {
              clearTimeout(blurTimeoutRef.current);
            }
            setIsFocused(true);
          }}
          onBlur={() => {
            blurTimeoutRef.current = setTimeout(() => {
              setIsFocused(false);
            }, 120);
          }}
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
              setActiveIndex((current) => (current + 1) % flattenedSuggestions.length);
            }

            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) => (current - 1 + flattenedSuggestions.length) % flattenedSuggestions.length);
            }

            if (event.key === "Escape") {
              setIsFocused(false);
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
            {groupedSuggestions.map((group) => (
              <div key={group.key}>
                <div
                  style={{
                    padding: "10px 14px 6px",
                    background: "#f8fafd",
                    borderTop: group.key === groupedSuggestions[0]?.key ? "none" : "1px solid #eef2f8",
                    color: "#5d6a7f",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    letterSpacing: "0.04em",
                    textTransform: "uppercase",
                  }}
                >
                  {group.label}
                </div>
                {group.results.map((result) => {
                  const indexValue = flattenedSuggestions.findIndex(
                    (entry) => entry.id === result.id && entry.type === result.type,
                  );
                  return (
                    <Link
                      key={`${result.type}-${result.id}`}
                      href={getSearchResultHref(result)}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        setIsFocused(false);
                        router.push(getSearchResultHref(result));
                      }}
                      onMouseEnter={() => setActiveIndex(indexValue)}
                      style={{
                        display: "grid",
                        gap: "4px",
                        padding: "12px 14px",
                        textDecoration: "none",
                        background: indexValue === activeIndex ? "#f7f9fd" : "#ffffff",
                        borderTop: "1px solid #eef2f8",
                      }}
                    >
                      <span style={{ display: "flex", justifyContent: "space-between", gap: "10px" }}>
                        <strong style={{ color: "#273246" }}>{result.title}</strong>
                        <span style={badgeStyle()}>{GROUP_BADGE_LABELS[group.key]}</span>
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
                  );
                })}
              </div>
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
