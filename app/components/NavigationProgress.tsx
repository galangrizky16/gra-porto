"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

// ── Progress bar navigasi yang benar-benar muncul ────────────────────────────
// Cara kerja: intercept semua klik <a> internal → start bar → setelah
// pathname berubah (route selesai) → complete bar → fade out.

export default function NavigationProgress() {
  const pathname = usePathname();
  const [width, setWidth] = useState(0);
  const [opacity, setOpacity] = useState(0);
  const [active, setActive] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevPathname = useRef(pathname);
  const isNavigating = useRef(false);

  const clear = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (completeTimerRef.current) clearTimeout(completeTimerRef.current);
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
  };

  // ── Start: dipanggil saat link diklik ────────────────────────────────────
  const start = useCallback(() => {
    if (isNavigating.current) return;
    isNavigating.current = true;
    clear();

    setWidth(0);
    setOpacity(1);
    setActive(true);

    // Mulai langsung dari 5%
    let w = 5;
    setWidth(w);

    // Maju bertahap sampai ~80% — berhenti di sini nunggu route selesai
    intervalRef.current = setInterval(() => {
      w += Math.random() * 8 + 3;
      if (w >= 80) {
        w = 80;
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
      setWidth(w);
    }, 150);
  }, []);

  // ── Complete: dipanggil setelah pathname berubah ──────────────────────────
  const complete = useCallback(() => {
    clear();
    setWidth(100);

    hideTimerRef.current = setTimeout(() => {
      setOpacity(0);
      setTimeout(() => {
        setActive(false);
        setWidth(0);
        isNavigating.current = false;
      }, 300);
    }, 300);
  }, []);

  // ── Deteksi pathname berubah → route selesai → complete ──────────────────
  useEffect(() => {
    if (prevPathname.current !== pathname) {
      prevPathname.current = pathname;
      if (isNavigating.current) {
        complete();
      }
    }
  }, [pathname, complete]);

  // ── Intercept semua klik <a> internal di document ────────────────────────
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = (e.target as Element).closest("a");
      if (!target) return;

      const href = target.getAttribute("href");
      if (!href) return;

      // Hanya internal link (bukan external, bukan anchor #, bukan mailto/tel)
      const isInternal =
        href.startsWith("/") &&
        !href.startsWith("//") &&
        !target.hasAttribute("target");

      if (!isInternal) return;

      // Jangan trigger kalau sudah di halaman yang sama
      if (href === pathname) return;

      // Jangan trigger kalau modifier key ditekan (ctrl/cmd click → buka tab baru)
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      start();
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [pathname, start]);

  // ── Render ────────────────────────────────────────────────────────────────
  if (!active && width === 0) return null;

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        height: 3,
        zIndex: 99999,
        pointerEvents: "none",
        opacity,
        transition: "opacity 0.3s ease",
      }}
    >
      <div
        style={{
          height: "100%",
          width: `${width}%`,
          borderRadius: "0 4px 4px 0",
          background: "linear-gradient(90deg, #7c3aed 0%, #a855f7 60%, #c084fc 100%)",
          boxShadow: "0 0 12px rgba(168,85,247,0.8), 0 0 24px rgba(168,85,247,0.4)",
          transition:
            width === 100
              ? "width 0.25s cubic-bezier(0.4, 0, 0.2, 1)"
              : "width 0.15s linear",
          position: "relative",
        }}
      >
        {/* Shimmer di ujung kanan */}
        <div
          style={{
            position: "absolute",
            right: 0,
            top: 0,
            width: 80,
            height: "100%",
            borderRadius: "0 4px 4px 0",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.55))",
          }}
        />
      </div>
    </div>
  );
}