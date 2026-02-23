"use client";

import { usePathname } from "next/navigation";
import FloatingSettings from "./FloatingSettings";

const ACTIVE_ROUTES = [
  "/",
  "/tentang",
  "/pencapaian",
  "/bisnis",
  "/proyek",
  "/content",
  "/roomchat",
  "/kontak",
];

export default function FloatingWidgets() {
  const pathname = usePathname();
  const isActive = ACTIVE_ROUTES.includes(pathname ?? "/");

  if (!isActive) return null;

  return (
    <>
      <FloatingSettings />
    </>
  );
}