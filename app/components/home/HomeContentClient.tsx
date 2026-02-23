"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import * as Si from "react-icons/si";
import useSWR from "swr";
import axios from "axios";
import { useLanguage } from "@/app/providers/LanguageContext";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.12, duration: 0.4, ease: "easeOut" as const },
  }),
};

const skillFadeIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.08, duration: 0.35, ease: "easeOut" as const },
  }),
};

type Skill = {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  sort_order: number;
  is_active: boolean;
};

type ProfileContent = {
  name: string;
  location: string;
  work_type: string;
  bio_1: string;
  bio_2: string;
};

type ProfileRaw = ProfileContent & {
  content_id?: string | object | null;
  content_en?: string | object | null;
};

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

import * as LucideIcons from "lucide-react";

// ── Helper: cek apakah warna terlalu gelap (luminance rendah) ────────────────
function isColorDark(hex: string): boolean {
  const clean = hex.replace("#", "");
  if (clean.length < 6) return false;
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  // Luminance relatif — nilai < 0.08 dianggap gelap
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance < 0.25;
}

// ── Hook: deteksi apakah dark mode aktif ─────────────────────────────────────
function useIsDarkMode(): boolean {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsDark(document.documentElement.classList.contains("dark"));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    return () => observer.disconnect();
  }, []);

  return isDark;
}

function TechIcon({
  name,
  color,
  isDark,
}: {
  name: string;
  color: string;
  isDark: boolean;
}) {
  // Jika dark mode aktif dan warna icon gelap, ganti ke putih
  const resolvedColor = isDark && isColorDark(color) ? "#e2e8f0" : color;

  const SiIcon = (
    Si as unknown as Record<
      string,
      React.ComponentType<{ size?: number; color?: string }>
    >
  )[name];
  if (SiIcon) return <SiIcon size={30} color={resolvedColor} />;

  const LucideIcon = (
    LucideIcons as unknown as Record<
      string,
      React.ComponentType<{ size?: number; color?: string }>
    >
  )[name];
  if (LucideIcon) return <LucideIcon size={30} color={resolvedColor} />;

  return null;
}

function SkillCard({ skill, index }: { skill: Skill; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [clicked, setClicked] = useState(false);
  const isDark = useIsDarkMode();

  // Warna asli icon — jika gelap & dark mode, pakai warna terang untuk UI card juga
  const isDarkIcon = isColorDark(skill.color);
  const cardColor =
    isDark && isDarkIcon
      ? "#94a3b8" // slate-400 — warna netral terang untuk border/bg card
      : skill.color;

  const handleClick = () => {
    setClicked(true);
    setTimeout(() => setClicked(false), 600);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <motion.div
        custom={index}
        initial="hidden"
        animate="visible"
        variants={skillFadeIn}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.92, rotate: -6 }}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={handleClick}
        className="relative w-16 h-16 rounded-full flex items-center justify-center cursor-pointer border shadow-md transition-shadow duration-300"
        style={{
          backgroundColor: cardColor + "18",
          borderColor: cardColor + "60",
          boxShadow: hovered ? `0 4px 20px ${cardColor}60` : undefined,
        }}
      >
        <TechIcon name={skill.icon_name} color={skill.color} isDark={isDark} />
        <AnimatePresence>
          {clicked && (
            <motion.div
              key="ripple"
              initial={{ scale: 0.6, opacity: 0.7 }}
              animate={{ scale: 2, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" as const }}
              className="absolute inset-0 rounded-full border-2"
              style={{ borderColor: cardColor + "60" }}
            />
          )}
        </AnimatePresence>
      </motion.div>

      <div className="h-4 flex items-center justify-center">
        <AnimatePresence>
          {(hovered || clicked) && (
            <motion.span
              key="label"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="text-xs font-semibold text-gray-600 dark:text-gray-300 whitespace-nowrap"
            >
              {skill.name}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Helper: parse JSONB field ────────────────────────────────────────────────
function parseJsonField<T>(field: unknown, fallback: T): T {
  if (!field) return fallback;
  if (typeof field === "string") {
    try {
      return JSON.parse(field) as T;
    } catch {
      return fallback;
    }
  }
  if (typeof field === "object") return field as T;
  return fallback;
}

// ── Helper: ambil konten sesuai bahasa ──────────────────────────────────────
function resolveContent(raw: ProfileRaw, lang: "id" | "en"): ProfileContent {
  const fallback: ProfileContent = {
    name: raw.name,
    location: raw.location,
    work_type: raw.work_type,
    bio_1: raw.bio_1,
    bio_2: raw.bio_2,
  };
  if (lang === "en" && raw.content_en)
    return parseJsonField<ProfileContent>(raw.content_en, fallback);
  if (lang === "id" && raw.content_id)
    return parseJsonField<ProfileContent>(raw.content_id, fallback);
  return fallback;
}

export default function HomeContentClient({
  initialProfile,
  initialSkills,
}: {
  initialProfile: ProfileRaw;
  initialSkills: Skill[];
}) {
  const { lang } = useLanguage();

  const { data: rawProfile = initialProfile } = useSWR<ProfileRaw>(
    "/api/public/profile",
    fetcher,
    { fallbackData: initialProfile, refreshInterval: 5000 }
  );

  const { data: skills = initialSkills } = useSWR<Skill[]>(
    "/api/public/skills",
    fetcher,
    { fallbackData: initialSkills, refreshInterval: 5000 }
  );

  const profile = resolveContent(rawProfile, lang);

  const labels = {
    greeting: lang === "id" ? "Halo, saya" : "Hi, I'm",
    location:
      lang === "id"
        ? `Berdomisili di ${profile.location} 🇮🇩`
        : `Based in ${profile.location} 🇮🇩`,
    skillsTitle: lang === "id" ? "Keahlian" : "Skills",
    skillsSubtitle:
      lang === "id" ? "Keahlian profesional saya." : "My professional skill set.",
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 px-6 py-14 md:py-20 md:px-14">
      <section className="max-w-3xl">
        <motion.h1
          key={`h1-${lang}`}
          custom={0}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4"
        >
          {labels.greeting} {profile.name}
        </motion.h1>

        <motion.p
          key={`meta-${lang}`}
          custom={1}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-sm text-gray-500 dark:text-gray-400 mb-8 flex items-center gap-2 flex-wrap"
        >
          <span>{labels.location}</span>
          <span className="text-gray-300 dark:text-gray-600">•</span>
          <span>{profile.work_type}</span>
        </motion.p>

        <div className="h-px bg-gray-100 dark:bg-gray-800 mb-8" />

        <motion.p
          key={`bio1-${lang}`}
          custom={2}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-gray-600 dark:text-gray-300 text-base leading-relaxed mb-5"
        >
          {profile.bio_1}
        </motion.p>

        <motion.p
          key={`bio2-${lang}`}
          custom={3}
          initial="hidden"
          animate="visible"
          variants={fadeUp}
          className="text-gray-600 dark:text-gray-300 text-base leading-relaxed"
        >
          {profile.bio_2}
        </motion.p>
      </section>

      {skills.length > 0 && (
        <section className="max-w-3xl mt-16">
          <motion.div
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="mb-8"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="text-gray-500 dark:text-gray-400 text-sm font-mono">
                {"</>"}
              </span>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {labels.skillsTitle}
              </h2>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {labels.skillsSubtitle}
            </p>
          </motion.div>

          <div className="grid grid-cols-5 gap-4 sm:flex sm:flex-wrap sm:gap-6">
            {skills.map((skill, i) => (
              <SkillCard key={skill.id} skill={skill} index={i} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}