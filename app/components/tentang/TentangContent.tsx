"use client";

import { motion, useInView, AnimatePresence } from "framer-motion";
import { useRef, useEffect, useState } from "react";
import useSWR from "swr";
import axios from "axios";
import { useLanguage } from "@/app/providers/LanguageContext";
import KarierSection from "@/app/components/tentang/KarierSection";
import PendidikanSection from "@/app/components/tentang/PendidikanSection";

const fontImport = `@import url('https://fonts.googleapis.com/css2?family=Caveat:wght@600;700&display=swap');`;

type BioContent = { bio_1: string; bio_2: string; bio_3: string };

type Profile = {
  bio_1: string; bio_2: string; bio_3: string;
  bio_id?: BioContent | null;
  bio_en?: BioContent | null;
};

type Karier = {
  id: string; logo_url: string; position: string; company: string;
  location: string; start_date: string; end_date: string;
  total_duration: string; work_type: string; work_mode: string;
  tasks: string[]; learnings: string[]; impacts: string[];
  content_id?: { tasks: string[]; learnings: string[]; impacts: string[] } | null;
  content_en?: { tasks: string[]; learnings: string[]; impacts: string[] } | null;
};

type Pendidikan = {
  id: string; logo_url: string; school: string; major: string;
  location: string; start_date: string; end_date: string;
  highlights: string[];
  content_id?: { highlights: string[] } | null;
  content_en?: { highlights: string[] } | null;
};

function parseJsonField<T>(field: unknown, fallback: T): T {
  if (!field) return fallback;
  if (typeof field === "string") { try { return JSON.parse(field); } catch { return fallback; } }
  if (typeof field === "object") return field as T;
  return fallback;
}

function resolveBio(profile: Profile, lang: "id" | "en"): BioContent {
  const fallback: BioContent = { bio_1: profile.bio_1, bio_2: profile.bio_2, bio_3: profile.bio_3 };
  if (lang === "en") {
    const en = parseJsonField<BioContent | null>(profile.bio_en, null);
    if (en?.bio_1) return en;
  }
  const id = parseJsonField<BioContent | null>(profile.bio_id, null);
  if (id?.bio_1) return id;
  return fallback;
}

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

const fallbackProfile: Profile = {
  bio_1: "Saya Galang Rizky Arridho, seorang Web Developer yang berbasis di Jakarta Timur, Indonesia, berdedikasi untuk membangun solusi digital yang berdampak.",
  bio_2: "Fokus utama saya adalah merancang arsitektur perangkat lunak yang tidak hanya berjalan dengan baik, tetapi juga mudah dipelihara, skalabel, dan selaras dengan kebutuhan bisnis.",
  bio_3: "Saya memadukan kemampuan teknis dengan komunikasi yang efektif, pola pikir kritis, serta manajemen waktu yang baik.",
};

const pageVariants = {
  hidden:  { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.55, ease: "easeOut" as const } },
  exit:    { opacity: 0, y: -12, transition: { duration: 0.3,  ease: "easeIn"  as const } },
};

function ScrollReveal({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }} transition={{ duration: 0.55, delay, ease: "easeOut" }}>
      {children}
    </motion.div>
  );
}

function TypingText({ text, className }: { text: string; className?: string }) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  useEffect(() => {
    setDisplayed(""); setDone(false);
    let i = 0;
    const start = setTimeout(() => {
      const interval = setInterval(() => {
        i++;
        setDisplayed(text.slice(0, i));
        if (i >= text.length) { clearInterval(interval); setDone(true); }
      }, 60);
      return () => clearInterval(interval);
    }, 300);
    return () => clearTimeout(start);
  }, [text]);
  return (
    <span className={className}>
      {displayed}
      {!done && (
        <motion.span animate={{ opacity: [1, 0, 1] }} transition={{ repeat: Infinity, duration: 0.75 }}
          className="inline-block w-0.5 h-7 md:h-9 bg-violet-500 dark:bg-violet-400 align-middle ml-0.5 rounded-sm" aria-hidden="true"
        />
      )}
    </span>
  );
}

