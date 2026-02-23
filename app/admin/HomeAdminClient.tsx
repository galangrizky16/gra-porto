"use client";

import { useFormStatus } from "react-dom";
import { updateProfileAction, type ActionState } from "./home/actions";
import * as Si from "react-icons/si";
import { Trash2, Eye, EyeOff, Check, AlertCircle, Plus, Loader2, Globe, Languages } from "lucide-react";
import useSWR from "swr";
import axios from "axios";
import { useState, useActionState, useEffect, useRef } from "react";

type Profile = {
  id: string;
  name: string;
  location: string;
  work_type: string;
  bio_1: string;
  bio_2: string;
  content_id?: string | object | null; // JSONB: bisa object atau string
  content_en?: string | object | null; // JSONB: bisa object atau string
};

type ProfileContent = {
  name: string;
  location: string;
  work_type: string;
  bio_1: string;
  bio_2: string;
};

type Skill = {
  id: string;
  name: string;
  icon_name: string;
  color: string;
  sort_order: number;
  is_active: boolean;
};

const TECH_ICONS: { name: string; icon: string; color: string; library: "si" | "lucide" }[] = [
  { name: "HTML",           icon: "SiHtml5",          color: "#e44d26",  library: "si" },
  { name: "CSS",            icon: "SiCss3",           color: "#1572b6",  library: "si" },
  { name: "JavaScript",     icon: "SiJavascript",     color: "#f7df1e",  library: "si" },
  { name: "TypeScript",     icon: "SiTypescript",     color: "#3178c6",  library: "si" },
  { name: "Bootstrap",      icon: "SiBootstrap",      color: "#7952b3",  library: "si" },
  { name: "Tailwind CSS",   icon: "SiTailwindcss",    color: "#06b6d4",  library: "si" },
  { name: "Shadcn UI",      icon: "SiShadcnui",       color: "#000000",  library: "si" },
  { name: "Sass",           icon: "SiSass",           color: "#cc6699",  library: "si" },
  { name: "React",          icon: "SiReact",          color: "#61dafb",  library: "si" },
  { name: "Next.js",        icon: "SiNextdotjs",      color: "#000000",  library: "si" },
  { name: "Vite",           icon: "SiVite",           color: "#646cff",  library: "si" },
  { name: "Vue",            icon: "SiVuedotjs",       color: "#42b883",  library: "si" },
  { name: "Nuxt",           icon: "SiNuxtdotjs",      color: "#00dc82",  library: "si" },
  { name: "Angular",        icon: "SiAngular",        color: "#dd0031",  library: "si" },
  { name: "Svelte",         icon: "SiSvelte",         color: "#ff3e00",  library: "si" },
  { name: "Astro",          icon: "SiAstro",          color: "#ff5d01",  library: "si" },
  { name: "Node.js",        icon: "SiNodedotjs",      color: "#339933",  library: "si" },
  { name: "Express",        icon: "SiExpress",        color: "#000000",  library: "si" },
  { name: "PHP",            icon: "SiPhp",            color: "#777bb4",  library: "si" },
  { name: "Laravel",        icon: "SiLaravel",        color: "#ff2d20",  library: "si" },
  { name: "CodeIgniter",    icon: "SiCodeigniter",    color: "#ef4223",  library: "si" },
  { name: "Python",         icon: "SiPython",         color: "#3776ab",  library: "si" },
  { name: "Django",         icon: "SiDjango",         color: "#092e20",  library: "si" },
  { name: "Go",             icon: "SiGo",             color: "#00add8",  library: "si" },
  { name: "Rust",           icon: "SiRust",           color: "#000000",  library: "si" },
  { name: "Java",           icon: "SiJava",           color: "#007396",  library: "si" },
  { name: "Kotlin",         icon: "SiKotlin",         color: "#7f52ff",  library: "si" },
  { name: "Swift",          icon: "SiSwift",          color: "#f05138",  library: "si" },
  { name: "MySQL",          icon: "SiMysql",          color: "#4479a1",  library: "si" },
  { name: "PostgreSQL",     icon: "SiPostgresql",     color: "#336791",  library: "si" },
  { name: "MongoDB",        icon: "SiMongodb",        color: "#47a248",  library: "si" },
  { name: "Redis",          icon: "SiRedis",          color: "#dc382d",  library: "si" },
  { name: "Supabase",       icon: "SiSupabase",       color: "#3ecf8e",  library: "si" },
  { name: "Firebase",       icon: "SiFirebase",       color: "#ffca28",  library: "si" },
  { name: "Prisma",         icon: "SiPrisma",         color: "#2d3748",  library: "si" },
  { name: "GraphQL",        icon: "SiGraphql",        color: "#e10098",  library: "si" },
  { name: "Docker",         icon: "SiDocker",         color: "#2496ed",  library: "si" },
  { name: "Kubernetes",     icon: "SiKubernetes",     color: "#326ce5",  library: "si" },
  { name: "AWS",            icon: "SiAmazonaws",      color: "#ff9900",  library: "si" },
  { name: "Vercel",         icon: "SiVercel",         color: "#000000",  library: "si" },
  { name: "Netlify",        icon: "SiNetlify",        color: "#00c7b7",  library: "si" },
  { name: "Git",            icon: "SiGit",            color: "#f05032",  library: "si" },
  { name: "GitHub",         icon: "SiGithub",         color: "#181717",  library: "si" },
  { name: "GitLab",         icon: "SiGitlab",         color: "#fc6d26",  library: "si" },
  { name: "Figma",          icon: "SiFigma",          color: "#f24e1e",  library: "si" },
  { name: "Linux",          icon: "SiLinux",          color: "#fcc624",  library: "si" },
  { name: "Nginx",          icon: "SiNginx",          color: "#009639",  library: "si" },
  { name: "WordPress",      icon: "SiWordpress",      color: "#21759b",  library: "si" },
  { name: "Microsoft Word", icon: "FileText",         color: "#2b579a",  library: "lucide" },
  { name: "Microsoft Excel",icon: "Table",            color: "#217346",  library: "lucide" },
  { name: "Mesin Laser",    icon: "Zap",              color: "#ef4444",  library: "lucide" },
  { name: "Mesin CNC",      icon: "Settings",         color: "#6b7280",  library: "lucide" },
];

