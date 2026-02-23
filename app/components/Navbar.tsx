"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import {
  motion,
  AnimatePresence,
  type Variants,
  type Transition,
} from "framer-motion";
import {
  Menu,
  X,
  Home,
  User,
  Trophy,
  Briefcase,
  FolderOpen,
  Film,
  MessageCircle,
  Mail,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { useTheme } from "@/app/providers";
import { useLanguage } from "@/app/providers/LanguageContext";

// ── Translations ──────────────────────────────────────────────────────────────
const T = {
  id: {
    nav: [
      { label: "Home",          href: "/",           icon: Home },
      { label: "Tentang Saya",  href: "/tentang",    icon: User },
      { label: "Pencapaian",    href: "/pencapaian", icon: Trophy },
      { label: "Bisnis",        href: "/bisnis",     icon: Briefcase },
      { label: "Proyek",        href: "/proyek",     icon: FolderOpen },
      { label: "Konten",        href: "/content",    icon: Film },
      { label: "Ruang Obrolan", href: "/roomchat",   icon: MessageCircle },
      { label: "Kontak",        href: "/kontak",     icon: Mail },
    ],
    copyright: "© 2025 Galang Rizky Arridho",
    openMenu: "Buka menu",
    closeMenu: "Tutup menu",
    toggleTheme: "Ganti tema",
    switchToEn: "Switch to English",
    switchToId: "Ganti ke Bahasa Indonesia",
  },
  en: {
    nav: [
      { label: "Home",         href: "/",           icon: Home },
      { label: "About Me",     href: "/tentang",    icon: User },
      { label: "Achievements", href: "/pencapaian", icon: Trophy },
      { label: "Business",     href: "/bisnis",     icon: Briefcase },
      { label: "Projects",     href: "/proyek",     icon: FolderOpen },
      { label: "Content",      href: "/content",    icon: Film },
      { label: "Chat Room",    href: "/roomchat",   icon: MessageCircle },
      { label: "Contact",      href: "/kontak",     icon: Mail },
    ],
    copyright: "© 2025 Galang Rizky Arridho",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    toggleTheme: "Toggle theme",
    switchToEn: "Switch to English",
    switchToId: "Switch to Bahasa Indonesia",
  },
} as const;

type Lang = keyof typeof T;

const sidebarVariants: Variants = {
  hidden: { x: "-100%", opacity: 0 },
  visible: {
    x: 0,
    opacity: 1,
    transition: { type: "spring", damping: 25, stiffness: 200 } as Transition,
  },
  exit: {
    x: "-100%",
    opacity: 0,
    transition: { duration: 0.3, ease: "easeInOut" } as Transition,
  },
};

const overlayVariants: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } as Transition },
  exit: { opacity: 0, transition: { duration: 0.3 } as Transition },
};

const menuItemVariants: Variants = {
  hidden: { x: -16, opacity: 0 },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    transition: { delay: i * 0.05, duration: 0.3, ease: "easeOut" as const },
  }),
};

