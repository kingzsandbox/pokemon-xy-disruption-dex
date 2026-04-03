import type { CSSProperties } from "react";

function assetSlug(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

function typeIconSrc(type: string): string {
  return `/sprites/types-gen6/${assetSlug(type)}.png`;
}

function categoryIconSrc(category: string): string {
  return `/sprites/move-category-gen6/${assetSlug(category)}.png`;
}

export function TypeBadge({ type }: { type: string }) {
  return (
    <img
      src={typeIconSrc(type)}
      alt={type}
      width={48}
      height={20}
      style={{
        display: "block",
        width: "auto",
        height: "20px",
        maxWidth: "48px",
        objectFit: "contain",
        background: "transparent",
      }}
    />
  );
}

export function TypeBadgeList({ types }: { types: string[] }) {
  const uniqueTypes = [...new Set(types.filter(Boolean))];

  return (
    <span style={{ display: "inline-flex", flexWrap: "wrap", gap: "6px" }}>
      {uniqueTypes.map((type) => (
        <TypeBadge key={type} type={type} />
      ))}
    </span>
  );
}

export function MoveCategoryIcon({ category }: { category: string | null }) {
  if (!category) {
    return <span style={{ color: "#7c889d" }}>—</span>;
  }

  return (
    <img
      title={category}
      aria-label={category}
      src={categoryIconSrc(category)}
      alt={category}
      width={40}
      height={16}
      style={{
        display: "block",
        width: "auto",
        height: "16px",
        objectFit: "contain",
        background: "transparent",
      }}
    />
  );
}

export function getStatBarColor(value: number): string {
  if (value < 50) return "#c86b55";
  if (value < 70) return "#e39a45";
  if (value < 90) return "#dfc85b";
  if (value < 110) return "#89c463";
  return "#57b9a5";
}

export function StatBar({
  value,
  max = 180,
}: {
  value: number;
  max?: number;
}) {
  const width = Math.min((value / max) * 100, 100);
  return (
    <span
      style={{
        display: "inline-flex",
        width: "140px",
        height: "10px",
        borderRadius: "4px",
        background: "#ebeff6",
        overflow: "hidden",
        verticalAlign: "middle",
        boxShadow: "inset 0 0 0 1px rgba(39, 50, 70, 0.06)",
      }}
    >
      <span
        style={{
          width: `${width}%`,
          background: getStatBarColor(value),
        }}
      />
    </span>
  );
}

type EncounterVisualKind =
  | "wild"
  | "rough-terrain"
  | "flowers"
  | "surf"
  | "fishing"
  | "rock-smash"
  | "horde"
  | "ambush"
  | "generic";

type EncounterVisualMeta = {
  label: string;
  kind: EncounterVisualKind;
};

function getEncounterVisualMeta(method: string): EncounterVisualMeta {
  const normalized = method.trim().toLowerCase();

  if (normalized === "grass/cave") {
    return { label: "Grass/Cave", kind: "wild" };
  }
  if (normalized === "rough terrain") {
    return { label: "Rough Terrain", kind: "rough-terrain" };
  }
  if (normalized === "yellow flowers") {
    return { label: "Yellow Flowers", kind: "flowers" };
  }
  if (normalized === "red flowers") {
    return { label: "Red Flowers", kind: "flowers" };
  }
  if (normalized === "purple flowers") {
    return { label: "Purple Flowers", kind: "flowers" };
  }
  if (normalized === "old rod") {
    return { label: "Old Rod", kind: "fishing" };
  }
  if (normalized === "good rod") {
    return { label: "Good Rod", kind: "fishing" };
  }
  if (normalized === "super rod") {
    return { label: "Super Rod", kind: "fishing" };
  }
  if (normalized === "surf") {
    return { label: "Surf", kind: "surf" };
  }
  if (normalized === "rock smash") {
    return { label: "Rock Smash", kind: "rock-smash" };
  }
  if (normalized === "horde") {
    return { label: "Horde", kind: "horde" };
  }
  if (normalized === "ambush") {
    return { label: "Ambush", kind: "ambush" };
  }

  return { label: method.trim() || "Unknown", kind: "generic" };
}

function EncounterMethodIcon({ kind }: { kind: EncounterVisualKind }) {
  const common = {
    width: 16,
    height: 16,
    viewBox: "0 0 16 16",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
  } as const;

  const stroke = "#4d5a70";

  switch (kind) {
    case "fishing":
      return (
        <svg {...common}>
          <path d="M4 2c4 1 5 3 5 5 0 2-1 3-2 4" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M7 11c.4 1.5 1.3 2.5 2.8 2.5 1 0 1.8-.7 1.8-1.6 0-.7-.5-1.3-1.2-1.5" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
          <circle cx="4" cy="2.5" r="1" fill={stroke} />
        </svg>
      );
    case "surf":
      return (
        <svg {...common}>
          <path d="M1.5 10.5c1 0 1-.8 2-.8s1 .8 2 .8 1-.8 2-.8 1 .8 2 .8 1-.8 2-.8 1 .8 2 .8" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M3 7.5c1-1.5 2.2-2.2 3.8-2.2 1.7 0 2.8.7 4.2 2.2" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      );
    case "flowers":
      return (
        <svg {...common}>
          <circle cx="8" cy="5.2" r="1.5" fill={stroke} />
          <circle cx="5.2" cy="6.8" r="1.5" fill={stroke} fillOpacity="0.85" />
          <circle cx="10.8" cy="6.8" r="1.5" fill={stroke} fillOpacity="0.85" />
          <path d="M8 8v5" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" />
          <path d="M8 11c-1.2 0-1.8.4-2.5 1.2M8 11c1.2 0 1.8.4 2.5 1.2" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "rough-terrain":
      return (
        <svg {...common}>
          <path d="M2.5 11.5 5 7.5l2 2.2 2.2-4.2 1.8 2.6 2.5-1.4" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M2.5 13h11" stroke={stroke} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      );
    case "rock-smash":
      return (
        <svg {...common}>
          <path d="M8 1.8 13.5 5v6L8 14.2 2.5 11V5L8 1.8Z" stroke={stroke} strokeWidth="1.2" />
          <path d="M8 4.2 6.4 7l1.3 1.3-1.2 3.5 2-2.4-.9-1.1 1.5-2.1" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "horde":
      return (
        <svg {...common}>
          <circle cx="5" cy="6" r="2" fill={stroke} />
          <circle cx="11" cy="6" r="2" fill={stroke} fillOpacity="0.8" />
          <circle cx="8" cy="10.5" r="2.2" fill={stroke} fillOpacity="0.9" />
        </svg>
      );
    case "ambush":
      return (
        <svg {...common}>
          <path d="M8 2.2 13.2 13H2.8L8 2.2Z" stroke={stroke} strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M8 5.4v3.7" stroke={stroke} strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="8" cy="10.9" r="0.9" fill={stroke} />
        </svg>
      );
    case "generic":
      return (
        <svg {...common}>
          <circle cx="8" cy="8" r="4.2" stroke={stroke} strokeWidth="1.3" />
        </svg>
      );
    case "wild":
    default:
      return (
        <svg {...common}>
          <path d="M3 13 5.5 7.5 7 13 9.6 5.5 11.2 13 13 8.2" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
  }
}

export function EncounterMethodBadge({ method }: { method: string }) {
  const meta = getEncounterVisualMeta(method);

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "4px 8px",
        borderRadius: "999px",
        background: "#f3f6fb",
        color: "#4d5a70",
        fontSize: "0.82rem",
        whiteSpace: "nowrap",
      }}
    >
      <EncounterMethodIcon kind={meta.kind} />
      <span>{meta.label}</span>
    </span>
  );
}

export function matchupSectionStyle(
  multiplier: number,
  mode: "offensive" | "defensive",
): CSSProperties {
  if (multiplier === 0) {
    return { background: "#edf2ff", color: "#31437c" };
  }

  if (mode === "defensive") {
    if (multiplier >= 2) {
      return { background: "#fff1ec", color: "#8b3b24" };
    }
    if (multiplier <= 0.25) {
      return { background: "#e6f7ec", color: "#19533c" };
    }
    if (multiplier < 1) {
      return { background: "#edf8f3", color: "#23644f" };
    }
    return { background: "#f4f7fb", color: "#4d5a70" };
  }

  if (multiplier >= 2) {
    return { background: "#edf8f3", color: "#23644f" };
  }
  if (multiplier < 1) {
    return { background: "#fff1ec", color: "#8b3b24" };
  }
  return { background: "#f4f7fb", color: "#4d5a70" };
}