import * as LucideIcons from "lucide-react";

function TechIcon({ name, color, size = 22, library = "si" }: { name: string; color: string; size?: number; library?: "si" | "lucide" }) {
  if (library === "lucide") {
    const Icon = (LucideIcons as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
    if (!Icon) return null;
    return <Icon size={size} color={color} />;
  }
  const Icon = (Si as unknown as Record<string, React.ComponentType<{ size?: number; color?: string }>>)[name];
  if (!Icon) return null;
  return <Icon size={size} color={color} />;
}

function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? (
        <>
          <Loader2 size={14} className="animate-spin" />
          <span>Menyimpan & Menerjemahkan...</span>
        </>
      ) : (
        <>
          <Languages size={14} />
          <span>Simpan & Auto-Translate</span>
        </>
      )}
    </button>
  );
}

function Alert({ state }: { state: ActionState }) {
  if (!state.error && !state.success) return null;
  return (
    <div className="space-y-2">
      <div
        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm ${
          state.success
            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800"
            : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800"
        }`}
      >
        {state.success ? <Check size={15} /> : <AlertCircle size={15} />}
        {state.success ? "Perubahan berhasil disimpan." : state.error}
      </div>
      {state.success && state.translated && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
          <Globe size={15} />
          <span>
            Konten Bahasa Indonesia terdeteksi — versi English otomatis dibuat dan disimpan.
          </span>
        </div>
      )}
    </div>
  );
}

const inputCls =
  "w-full px-4 py-2.5 rounded-xl text-sm border outline-none transition-colors bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white placeholder:text-gray-400 border-gray-200 dark:border-slate-700 focus:ring-2 focus:ring-violet-500 focus:border-transparent";

const labelCls = "block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5";

const fetcher = (url: string) => axios.get(url).then((r) => r.data);

// ── Language Detector (client-side preview) ───────────────────────────────────
const ID_WORDS = [
  "saya", "aku", "kamu", "anda", "adalah", "dan", "atau", "yang", "dengan",
  "untuk", "dari", "pada", "dalam", "tidak", "bukan", "sudah", "belum",
  "sedang", "akan", "bisa", "dapat", "juga", "sudah", "telah", "serta",
  "namun", "tetapi", "jika", "ketika", "karena", "sehingga", "selain",
  "berbagai", "banyak", "beberapa", "sangat", "lebih", "semua",
  "ini", "itu", "tersebut", "antara", "hingga", "setiap", "baik",
  "berdomisili", "berminat", "berpengalaman", "membangun", "mengembangkan",
  "berkolaborasi", "menyukai", "memiliki", "seorang",
];

function detectIndonesian(text: string): boolean {
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const matches = words.filter((w) => ID_WORDS.includes(w));
  return matches.length / words.length > 0.08;
}

// ── Bilingual Preview Panel ───────────────────────────────────────────────────
function BilingualPreview({ profile }: { profile: Profile }) {
  const [activeTab, setActiveTab] = useState<"id" | "en">("id");

  // Supabase JSONB kolom bisa datang sebagai object atau string tergantung client
  function parseJsonField(field: unknown, fallback: ProfileContent): ProfileContent {
    if (!field) return fallback;
    if (typeof field === "string") {
      try { return JSON.parse(field) as ProfileContent; } catch { return fallback; }
    }
    if (typeof field === "object") return field as ProfileContent;
    return fallback;
  }

  const fallbackContent: ProfileContent = {
    name: profile.name,
    location: profile.location,
    work_type: profile.work_type,
    bio_1: profile.bio_1,
    bio_2: profile.bio_2,
  };

  const contentId = parseJsonField(profile.content_id, fallbackContent);
  const contentEn = parseJsonField(profile.content_en, contentId);

  const hasTranslation = !!profile.content_en && JSON.stringify(contentEn) !== JSON.stringify(contentId);
  const current = activeTab === "id" ? contentId : contentEn;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 dark:text-white">Preview Konten Bilingual</h2>
          <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5">
            Lihat bagaimana konten tampil dalam masing-masing bahasa.
          </p>
        </div>
        {!hasTranslation && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 font-medium">
            Belum ada terjemahan
          </span>
        )}
        {hasTranslation && (
          <span className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium">
            <Globe size={12} /> Bilingual aktif
          </span>
        )}
      </div>

      {/* Tab */}
      <div className="flex gap-1 p-1 bg-gray-100 dark:bg-slate-800 rounded-xl mb-4 w-fit">
        {(["id", "en"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab
                ? "bg-white dark:bg-slate-700 text-gray-900 dark:text-white shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700"
            }`}
          >
            {tab === "id" ? "🇮🇩 Indonesia" : "🇺🇸 English"}
          </button>
        ))}
      </div>

      {/* Content preview */}
      <div className="space-y-3 p-4 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-gray-100 dark:border-slate-700">
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Nama</p>
          <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{current.name || "—"}</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Lokasi</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{current.location || "—"}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Tipe Kerja</p>
            <p className="text-sm text-gray-700 dark:text-gray-300">{current.work_type || "—"}</p>
          </div>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Bio 1</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{current.bio_1 || "—"}</p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-widest text-gray-400 mb-0.5">Bio 2</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{current.bio_2 || "—"}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomeAdminClient({ profile }: { profile: Profile }) {
  const { data: skills = [], mutate } = useSWR<Skill[]>("/api/skills", fetcher);

  const [profileState, profileAction] = useActionState(updateProfileAction, {});
  const [skillName, setSkillName] = useState("");
  const [sortOrder, setSortOrder] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState(TECH_ICONS[0]);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // Live language detection from textarea
  const [bio1Val, setBio1Val] = useState(profile.bio_1);
  const [bio2Val, setBio2Val] = useState(profile.bio_2);
  const [workTypeVal, setWorkTypeVal] = useState(profile.work_type);
  const detectedLang = detectIndonesian(`${bio1Val} ${bio2Val} ${workTypeVal}`) ? "id" : "en";

  const handleIconSelect = (tech: typeof TECH_ICONS[0]) => {
    setSelectedIcon(tech);
    setSkillName(tech.name);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!skillName.trim()) return;
    setAdding(true);
    setAddError("");
    try {
      const newSkill = {
        name: skillName,
        icon_name: selectedIcon.icon,
        color: selectedIcon.color,
        sort_order: sortOrder,
        is_active: true,
      };
      await axios.post("/api/skills", newSkill);
      await mutate();
      setSkillName("");
      setSortOrder(skills.length + 1);
      setSelectedIcon(TECH_ICONS[0]);
    } catch {
      setAddError("Gagal menambah skill.");
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus skill ini?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/skills/${id}`);
      await mutate();
    } catch {
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    setTogglingId(id);
    try {
      await axios.patch(`/api/skills/${id}`, { is_active: !current });
      await mutate();
    } catch {
    } finally {
      setTogglingId(null);
    }
  };

  const filteredIcons = skillName.trim()
    ? TECH_ICONS.filter((t) => t.name.toLowerCase().includes(skillName.toLowerCase()))
    : [];

  return (
    <div className="space-y-8">
      {/* ── Form Profil ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Profil & Konten</h2>
            <p className="text-xs text-gray-400 dark:text-slate-500">Teks yang muncul di halaman utama.</p>
          </div>
          {/* Live language detection badge */}
          <div
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              detectedLang === "id"
                ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400"
            }`}
          >
            <Globe size={12} />
            {detectedLang === "id" ? "🇮🇩 Terdeteksi: Bahasa Indonesia → akan di-translate ke EN" : "🇺🇸 Terdeteksi: English"}
          </div>
        </div>

        <form action={profileAction} className="space-y-4">
          <Alert state={profileState} />

          {/* Info box */}
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 text-xs text-violet-700 dark:text-violet-400">
            <Languages size={14} className="mt-0.5 shrink-0" />
            <span>
              Tulis konten dalam <strong>Bahasa Indonesia</strong>. Saat disimpan, sistem akan otomatis membuat versi <strong>English</strong>-nya menggunakan AI, sehingga pengunjung dapat memilih bahasa di portfolio Anda.
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Nama</label>
              <input name="name" defaultValue={profile.name} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Lokasi</label>
              <input name="location" defaultValue={profile.location} className={inputCls} required />
            </div>
            <div>
              <label className={labelCls}>Tipe Kerja</label>
              <input
                name="work_type"
                value={workTypeVal}
                onChange={(e) => setWorkTypeVal(e.target.value)}
                className={inputCls}
                required
              />
            </div>
          </div>
          <div>
            <label className={labelCls}>Bio Paragraf 1</label>
            <textarea
              name="bio_1"
              value={bio1Val}
              onChange={(e) => setBio1Val(e.target.value)}
              rows={4}
              className={inputCls}
              required
            />
          </div>
          <div>
            <label className={labelCls}>Bio Paragraf 2</label>
            <textarea
              name="bio_2"
              value={bio2Val}
              onChange={(e) => setBio2Val(e.target.value)}
              rows={4}
              className={inputCls}
              required
            />
          </div>

          <div className="flex justify-end pt-2">
            <SaveButton />
          </div>
        </form>
      </div>

      {/* ── Preview Bilingual ── */}
      <BilingualPreview profile={profile} />

      {/* ── Skills ── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-gray-100 dark:border-slate-800 p-6">
        <h2 className="text-base font-bold text-gray-900 dark:text-white mb-1">Keahlian</h2>
        <p className="text-xs text-gray-400 dark:text-slate-500 mb-6">Skill yang tampil di halaman utama.</p>

        <div className="space-y-2 mb-6">
          {skills.length === 0 && (
            <p className="text-sm text-gray-400 dark:text-slate-600 py-4 text-center">Belum ada skill.</p>
          )}
          {skills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-700"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: skill.color + "20" }}
              >
                <TechIcon name={skill.icon_name} color={skill.color} library={TECH_ICONS.find(t => t.icon === skill.icon_name)?.library ?? "si"} />
              </div>
              <span className="text-sm font-medium text-gray-800 dark:text-gray-200 flex-1">{skill.name}</span>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${
                    skill.is_active
                      ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                      : "bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500"
                  }`}
                >
                  {skill.is_active ? "Aktif" : "Nonaktif"}
                </span>
                <button
                  onClick={() => handleToggle(skill.id, skill.is_active)}
                  disabled={togglingId === skill.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors disabled:opacity-50"
                >
                  {togglingId === skill.id
                    ? <Loader2 size={15} className="animate-spin" />
                    : skill.is_active ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
                <button
                  onClick={() => handleDelete(skill.id)}
                  disabled={deletingId === skill.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                >
                  {deletingId === skill.id
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Trash2 size={15} />}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-100 dark:border-slate-800 pt-5">
          <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-4">Tambah Skill Baru</p>
          <form onSubmit={handleAdd} className="space-y-4">
            {addError && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm bg-red-50 dark:bg-red-900/20 text-red-600 border border-red-200 dark:border-red-800">
                <AlertCircle size={15} /> {addError}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>Nama Skill</label>
                <input
                  value={skillName}
                  onChange={(e) => {
                    setSkillName(e.target.value);
                    const match = TECH_ICONS.find((t) =>
                      t.name.toLowerCase().includes(e.target.value.toLowerCase())
                    );
                    if (match) setSelectedIcon(match);
                  }}
                  placeholder="Ketik nama teknologi..."
                  className={inputCls}
                  required
                />
              </div>
              <div>
                <label className={labelCls}>Urutan</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={(e) => setSortOrder(Number(e.target.value))}
                  className={inputCls}
                  required
                />
              </div>
            </div>

            {filteredIcons.length > 0 && (
              <div>
                <label className={labelCls}>Pilih Icon</label>
                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                  {filteredIcons.map((tech) => {
                    const isSelected = selectedIcon.icon === tech.icon;
                    return (
                      <button
                        key={tech.icon}
                        type="button"
                        onClick={() => handleIconSelect(tech)}
                        title={tech.name}
                        className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all text-sm font-medium ${
                          isSelected ? "ring-2 ring-violet-500" : "hover:opacity-80"
                        }`}
                        style={{ backgroundColor: tech.color + "20" }}
                      >
                        <TechIcon name={tech.icon} color={tech.color} size={18} library={tech.library} />
                        <span style={{ color: tech.color }}>{tech.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {skillName.trim() && (
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: selectedIcon.color + "20" }}
                >
                  <TechIcon name={selectedIcon.icon} color={selectedIcon.color} size={20} library={selectedIcon.library} />
                </div>
                <div>
                  <p className="text-[11px] text-gray-400 dark:text-slate-500">Icon terpilih</p>
                  <p className="text-sm font-semibold text-gray-800 dark:text-white">{selectedIcon.name}</p>
                </div>
              </div>
            )}

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={adding}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 disabled:opacity-60 transition-colors"
              >
                {adding ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
                {adding ? "Menambah..." : "Tambah Skill"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}