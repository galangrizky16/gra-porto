"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { ChevronRight, CheckCircle2, Briefcase, Lightbulb, Rocket } from "lucide-react";

export type KarierItem = {
  id: string;
  logo_url: string;
  position: string;
  company: string;
  location: string;
  start_date: string;
  end_date: string;
  total_duration: string;
  work_type: string;
  work_mode: string;
  tasks: string[];
  learnings: string[];
  impacts: string[];
  content_id?: { tasks: string[]; learnings: string[]; impacts: string[] } | null;
  content_en?: { tasks: string[]; learnings: string[]; impacts: string[] } | null;
};

function parseJsonField<T>(field: unknown, fallback: T): T {
  if (!field) return fallback;
  if (typeof field === "string") { try { return JSON.parse(field); } catch { return fallback; } }
  if (typeof field === "object") return field as T;
  return fallback;
}

function resolveKarierContent(
  item: KarierItem,
  lang: "id" | "en"
): { tasks: string[]; learnings: string[]; impacts: string[] } {
  const fallback = { tasks: item.tasks, learnings: item.learnings, impacts: item.impacts };
  if (lang === "en") {
    const en = parseJsonField<typeof fallback | null>(item.content_en, null);
    if (en?.tasks?.length) return en;
  }
  const id = parseJsonField<typeof fallback | null>(item.content_id, null);
  if (id?.tasks?.length) return id;
  return fallback;
}

type DetailGroup = { icon: React.ReactNode; label: string; color: string; items: string[] };

function DetailGroup({ group }: { group: DetailGroup }) {
  return (
    <div className="mb-4 last:mb-0">
      <div className="flex items-center gap-1.5 mb-2">
        <span style={{ color: group.color }}>{group.icon}</span>
        <span className="text-[11px] font-bold tracking-widest uppercase" style={{ color: group.color }}>{group.label}</span>
      </div>
      <ul className="space-y-1.5 pl-1">
        {group.items.map((item, i) => (
          <motion.li key={i} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.22 }} className="flex items-start gap-2">
            <CheckCircle2 size={13} className="shrink-0 mt-0.5" style={{ color: group.color }} />
            <span className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{item}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  );
}

function KarierCard({ item, index, lang }: { item: KarierItem; index: number; lang: "id" | "en" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  const content = resolveKarierContent(item, lang);

  const labels = lang === "en"
    ? { tasks: "Tasks", learnings: "What I Learned", impacts: "Impact", show: "Show details", hide: "Hide details" }
    : { tasks: "Tugas", learnings: "Apa yang Saya Pelajari", impacts: "Dampak", show: "Tampilkan detail", hide: "Sembunyikan detail" };

  const detailGroups: DetailGroup[] = [
    { icon: <Briefcase size={12} />, label: labels.tasks, color: "#7c3aed", items: content.tasks },
    { icon: <Lightbulb size={12} />, label: labels.learnings, color: "#0891b2", items: content.learnings },
    { icon: <Rocket size={12} />, label: labels.impacts, color: "#059669", items: content.impacts },
  ];

  return (
    <motion.div ref={ref} initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.45, delay: index * 0.1, ease: "easeOut" }}
      className="rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden"
    >
      <div className="flex items-start gap-4 px-5 pt-5 pb-4">
        <div className="shrink-0 w-12 h-12 rounded-lg border border-gray-200 dark:border-slate-600 bg-white flex items-center justify-center overflow-hidden shadow-sm">
          <Image src={item.logo_url} alt={`Logo ${item.company}`} width={48} height={48} className="w-full h-full object-contain p-1" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-0.5">{item.position}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 flex flex-wrap items-center gap-1">
            <span className="font-medium text-gray-700 dark:text-gray-300">{item.company}</span>
            <span className="text-gray-300 dark:text-slate-600">•</span>
            <span>{item.location}, Indonesia</span>
            <span role="img" aria-label="Indonesia" className="text-sm">🇮🇩</span>
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 flex flex-wrap items-center gap-1.5">
            <span>{item.start_date} - {item.end_date}</span>
            <span className="text-gray-300 dark:text-slate-600">•</span>
            <span>{item.total_duration}</span>
            <span className="text-gray-300 dark:text-slate-600">•</span>
            <span>{item.work_type}</span>
            <span className="text-gray-300 dark:text-slate-600">•</span>
            <span>{item.work_mode}</span>
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
              <DetailGroup group={detailGroups[0]} />
              <hr className="border-dashed border-gray-200 dark:border-slate-700 my-4" />
              <div className="grid grid-cols-1 md:grid-cols-[1fr_1px_1fr] gap-4 md:gap-6">
                <DetailGroup group={detailGroups[1]} />
                <div className="hidden md:block bg-gray-100 dark:bg-slate-700 self-stretch" />
                <DetailGroup group={detailGroups[2]} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function KarierSection({ initialData, lang = "id" }: { initialData: KarierItem[]; lang?: "id" | "en" }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  if (!initialData?.length) return null;

  const heading = lang === "en" ? "Career" : "Karier";
  const subtitle = lang === "en"
    ? "My professional journey and work experience."
    : "Perjalanan profesional dan pengalaman kerja saya.";

  return (
    <section className="max-w-3xl mt-16">
      <motion.div ref={ref} initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, ease: "easeOut" }} className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase size={16} className="text-gray-500 dark:text-gray-400" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">{heading}</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </motion.div>
      <div className="space-y-3">
        {initialData.map((item, i) => (
          <KarierCard key={item.id} item={item} index={i} lang={lang} />
        ))}
      </div>
    </section>
  );
}