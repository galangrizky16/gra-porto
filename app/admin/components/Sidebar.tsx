"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Home, ChevronLeft, ChevronRight, Zap, Menu, X,
  User, Trophy, FolderOpen,
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: NavItem[] = [
  { label: "Manage Home",       href: "/admin",            icon: <Home size={18} /> },
  { label: "Manage Tentang",    href: "/admin/tentang",    icon: <User size={18} /> },
  { label: "Manage Pencapaian", href: "/admin/pencapaian", icon: <Trophy size={18} /> },
  { label: "Manage Proyek",     href: "/admin/proyek",     icon: <FolderOpen size={18} /> },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <>
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-3.5 left-4 z-50 lg:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 shadow-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        aria-label="Buka menu"
      >
        <Menu size={18} />
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={`
          fixed top-0 left-0 z-50 h-screen flex flex-col
          bg-white dark:bg-slate-900
          border-r border-gray-100 dark:border-slate-800
          transition-all duration-300 ease-in-out lg:z-40
          ${collapsed ? "w-18" : "w-64"}
          ${mobileOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-violet-600 flex items-center justify-center shrink-0">
              <Zap size={14} className="text-white" />
            </div>
            {!collapsed && (
              <span className="text-sm font-bold text-gray-900 dark:text-white tracking-tight">GraAdmin</span>
            )}
          </div>
          <button onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          </button>
          <button onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
            <X size={16} />
          </button>
        </div>

        {!collapsed && (
          <div className="px-4 pt-4 pb-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-slate-600 px-3">Menu</p>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link key={item.href} href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                  ${collapsed ? "justify-center" : ""}
                  ${isActive
                    ? "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400"
                    : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-white"
                  }
                `}
                title={collapsed ? item.label : undefined}
              >
                <span className={`shrink-0 ${isActive ? "text-violet-600 dark:text-violet-400" : ""}`}>
                  {item.icon}
                </span>
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-500" />}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`px-3 py-4 border-t border-gray-100 dark:border-slate-800 ${collapsed ? "flex justify-center" : ""}`}>
          {!collapsed && (
            <p className="text-[11px] text-gray-400 dark:text-slate-600 font-medium uppercase tracking-wider px-3">v1.0.0</p>
          )}
        </div>
      </aside>

      <div className={`hidden lg:block shrink-0 transition-all duration-300 ${collapsed ? "w-18" : "w-64"}`} />
    </>
  );
}