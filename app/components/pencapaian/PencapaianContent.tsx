"use client";

import { useState, useMemo, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { Search, X, Award, Filter, Calendar, ExternalLink } from "lucide-react";
import useSWR from "swr";
import axios from "axios";
import { useLanguage } from "@/app/providers/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Sertifikat = {
  id: string;
  image_url: string;
  name_id: string;
  name_en: string;
  issuer_id: string;
  issuer_en: string;
  date: string;
  type: string;
  category: string;
  credential_url: string;
  is_active: boolean;
  sort_order: number;
};

// ── Bilingual resolver ────────────────────────────────────────────────────────
function resolveName(item: Sertifikat, lang: "id" | "en"): string {
  if (lang === "en" && item.name_en) return item.name_en;
  return item.name_id;
}

function resolveIssuer(item: Sertifikat, lang: "id" | "en"): string {
  if (lang === "en" && item.issuer_en) return item.issuer_en;
  return item.issuer_id;
}

// ── Type colors ───────────────────────────────────────────────────────────────
const TYPE_COLORS: Record<string, { badge: string; bg: string; icon: string; boxBg: string }> = {
  Kompetisi:   { badge: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800",   bg: "from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20",   icon: "text-amber-500",   boxBg: "bg-amber-100 dark:bg-amber-900/40" },
  Sertifikasi: { badge: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800", bg: "from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20", icon: "text-emerald-500", boxBg: "bg-emerald-100 dark:bg-emerald-900/40" },
  Penghargaan: { badge: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-100 dark:border-yellow-800",  bg: "from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20",  icon: "text-yellow-500",  boxBg: "bg-yellow-100 dark:bg-yellow-900/40" },
  Pelatihan:   { badge: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-100 dark:border-violet-800",  bg: "from-violet-50 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20",  icon: "text-violet-500",  boxBg: "bg-violet-100 dark:bg-violet-900/40" },
};

// ── Internal sentinel (tidak bergantung bahasa) ───────────────────────────────
const ALL = "__ALL__";

// ── i18n strings ──────────────────────────────────────────────────────────────
const i18n = {
  id: {
    heading: "Pencapaian",
    subtitle: "Kumpulan sertifikat, pelatihan, dan penghargaan yang telah saya raih.",
    searchPlaceholder: "Cari sertifikat...",
    typeLabel: "Type",
    categoryLabel: "Kategori",
    allLabel: "Semua",
    showing: (n: number, total: number) => `Menampilkan ${n} dari ${total} sertifikat`,
    reset: "Reset filter",
    empty: "Tidak ada hasil",
    emptySub: "Coba kata kunci atau filter lain.",
    credential: "Lihat Kredensial",
    issueDate: "Tanggal",
    noPhoto: "Foto belum tersedia",
    showDetails: "detail",
  },
  en: {
    heading: "Achievements",
    subtitle: "A collection of certificates, training, and awards I have earned.",
    searchPlaceholder: "Search certificates...",
    typeLabel: "Type",
    categoryLabel: "Category",
    allLabel: "All",
    showing: (n: number, total: number) => `Showing ${n} of ${total} certificates`,
    reset: "Reset filters",
    empty: "No results found",
    emptySub: "Try different keywords or filters.",
    credential: "View Credential",
    issueDate: "Date",
    noPhoto: "Photo not available",
    showDetails: "details",
  },
};

// ── Fetcher ───────────────────────────────────────────────────────────────────
const fetcher = (url: string) => axios.get(url).then((r) => r.data);

// ── Filter Chip ───────────────────────────────────────────────────────────────
function Chip({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <motion.button onClick={onClick} whileTap={{ scale: 0.95 }}
      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 border ${active
        ? "bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-500/20"
        : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400"
      }`}>
      {label}
    </motion.button>
  );
}

// ── Detail Modal ──────────────────────────────────────────────────────────────
function DetailModal({ item, onClose, lang }: { item: Sertifikat; onClose: () => void; lang: "id" | "en" }) {
  const t = i18n[lang];
  const colors = TYPE_COLORS[item.type] ?? TYPE_COLORS["Pelatihan"];
  const name = resolveName(item, lang);
  const issuer = resolveIssuer(item, lang);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}
      className="fixed inset-0 z-100 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0, y: 16 }} transition={{ duration: 0.25, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row max-h-[90vh]"
      >
        <button onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 flex items-center justify-center transition-colors text-gray-700 dark:text-gray-200">
          <X size={14} />
        </button>

        {/* Left — image */}
        <div className="relative md:w-[55%] shrink-0 bg-gray-50 dark:bg-slate-800 min-h-56 md:min-h-0">
          {item.image_url ? (
            <Image src={item.image_url} alt={name} fill className="object-contain md:object-cover" sizes="(max-width: 768px) 100vw, 55vw" />
          ) : (
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br ${colors.bg}`}>
              <div className={`w-20 h-20 rounded-3xl flex items-center justify-center ${colors.boxBg}`}>
                <Award size={36} className={colors.icon} />
              </div>
              <p className="text-xs text-gray-400 dark:text-slate-500">{t.noPhoto}</p>
            </div>
          )}
        </div>

        {/* Right — detail */}
        <div className="flex-1 p-6 overflow-y-auto">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white leading-snug mb-1">{name}</h2>
          {issuer && <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">{issuer}</p>}

          <div className="space-y-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-1">Type</p>
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${colors.badge}`}>
                <Award size={10} /> {item.type}
              </span>
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-0.5">Category</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">{item.category}</p>
            </div>
            {item.date && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-0.5">{t.issueDate}</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{item.date}</p>
              </div>
            )}
            {item.credential_url && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 mb-0.5">Credential URL</p>
                <p className="text-xs font-mono text-gray-500 dark:text-gray-400 break-all">{item.credential_url}</p>
              </div>
            )}
          </div>

          {item.credential_url && (
            <a href={item.credential_url} target="_blank" rel="noopener noreferrer"
              className="mt-6 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors w-fit">
              <ExternalLink size={13} /> {t.credential}
            </a>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Sertifikat Card ───────────────────────────────────────────────────────────
function SertifikatCard({ item, index, lang }: { item: Sertifikat; index: number; lang: "id" | "en" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });

  const colors = TYPE_COLORS[item.type] ?? TYPE_COLORS["Pelatihan"];
  const name = resolveName(item, lang);
  const issuer = resolveIssuer(item, lang);

  return (
    <>
      <motion.div ref={ref}
        initial={{ opacity: 0, y: 32 }} animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.45, delay: index * 0.08, ease: "easeOut" }}
        onClick={() => setOpen(true)}
        className="group relative rounded-2xl border border-gray-100 dark:border-slate-700/60 bg-white dark:bg-slate-800/60 overflow-hidden shadow-sm hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
      >
        {/* Image */}
        <div className="relative w-full aspect-4/3 bg-gray-50 dark:bg-slate-900 overflow-hidden">
          {item.image_url ? (
            <>
              <Image src={item.image_url} alt={name} fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300" />
            </>
          ) : (
            <div className={`absolute inset-0 flex flex-col items-center justify-center gap-3 bg-linear-to-br ${colors.bg}`}>
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colors.boxBg}`}>
                <Award size={26} className={colors.icon} />
              </div>
              {issuer && <p className="text-[11px] text-gray-400 dark:text-slate-500">{issuer}</p>}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-4">
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${colors.badge}`}>
              <Award size={9} /> {item.type}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-gray-50 dark:bg-slate-700 text-gray-500 dark:text-gray-400 border border-gray-100 dark:border-slate-600">
              {item.category}
            </span>
          </div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-1.5 line-clamp-2">{name}</p>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1 text-[11px] text-gray-400 dark:text-slate-500">
              <Calendar size={10} /> {item.date}
            </span>
            {issuer && <span className="text-[11px] text-gray-400 dark:text-slate-500 truncate max-w-28">{issuer}</span>}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {open && <DetailModal item={item} onClose={() => setOpen(false)} lang={lang} />}
      </AnimatePresence>
    </>
  );
}

// ── Empty State ───────────────────────────────────────────────────────────────
function EmptyState({ query, lang }: { query: string; lang: "id" | "en" }) {
  const t = i18n[lang];
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
        <Search size={24} className="text-gray-300 dark:text-slate-600" />
      </div>
      <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
        {t.empty}{query && <> &ldquo;<span className="text-gray-900 dark:text-white">{query}</span>&rdquo;</>}
      </p>
      <p className="text-xs text-gray-400 dark:text-slate-500 mt-1">{t.emptySub}</p>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function PencapaianContent({ initialData }: { initialData: Sertifikat[] }) {
  const { lang } = useLanguage();
  const t = i18n[lang];

  const { data = initialData } = useSWR<Sertifikat[]>(
    "/api/public/pencapaian",
    fetcher,
    { fallbackData: initialData, refreshInterval: 10000 }
  );

  const [query, setQuery] = useState("");
  const [activeType, setActiveType] = useState(ALL);
  const [activeCategory, setActiveCategory] = useState(ALL);

  // Unique filter values
  const types = useMemo(() => [ALL, ...Array.from(new Set(data.map((d) => d.type)))], [data]);
  const categories = useMemo(() => [ALL, ...Array.from(new Set(data.map((d) => d.category)))], [data]);

  const filtered = useMemo(() => {
    return data.filter((item) => {
      const name = resolveName(item, lang).toLowerCase();
      const issuer = resolveIssuer(item, lang).toLowerCase();
      const q = query.toLowerCase();
      const matchQ = !q || name.includes(q) || issuer.includes(q) || item.category.toLowerCase().includes(q);
      const matchT = activeType === ALL || item.type === activeType;
      const matchC = activeCategory === ALL || item.category === activeCategory;
      return matchQ && matchT && matchC;
    });
  }, [data, query, activeType, activeCategory, lang]);

  const hasFilter = query || activeType !== ALL || activeCategory !== ALL;

  const resetFilters = () => {
    setQuery(""); setActiveType(ALL); setActiveCategory(ALL);
  };

  return (
    <main className="min-h-screen bg-white dark:bg-slate-900 px-6 py-14 md:py-20 md:px-14 transition-colors duration-300">
      <div className="max-w-5xl">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: "easeOut" }} className="mb-10">
          <div className="flex items-center gap-2 mb-1">
            <Award size={16} className="text-gray-500 dark:text-gray-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
              {t.heading}
            </h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">{t.subtitle}</p>
          <motion.hr
            initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5, ease: "easeOut" }} style={{ originX: 0 }}
            className="border-dashed border-gray-200 dark:border-gray-700 mt-6"
          />
        </motion.div>

        {/* Search + Filters */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }} className="mb-8 space-y-4">

          {/* Search bar */}
          <div className="relative max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full pl-9 pr-9 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 transition-colors" />
            {query && (
              <button onClick={() => setQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Filter chips */}
          <div className="space-y-2.5">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 w-16 shrink-0">
                <Filter size={10} /> {t.typeLabel}
              </span>
              {types.map((t2) => (
                <Chip
                  key={t2}
                  label={t2 === ALL ? t.allLabel : t2}
                  active={activeType === t2}
                  onClick={() => setActiveType(t2)}
                />
              ))}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500 w-16 shrink-0">
                <Filter size={10} /> {t.categoryLabel}
              </span>
              {categories.map((c) => (
                <Chip
                  key={c}
                  label={c === ALL ? t.allLabel : c}
                  active={activeCategory === c}
                  onClick={() => setActiveCategory(c)}
                />
              ))}
            </div>
          </div>

          {/* Filter summary */}
          <AnimatePresence>
            {hasFilter && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                <span dangerouslySetInnerHTML={{ __html: t.showing(filtered.length, data.length).replace(/\d+/g, (n) => `<strong class="text-gray-900 dark:text-white">${n}</strong>`) }} />
                <button onClick={resetFilters} className="ml-1 text-violet-600 dark:text-violet-400 hover:underline font-semibold">
                  {t.reset}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Grid */}
        <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence mode="popLayout">
            {filtered.length === 0
              ? <EmptyState query={query} lang={lang} />
              : filtered.map((item, i) => <SertifikatCard key={item.id} item={item} index={i} lang={lang} />)
            }
          </AnimatePresence>
        </motion.div>

      </div>
    </main>
  );
}