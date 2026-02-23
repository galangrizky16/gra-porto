"use client";

import { usePathname } from "next/navigation";
import Sidebar from "@/app/admin/components/Sidebar";
import Footer from "@/app/admin/components/Footer";

const AUTH_ROUTES = [
  "/admin/auth/login",
  "/admin/auth/register",
  "/admin/auth/forgot-password",
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const showSidebar = !AUTH_ROUTES.includes(pathname ?? "");

  if (!showSidebar) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0">
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}