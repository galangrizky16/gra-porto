"use client";

import { usePathname } from "next/navigation";
import Navbar from "./Navbar";

const NAVBAR_ROUTES = [
  "/",
  "/tentang",
  "/pencapaian",
  "/bisnis",
  "/proyek",
  "/content",
  "/roomchat",
  "/kontak",
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showNavbar = NAVBAR_ROUTES.includes(pathname ?? "/");

  return (
    <>
      {showNavbar && <Navbar />}
      <main className={showNavbar ? "pt-14 md:pt-0 md:pl-64" : ""}>
        <div className="min-h-screen bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors duration-300">
          {children}
        </div>
      </main>
    </>
  );
}