"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const navItems = [
  { href: "/", label: "Pokedex", match: (pathname: string) => pathname === "/" },
  { href: "/?tab=locations", label: "Locations", match: (pathname: string) => pathname === "/locations" || pathname.startsWith("/locations/") },
  { href: "/?tab=items", label: "Items", match: (pathname: string) => pathname === "/items" || pathname.startsWith("/items/") },
  { href: "/?tab=moves", label: "Moves", match: (pathname: string) => pathname === "/moves" || pathname.startsWith("/moves/") },
  { href: "/?tab=machines", label: "TMs & HMs", match: (pathname: string) => pathname === "/machines" || pathname.startsWith("/machines/") },
  { href: "/?tab=abilities", label: "Abilities", match: (pathname: string) => pathname === "/abilities" || pathname.startsWith("/abilities/") },
  { href: "/battles", label: "Battles", match: (pathname: string) => pathname === "/battles" },
  { href: "/systems", label: "Level Caps", match: (pathname: string) => pathname === "/systems" },
] as const;

function navLinkStyle(active: boolean) {
  return {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "38px",
    padding: "0 14px",
    borderRadius: "999px",
    border: active ? "1px solid #cc4141" : "1px solid #d7deea",
    background: active ? "#d64a4a" : "rgba(255,255,255,0.92)",
    color: active ? "#ffffff" : "#273246",
    fontWeight: 700,
    textDecoration: "none",
    boxShadow: active ? "0 10px 24px rgba(214,74,74,0.18)" : "0 6px 16px rgba(39, 50, 70, 0.06)",
  } as const;
}

export default function GlobalHeader() {
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
        background: "rgba(246, 248, 252, 0.9)",
        borderBottom: "1px solid rgba(212, 220, 233, 0.9)",
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
            <span style={{ display: "block", fontSize: "1.15rem", fontWeight: 800, color: "#1f2a3d" }}>
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

        <form action="/search" method="get" style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <input
            name="q"
            type="search"
            placeholder="Search Pokémon, locations, items, moves, TMs & HMs, abilities, trainers, battles, and level caps..."
            style={{
              width: "100%",
              minWidth: 0,
              padding: "11px 14px",
              border: "1px solid #d8deea",
              borderRadius: "12px",
              background: "#ffffff",
              flex: 1,
            }}
          />
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
            Search
          </button>
        </form>
      </div>
    </header>
  );
}