function HoverCard({ children }: { children: React.ReactNode }) {
  return (
    <motion.div whileHover={{ x: 6, transition: { type: "spring", stiffness: 300, damping: 22 } }} className="relative pl-4 cursor-default">
      <motion.div className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full bg-violet-400 dark:bg-violet-500 origin-top"
        initial={{ scaleY: 0, opacity: 0 }} whileHover={{ scaleY: 1, opacity: 1 }} transition={{ duration: 0.25, ease: "easeOut" }}
      />
      {children}
    </motion.div>
  );
}

const KEY_PROFILE    = "/api/public/tentang/profile";
const KEY_KARIER     = "/api/public/tentang/karier";
const KEY_PENDIDIKAN = "/api/public/tentang/pendidikan";

export default function TentangContent({
  initialProfile,
  initialKarier,
  initialPendidikan,
}: {
  initialProfile: Profile | null;
  initialKarier: Karier[];
  initialPendidikan: Pendidikan[];
}) {
  const { lang } = useLanguage();

  const { data: rawProfile = initialProfile ?? fallbackProfile } = useSWR<Profile>(
    KEY_PROFILE, fetcher, { fallbackData: initialProfile ?? fallbackProfile, refreshInterval: 5000 }
  );
  const { data: karier = initialKarier } = useSWR<Karier[]>(
    KEY_KARIER, fetcher, { fallbackData: initialKarier, refreshInterval: 5000 }
  );
  const { data: pendidikan = initialPendidikan } = useSWR<Pendidikan[]>(
    KEY_PENDIDIKAN, fetcher, { fallbackData: initialPendidikan, refreshInterval: 5000 }
  );

  const profile = resolveBio(rawProfile, lang);
  const paragraphs = [profile.bio_1, profile.bio_2, profile.bio_3].filter(Boolean);

  const headingText = lang === "en" ? "About" : "Tentang";
  const subtitleText = lang === "en"
    ? "A brief introduction to who I am and what I do."
    : "Pengenalan singkat tentang siapa saya dan apa yang saya kerjakan.";
  const greetingText = lang === "en" ? "Warm regards," : "Salam hangat,";

  return (
    <>
      <style>{fontImport}</style>
      <motion.main variants={pageVariants} initial="hidden" animate="visible" exit="exit"
        className="min-h-screen bg-white dark:bg-slate-900 px-6 py-14 md:py-20 md:px-14 transition-colors duration-300"
      >
        <article className="max-w-3xl">
          <div className="mb-6">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight min-h-10 md:min-h-12">
              <TypingText text={headingText} key={headingText} />
            </h1>
            <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.85, duration: 0.4, ease: "easeOut" }}
              className="mt-2 text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
              {subtitleText}
            </motion.p>
          </div>

          <motion.hr initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5, ease: "easeOut" }} style={{ originX: 0 }}
            className="border-dashed border-gray-200 dark:border-gray-700 mb-10"
          />

          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {paragraphs.map((text, i) => (
                <ScrollReveal key={`${lang}-${i}`} delay={i * 0.08}>
                  <HoverCard>
                    <motion.p
                      key={`${lang}-p-${i}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="text-gray-600 dark:text-gray-300 text-base leading-relaxed"
                    >
                      {text}
                    </motion.p>
                  </HoverCard>
                </ScrollReveal>
              ))}
            </AnimatePresence>
          </div>

          <ScrollReveal delay={0.1}>
            <motion.div className="mt-10 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700"
              whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 300, damping: 22 }}>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{greetingText}</p>
              <motion.p style={{ fontFamily: "'Caveat', cursive" }}
                className="text-4xl md:text-5xl font-semibold text-gray-800 dark:text-gray-100 select-none"
                aria-label="Galang Rizky Arridho"
                whileHover={{ color: "#7c3aed", transition: { duration: 0.2 } }}>
                Galang Rizky Arridho
              </motion.p>
            </motion.div>
          </ScrollReveal>
        </article>

        <KarierSection initialData={karier} lang={lang} />
        <PendidikanSection initialData={pendidikan} lang={lang} />
      </motion.main>
    </>
  );
}