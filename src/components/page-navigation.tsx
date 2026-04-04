"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type PageNavigationProps = {
  backHref?: string;
  backLabel?: string;
  homeHref?: string;
  homeLabel?: string;
};

const pillStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "38px",
  padding: "0 14px",
  borderRadius: "999px",
  border: "1px solid var(--border-soft)",
  background: "var(--surface-card)",
  color: "var(--text-body)",
  fontWeight: 600,
  textDecoration: "none",
  cursor: "pointer",
} as const;

export default function PageNavigation({
  backHref,
  backLabel = "Back",
  homeHref = "/",
  homeLabel = "Home",
}: PageNavigationProps) {
  const router = useRouter();

  return (
    <nav
      aria-label="Page navigation"
      style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}
    >
      {backHref ? (
        <Link href={backHref} style={pillStyle}>
          {backLabel}
        </Link>
      ) : (
        <button type="button" onClick={() => router.back()} style={pillStyle}>
          {backLabel}
        </button>
      )}
      <Link href={homeHref} style={pillStyle}>
        {homeLabel}
      </Link>
    </nav>
  );
}
