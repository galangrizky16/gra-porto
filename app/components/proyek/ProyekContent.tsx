"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ExternalLink, Github, Calendar, ArrowUpRight, X, FolderOpen } from "lucide-react";
import useSWR from "swr";
import axios from "axios";
import { useLanguage } from "@/app/providers/LanguageContext";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Proyek = {
  id: string;
  image_url: string;
  title_id: string;
  title_en: string;
  description_id: string;
  description_en: string;
  long_desc_id: string;
  long_desc_en: string;
  techs: string[];
  category: string;
  year: string;
  live_url: string;
  github_url: string;
  github_private: boolean;
  is_active: boolean;
  sort_order: number;
};

// ── Bilingual resolvers ───────────────────────────────────────────────────────
function resolveTitle(item: Proyek, lang: "id" | "en"): string {
  return lang === "en" && item.title_en ? item.title_en : item.title_id;
}
function resolveDesc(item: Proyek, lang: "id" | "en"): string {
  return lang === "en" && item.description_en ? item.description_en : item.description_id;
}
function resolveLongDesc(item: Proyek, lang: "id" | "en"): string {
  return lang === "en" && item.long_desc_en ? item.long_desc_en : item.long_desc_id;
}

// ── i18n ──────────────────────────────────────────────────────────────────────
const i18n = {
  id: {
    eyebrow: "Portfolio",
    heading: "Proyek",
    sub: "Kumpulan karya nyata yang saya bangun — dari company profile, aplikasi web, hingga platform digital.\nSetiap proyek adalah cerminan dari dedikasi, problem-solving, dan passion terhadap teknologi.",
    statProyek: "Proyek",
    statTech: "Teknologi",
    statTerbaru: "Terbaru",
    viewDetail: "Lihat Detail",
    liveDemo: "Lihat Live Demo",
    source: "Source Code",
    techStack: "Tech Stack",
    empty: "Belum ada proyek",
    noImage: "Belum ada screenshot",
    liveDemoShort: "Live Demo",
    sourceShort: "Source",
  },
  en: {
    eyebrow: "Portfolio",
    heading: "Projects",
    sub: "A collection of real work I've built — from company profiles and web apps to digital platforms.\nEvery project reflects dedication, problem-solving, and passion for technology.",
    statProyek: "Projects",
    statTech: "Technologies",
    statTerbaru: "Latest",
    viewDetail: "View Details",
    liveDemo: "View Live Demo",
    source: "Source Code",
    techStack: "Tech Stack",
    empty: "No projects yet",
    noImage: "No screenshot yet",
    liveDemoShort: "Live Demo",
    sourceShort: "Source",
  },
};

// ── Tech Icons (import dari shared file) ──────────────────────────────────────
import { TechIcons } from "@/app/components/proyek/TechIcons";

function TechBadge({ name }: { name: string }) {
  const tech = TechIcons[name];
  if (!tech) return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-400 border border-gray-200/60 dark:border-slate-700/60">
      {name}
    </span>
  );
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border border-transparent transition-all duration-200"
      style={{ color: tech.color, backgroundColor: tech.bg, borderColor: `${tech.color}25` }}
    >
      <span style={{ color: tech.color }}>{tech.icon}</span>
      {name}
    </span>
  );
}

// ── Fetcher ───────────────────────────────────────────────────────────────────
const fetcher = (url: string) => axios.get(url).then((r) => r.data);

// ── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, index, onClick, lang }: {
  project: Proyek; index: number; onClick: () => void; lang: "id" | "en";
}) {
  const t = i18n[lang];
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });
  const title = resolveTitle(project, lang);
  const desc = resolveDesc(project, lang);

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.1, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-slate-800 hover:border-violet-200 dark:hover:border-violet-800/50 shadow-sm hover:shadow-xl hover:shadow-violet-500/8 transition-all duration-400 cursor-pointer"
      onClick={onClick}
      whileHover={{ y: -4 }}
    >
      {/* Image */}
      <div className="relative h-52 overflow-hidden bg-gray-100 dark:bg-slate-800">
        {project.image_url ? (
          <Image src={project.image_url} alt={title} fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
            <FolderOpen size={32} className="text-gray-300 dark:text-slate-600" />
            <p className="text-xs text-gray-400 dark:text-slate-600">{t.noImage}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Category badge */}
        <div className="absolute top-3 left-3">
          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 text-violet-600 dark:text-violet-400 backdrop-blur-sm border border-violet-100 dark:border-violet-800/40">
            {project.category}
          </span>
        </div>

        {/* Hover: view button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-sm shadow-lg border border-violet-100 dark:border-violet-800/40">
            <ArrowUpRight size={14} className="text-violet-600 dark:text-violet-400" />
            <span className="text-xs font-bold text-violet-700 dark:text-violet-300">{t.viewDetail}</span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-center gap-1.5 mb-2">
          <Calendar size={11} className="text-gray-400 dark:text-slate-600" />
          <span className="text-[11px] text-gray-400 dark:text-slate-600 font-medium">{project.year}</span>
        </div>
        <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-violet-700 dark:group-hover:text-violet-400 transition-colors duration-200">
          {title}
        </h3>
        <p className="text-sm text-gray-500 dark:text-slate-400 leading-relaxed mb-4 line-clamp-2">{desc}</p>
        <div className="flex flex-wrap gap-1.5 mb-4">
          {project.techs.map((tech) => <TechBadge key={tech} name={tech} />)}
        </div>
        <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-slate-800">
          {project.live_url && (
            <a href={project.live_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-violet-600 hover:bg-violet-700 text-white transition-colors duration-150">
              <ExternalLink size={11} /> {t.liveDemoShort}
            </a>
          )}
          {project.github_url && !project.github_private && (
            <a href={project.github_url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-slate-700 transition-colors duration-150">
              <Github size={11} /> {t.sourceShort}
            </a>
          )}
        </div>
      </div>
    </motion.article>
  );
}

// ── Project Modal ─────────────────────────────────────────────────────────────
function ProjectModal({ project, onClose, lang }: { project: Proyek; onClose: () => void; lang: "id" | "en" }) {
  const t = i18n[lang];
  const title = resolveTitle(project, lang);
  const longDesc = resolveLongDesc(project, lang);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = ""; };
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" />
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }} transition={{ duration: 0.3, ease: [0.34, 1.1, 0.64, 1] }}
          className="relative z-10 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl bg-white dark:bg-slate-900 shadow-2xl border border-gray-100 dark:border-slate-800 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image header */}
          <div className="relative h-64 overflow-hidden rounded-t-3xl bg-gray-100 dark:bg-slate-800">
            {project.image_url ? (
              <Image src={project.image_url} alt={title} fill className="object-cover" sizes="672px" />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <FolderOpen size={40} className="text-gray-300 dark:text-slate-600" />
              </div>
            )}
            <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />
            <button onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 backdrop-blur-sm flex items-center justify-center text-white transition-colors duration-150 border border-white/20">
              <X size={16} />
            </button>
            <div className="absolute bottom-4 left-5">
              <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-violet-600 text-white">
                {project.category}
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            <div className="flex items-start justify-between gap-4 mb-3">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white leading-snug">{title}</h2>
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <Calendar size={12} className="text-gray-400" />
                <span className="text-xs text-gray-400 font-medium">{project.year}</span>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-slate-400 leading-relaxed mb-5">{longDesc}</p>

            {/* Tech stack */}
            <div className="mb-6">
              <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-slate-600 mb-2.5">
                {t.techStack}
              </h4>
              <div className="flex flex-wrap gap-2">
                {project.techs.map((tech) => <TechBadge key={tech} name={tech} />)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-slate-800">
              {project.live_url && (
                <a href={project.live_url} target="_blank" rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-violet-500/25">
                  <ExternalLink size={15} /> {t.liveDemo}
                </a>
              )}
              {project.github_url && !project.github_private && (
                <a href={project.github_url} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-bold border border-gray-200 dark:border-slate-700 transition-colors duration-200">
                  <Github size={15} /> {t.source}
                </a>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function ProyekContent({ initialData }: { initialData: Proyek[] }) {
  const { lang } = useLanguage();
  const t = i18n[lang];

  const { data = initialData } = useSWR<Proyek[]>(
    "/api/public/proyek",
    fetcher,
    { fallbackData: initialData, refreshInterval: 10000 }
  );

  const [selectedProject, setSelectedProject] = useState<Proyek | null>(null);
  const headerRef = useRef(null);
  const headerInView = useInView(headerRef, { once: true });

  const allTechs = new Set(data.flatMap((p) => p.techs));
  const latestYear = data.length > 0
    ? Math.max(...data.map((p) => parseInt(p.year) || 0)).toString()
    : new Date().getFullYear().toString();

  return (
    <>
      <section className="min-h-screen px-6 py-10 md:py-14 max-w-5xl mx-auto">

        {/* Header */}
        <motion.header
          ref={headerRef}
          initial={{ opacity: 0, y: 24 }} animate={headerInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.55, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="mb-12"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-1.5 rounded-full bg-violet-500" />
            <span className="text-xs font-bold uppercase tracking-widest text-violet-500 dark:text-violet-400">
              {t.eyebrow}
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-4 tracking-tight leading-none">
            <AnimatePresence mode="wait">
              <motion.span key={lang} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.25 }} className="block">
                {t.heading}
              </motion.span>
            </AnimatePresence>
          </h1>
          <div className="w-12 h-1 rounded-full bg-violet-500 mb-5" />
          <p className="text-base text-gray-500 dark:text-slate-400 max-w-xl leading-relaxed whitespace-pre-line">
            {t.sub}
          </p>
          <div className="flex items-center gap-6 mt-6">
            <div>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{data.length}</span>
              <span className="text-xs text-gray-400 dark:text-slate-600 ml-1.5 font-medium">{t.statProyek}</span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-slate-800" />
            <div>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{allTechs.size}</span>
              <span className="text-xs text-gray-400 dark:text-slate-600 ml-1.5 font-medium">{t.statTech}</span>
            </div>
            <div className="w-px h-6 bg-gray-200 dark:bg-slate-800" />
            <div>
              <span className="text-2xl font-extrabold text-gray-900 dark:text-white">{latestYear}</span>
              <span className="text-xs text-gray-400 dark:text-slate-600 ml-1.5 font-medium">{t.statTerbaru}</span>
            </div>
          </div>
        </motion.header>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {data.map((project, i) => (
            <ProjectCard key={project.id} project={project} index={i} onClick={() => setSelectedProject(project)} lang={lang} />
          ))}
        </div>

        {/* Empty state */}
        {data.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-4">
              <Github size={24} className="text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-slate-500 font-medium">{t.empty}</p>
          </div>
        )}
      </section>

      {selectedProject && (
        <ProjectModal project={selectedProject} onClose={() => setSelectedProject(null)} lang={lang} />
      )}
    </>
  );
}