"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { GraduationCap, MapPin, Calendar, ChevronRight, CheckCircle2 } from "lucide-react";

export type PendidikanItem = {
  id: string;
  logo_url: string;
  school: string;
  major: string;
  location: string;
  start_date: string;
  end_date: string;
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

function resolveHighlights(item: PendidikanItem, lang: "id" | "en"): string[] {
  if (lang === "en") {
    const en = parseJsonField<{ highlights: string[] } | null>(item.content_en, null);
    if (en?.highlights?.length) return en.highlights;
  }
  const id = parseJsonField<{ highlights: string[] } | null>(item.content_id, null);
  if (id?.highlights?.length) return id.highlights;
  return item.highlights;
}

function PendidikanCard({ item, index, lang }: { item: PendidikanItem; index: number; lang: "id" | "en" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const highlights = resolveHighlights(item, lang);
  const labels = lang === "en"
    ? { show: "Show details", hide: "Hide details" }
    : { show: "Tampilkan detail", hide: "Sembunyikan detail" };

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
      className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
    >
      <div className="flex items-start gap-4 px-5 pt-5 pb-4">
        <div className="shrink-0 w-12 h-12 rounded-lg border border-gray-200 dark:border-slate-600 bg-white flex items-center justify-center overflow-hidden shadow-sm">
          <Image src={item.logo_url} alt={`Logo ${item.school}`} width={48} height={48} className="w-full h-full object-contain p-1" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-0.5">{item.school}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex flex-wrap items-center gap-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">{item.major}</span>
            <span className="text-gray-300 dark:text-slate-600">•</span>
            <MapPin size={11} className="shrink-0" />
            <span>{item.location}, Indonesia</span>
            <span role="img" aria-label="Indonesia" className="text-sm">🇮🇩</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5">
            <Calendar size={11} className="shrink-0" />
            <span>{item.start_date} – {item.end_date}</span>
          </p>
        </div>
      </div>

      <button onClick={() => setOpen((p) => !p)}
        className="flex items-center gap-1.5 px-5 pb-4 text-xs font-medium text-gray-500 dark:text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors duration-150">
        <motion.span animate={{ rotate: open ? 90 : 0 }} transition={{ duration: 0.22 }}><ChevronRight size={14} /></motion.span>
        <span>{open ? labels.hide : labels.show}</span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div key="detail" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }} className="overflow-hidden">
            <div className="px-5 pb-5 pt-3 border-t border-gray-100 dark:border-slate-700">
              <ul className="space-y-2">
                {highlights.map((point, i) => (
                  <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06, duration: 0.22 }} className="flex items-start gap-2">
                    <CheckCircle2 size={13} className="shrink-0 mt-0.5 text-violet-500 dark:text-violet-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{point}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function PendidikanSection({ initialData, lang = "id" }: { initialData: PendidikanItem[]; lang?: "id" | "en" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  if (!initialData?.length) return null;

  const heading = lang === "en" ? "Education" : "Pendidikan";
  const subtitle = lang === "en"
    ? "My formal educational background."
    : "Latar belakang pendidikan formal saya.";

  return (
    <section className="max-w-3xl mt-16">
      <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, ease: "easeOut" }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <GraduationCap size={16} className="text-gray-500 dark:text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{heading}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </motion.div>
      <div className="space-y-3">
        {initialData.map((item, i) => (
          <PendidikanCard key={item.id} item={item} index={i} lang={lang} />
        ))}
      </div>
    </section>
  );
}