/* ── Dark Mode Toggle ── */
function DarkModeToggle({ isDark, onToggle, ariaLabel }: { isDark: boolean; onToggle: () => void; ariaLabel: string }) {
  return (
    <button
      onClick={onToggle}
      aria-label={ariaLabel}
      className="relative flex items-center w-16 h-8 rounded-full p-1 focus:outline-none transition-colors duration-200 bg-[#f3f4f6] dark:bg-[#374151]"
    >
      <Sun size={12} className="absolute left-2 text-amber-400 pointer-events-none" />
      <Moon size={12} className="absolute right-2 text-indigo-400 pointer-events-none" />
      <motion.div
        className="w-6 h-6 rounded-full shadow z-10 flex items-center justify-center bg-white dark:bg-[#111827]"
        animate={{ x: isDark ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {isDark
          ? <Moon size={11} className="text-indigo-400" />
          : <Sun size={11} className="text-amber-500" />
        }
      </motion.div>
    </button>
  );
}

/* ── Language Toggle ── */
function LanguageToggle({ lang, onToggle, switchToEn, switchToId }: {
  lang: "id" | "en";
  onToggle: () => void;
  switchToEn: string;
  switchToId: string;
}) {
  return (
    <div className="relative flex items-center rounded-full p-1 h-8 bg-[#f3f4f6] dark:bg-[#374151]">
      <motion.div
        className="absolute top-1 bottom-1 w-[calc(50%-2px)] rounded-full shadow-sm bg-white dark:bg-[#111827]"
        animate={{ x: lang === "id" ? "calc(100% + 2px)" : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
      <button
        onClick={() => lang !== "en" && onToggle()}
        title={switchToEn}
        className="relative z-10 flex items-center gap-1 px-3 h-full text-xs font-semibold text-[#374151] dark:text-[#e2e8f0]"
      >
        <span>🇺🇸</span> <span>US</span>
      </button>
      <button
        onClick={() => lang !== "id" && onToggle()}
        title={switchToId}
        className="relative z-10 flex items-center gap-1 px-3 h-full text-xs font-semibold text-[#374151] dark:text-[#e2e8f0]"
      >
        <span>🇮🇩</span> <span>ID</span>
      </button>
    </div>
  );
}

/* ── Main Component ── */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang } = useLanguage();
  const isDark = theme === "dark";
  const pathname = usePathname();
  const t = T[lang as Lang] ?? T.id;

  const handleNavClick = () => setMobileOpen(false);

  /* ── Nav Links ── */
  const NavLinks = ({ stagger = false }: { stagger?: boolean }) => (
    <nav className="flex flex-col gap-0.5 px-3 mt-2">
      {t.nav.map((item, i) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <motion.a
            key={item.href}
            href={item.href}
            onClick={handleNavClick}
            custom={i}
            initial={stagger ? "hidden" : false}
            animate={stagger ? "visible" : false}
            variants={stagger ? menuItemVariants : undefined}
            className={`group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium cursor-pointer transition-colors duration-150
              ${isActive
                ? "bg-[#f3f4f6] dark:bg-[#1e293b] text-[#111827] dark:text-[#f1f5f9]"
                : "text-[#6b7280] dark:text-[#94a3b8] hover:bg-[#f9fafb] dark:hover:bg-[rgba(30,41,59,0.6)]"
              }`}
          >
            <Icon
              size={16}
              className={`shrink-0 transition-colors duration-150
                ${isActive
                  ? "text-[#111827] dark:text-[#f1f5f9]"
                  : "text-[#9ca3af] dark:text-[#64748b]"
                }`}
            />
            <span>{item.label}</span>
            {isActive && (
              <ChevronRight size={14} className="ml-auto text-[#9ca3af] dark:text-[#64748b]" />
            )}
          </motion.a>
        );
      })}
    </nav>
  );

  /* ── Profile Section ── */
  const ProfileSection = ({ showToggles = false }: { showToggles?: boolean }) => (
    <div className="px-5 pt-7 pb-5">
      <div className="flex flex-col items-center mb-4">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3 outline-2 outline-offset-2 outline-[#e5e7eb] dark:outline-[#334155]">
          <Image
            src="/assets/profile.png"
            alt="Galang Rizky Arridho"
            width={80}
            height={80}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-sm text-[#111827] dark:text-[#f1f5f9]">
            Galang Rizky Arridho
          </span>
          <Image src="/assets/centang.png" alt="verified" width={14} height={14} className="shrink-0" />
        </div>
        <span className="text-xs mt-0.5 text-[#9ca3af] dark:text-[#64748b]">
          @GRA
        </span>
      </div>

      {showToggles && (
        <div className="flex items-center justify-between gap-2">
          <LanguageToggle lang={lang} onToggle={toggleLang} switchToEn={t.switchToEn} switchToId={t.switchToId} />
          <DarkModeToggle isDark={isDark} onToggle={toggleTheme} ariaLabel={t.toggleTheme} />
        </div>
      )}
    </div>
  );

  /* ── Sidebar Content ── */
  const SidebarContent = ({ stagger = false, showToggles = false }: { stagger?: boolean; showToggles?: boolean }) => (
    <div className="flex flex-col h-full w-full overflow-hidden transition-colors duration-200 bg-white dark:bg-[#0f172a]">
      <ProfileSection showToggles={showToggles} />
      <div className="mx-5 h-px bg-[#f3f4f6] dark:bg-[#1e293b]" />
      <div className="flex-1 overflow-y-auto py-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        <NavLinks stagger={stagger} />
      </div>
      <div className="px-5 py-4 border-t border-[#f3f4f6] dark:border-[#1e293b]">
        <p className="text-xs text-center text-[#9ca3af] dark:text-[#64748b]">
          {t.copyright}
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden md:flex md:flex-col fixed left-0 top-0 h-screen w-64 z-40 shadow-sm overflow-hidden transition-colors duration-200 bg-white dark:bg-[#0f172a] border-r border-[#f3f4f6] dark:border-[#1e293b]">
        <SidebarContent showToggles={true} />
      </aside>

      {/* ─── MOBILE TOP NAVBAR ─── */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 transition-colors duration-200 bg-white dark:bg-[#0f172a] border-b border-[#f3f4f6] dark:border-[#1e293b]">
        <div className="flex items-center justify-between px-4 h-14">

          {/* Left: avatar + name */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 outline-2 outline-offset-2 outline-[#e5e7eb] dark:outline-[#334155]">
              <Image
                src="/assets/profile.png"
                alt="Galang Rizky Arridho"
                width={32}
                height={32}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-sm text-[#111827] dark:text-[#f1f5f9]">
                Galang Rizky Arridho
              </span>
              <Image src="/assets/centang.png" alt="verified" width={13} height={13} className="shrink-0" />
            </div>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">

            {/* Language toggle */}
            <button
              onClick={toggleLang}
              className="h-8 px-2.5 flex items-center gap-1 rounded-full text-xs font-semibold transition-colors duration-200 bg-[#f3f4f6] dark:bg-[#1e293b] text-[#111827] dark:text-[#f1f5f9]"
              title={lang === "en" ? t.switchToId : t.switchToEn}
            >
              {lang === "en"
                ? <><span>🇺🇸</span><span>US</span></>
                : <><span>🇮🇩</span><span>ID</span></>
              }
            </button>

            {/* Dark mode toggle */}
            <button
              onClick={toggleTheme}
              aria-label={t.toggleTheme}
              className="w-8 h-8 flex items-center justify-center rounded-full transition-colors duration-200 bg-[#f3f4f6] dark:bg-[#1e293b]"
            >
              {isDark
                ? <Moon size={15} className="text-indigo-400" />
                : <Sun size={15} className="text-amber-500" />
              }
            </button>

            {/* Hamburger */}
            <motion.button
              onClick={() => setMobileOpen(true)}
              whileTap={{ scale: 0.9 }}
              className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 bg-[#f3f4f6] dark:bg-[#1e293b] text-[#6b7280] dark:text-[#94a3b8]"
              aria-label={t.openMenu}
            >
              <Menu size={17} />
            </motion.button>
          </div>
        </div>
      </header>

      {/* ─── MOBILE SLIDE-IN SIDEBAR ─── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="overlay"
              variants={overlayVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onClick={() => setMobileOpen(false)}
              className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            />
            <motion.aside
              key="drawer"
              variants={sidebarVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="md:hidden fixed left-0 top-0 h-screen w-72 z-60 shadow-xl bg-white dark:bg-[#0f172a]"
            >
              <motion.button
                onClick={() => setMobileOpen(false)}
                whileTap={{ scale: 0.9 }}
                className="absolute top-3.5 right-3.5 z-20 w-8 h-8 flex items-center justify-center rounded-lg transition-colors duration-200 bg-[#f3f4f6] dark:bg-[#1e293b] text-[#6b7280] dark:text-[#94a3b8]"
                aria-label={t.closeMenu}
              >
                <X size={15} />
              </motion.button>
              <SidebarContent stagger />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}