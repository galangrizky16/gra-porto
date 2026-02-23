"use client";

import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/app/providers";

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative flex items-center w-16 h-8 rounded-full bg-gray-100 dark:bg-gray-700 p-1 transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
    >
      {/* Track icons */}
      <Sun size={12} className="absolute left-2 text-amber-400 pointer-events-none" />
      <Moon size={12} className="absolute right-2 text-indigo-400 pointer-events-none" />

      {/* Sliding pill */}
      <motion.div
        className="w-6 h-6 rounded-full bg-white dark:bg-gray-900 shadow z-10 flex items-center justify-center"
        animate={{ x: isDark ? 32 : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {isDark ? (
          <Moon size={11} className="text-indigo-500" />
        ) : (
          <Sun size={11} className="text-amber-500" />
        )}
      </motion.div>
    </button>
  );
}