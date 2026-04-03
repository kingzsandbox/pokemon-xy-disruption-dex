import type { Metadata } from "next";
import { Suspense } from "react";
import GlobalHeader from "../components/global-header";
import ScrollToTopButton from "../components/scroll-to-top-button";
import { getSearchIndex } from "../lib/search";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pokémon X/Y Disruption Dex",
  description: "A static reference for Pokémon, locations, items, and disruption data in Pokémon X and Y.",
};

type RootLayoutProps = Readonly<{
  children: React.ReactNode;
}>;

function HeaderFallback() {
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
          <a href="/" style={{ textDecoration: "none", fontSize: "1.15rem", fontWeight: 800, color: "#1f2a3d" }}>
            Pokémon X/Y Disruption Dex
          </a>
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

export default function RootLayout({ children }: RootLayoutProps) {
  const searchIndex = getSearchIndex();

  return (
    <html lang="en">
      <body>
        <Suspense fallback={<HeaderFallback />}>
          <GlobalHeader searchIndex={searchIndex} />
        </Suspense>
        {children}
        <ScrollToTopButton />
      </body>
    </html>
  );
}
