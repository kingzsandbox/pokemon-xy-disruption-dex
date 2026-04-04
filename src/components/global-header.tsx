"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import SearchAutocomplete from "../app/search-autocomplete";
import type { SearchResult } from "../lib/types";

const navItems = [
  { href: "/", label: "Pokedex", match: (pathname: string) => pathname === "/" },
  {
    href: "/?tab=locations",
    label: "Locations",
    match: (pathname: string) => pathname === "/locations" || pathname.startsWith("/locations/"),
  },
  { href: "/?tab=items", label: "Items", match: (pathname: string) => pathname === "/items" || pathname.startsWith("/items/") },
  { href: "/?tab=moves", label: "Moves", match: (pathname: string) => pathname === "/moves" || pathname.startsWith("/moves/") },
  {
    href: "/?tab=machines",
    label: "TMs & HMs",
    match: (pathname: string) => pathname === "/machines" || pathname.startsWith("/machines/"),
  },
  {
    href: "/?tab=abilities",
    label: "Abilities",
    match: (pathname: string) => pathname === "/abilities" || pathname.startsWith("/abilities/"),
  },
  {
    href: "/move-tutors",
    label: "Move Tutors",
    match: (pathname: string) => pathname === "/move-tutors",
  },
  { href: "/battles", label: "Battles", match: (pathname: string) => pathname === "/battles" },
  { href: "/systems", label: "Level Caps", match: (pathname: string) => pathname === "/systems" },
] as const;

type GlobalHeaderProps = {
  searchIndex: SearchResult[];
};

function navLinkStyle(active: boolean) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "38px",
    padding: "0 14px",
    borderRadius: "999px",
    border: active ? "1px solid var(--accent-border)" : "1px solid var(--border-soft)",
    background: active ? "var(--accent)" : "var(--surface-elevated)",
    color: active ? "var(--button-text)" : "var(--text-body)",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: active ? "0 10px 24px rgba(214,74,74,0.18)" : "var(--shadow-soft)",
  } as const;
}

export default function GlobalHeader({ searchIndex }: GlobalHeaderProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeRootTab = searchParams.get("tab");

  function isActive(item: (typeof navItems)[number]) {
    if (pathname === "/") {
      if (item.label === "Pokedex") {
        return !activeRootTab || activeRootTab === "pokedex";
      }
      if (item.href.startsWith("/?tab=")) {
        return activeRootTab === item.href.replace("/?tab=", "");
      }
    }

    return item.match(pathname);
  }

  return (
    <header
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        backdropFilter: "blur(14px)",
        background: "var(--surface-elevated)",
        borderBottom: "1px solid var(--border-header)",
      }}
    >
      <div style={{ margin: "0 auto", maxWidth: "1400px", padding: "16px 18px 18px" }}>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "14px",
            marginBottom: "14px",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <span style={{ display: "block", fontSize: "1.15rem", fontWeight: 800, color: "var(--text-strong)" }}>
              Pokémon X/Y Disruption Dex
            </span>
          </Link>

          <nav aria-label="Global" style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            {navItems.map((item) => {
              const active = isActive(item);
              return (
                <Link key={item.label} href={item.href} aria-current={active ? "page" : undefined} style={navLinkStyle(active)}>
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <SearchAutocomplete
          index={searchIndex}
          action="/search"
          placeholder="Search Pokémon, locations, items, moves, TMs & HMs, move tutors, abilities, trainers, battles, and level caps..."
        />
      </div>
    </header>
  );
}
