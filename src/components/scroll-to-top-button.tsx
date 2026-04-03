"use client";

import { useEffect, useState } from "react";

export default function ScrollToTopButton() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 280);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label="Scroll to top"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      style={{
        position: "fixed",
        right: "22px",
        bottom: "22px",
        zIndex: 60,
        width: "48px",
        height: "48px",
        border: "1px solid rgba(53, 94, 204, 0.24)",
        borderRadius: "14px",
        background: "linear-gradient(180deg, #ffffff 0%, #eef3ff 100%)",
        color: "#365ecc",
        boxShadow: "0 12px 28px rgba(39, 50, 70, 0.16)",
        cursor: "pointer",
        fontSize: "1.2rem",
        fontWeight: 800,
      }}
    >
      ↑
    </button>
  );
}
