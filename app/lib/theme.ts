export type Theme = "light" | "dark";

const STORAGE_KEY = "gra-theme";

export function getInitialTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = localStorage.getItem(STORAGE_KEY) as Theme | null;
  if (stored === "light" || stored === "dark") return stored;
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function applyTheme(theme: Theme) {
  const root = document.documentElement;

  if (theme === "dark") {
    root.classList.add("dark");
    root.style.backgroundColor = "#0f172a";
    root.style.colorScheme = "dark";
  } else {
    root.classList.remove("dark");
    /*
     * Hapus inline style yang diset oleh blocking script di layout.tsx.
     * Tanpa ini, inline style backgroundColor akan terus override CSS,
     * dan saat ganti ke light mode background tetap navy.
     */
    root.style.removeProperty("background-color");
    root.style.removeProperty("color-scheme");
  }
}

export function saveTheme(theme: Theme) {
  localStorage.setItem(STORAGE_KEY, theme);
}