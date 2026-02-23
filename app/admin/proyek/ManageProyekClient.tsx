"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Save, Trash2, Pencil, X, Loader2, CheckCircle2,
  Upload, ImageIcon, FolderOpen, Languages, ExternalLink,
  Github, GripVertical, Eye, EyeOff, Search, Calendar,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Proyek = {
  id?: string;
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
  sort_order: number;
  is_active: boolean;
};

// ── Constants ─────────────────────────────────────────────────────────────────
// Import icons dari shared file
import { TechIcons } from "@/app/components/proyek/TechIcons";

const TECH_OPTIONS = [
  // Web Basics
  "HTML", "CSS", "JavaScript", "TypeScript",
  // Frameworks
  "React", "Next.js", "Vue", "Nuxt", "Svelte", "Angular", "Astro",
  // CSS Frameworks
  "Tailwind CSS", "Bootstrap", "Sass",
  // Backend
  "PHP", "Laravel", "CodeIgniter", "Node.js", "Express", "Python", "Django", "FastAPI",
  // Database
  "MySQL", "PostgreSQL", "MongoDB", "Supabase", "Firebase", "Redis",
  // DevOps & Cloud
  "Docker", "AWS", "Vercel",
  // Tools
  "Figma", "WordPress", "React Native", "Git",
];

const CATEGORY_OPTIONS = [
  "Company Profile", "Landing Page", "E-Commerce", "Web Application",
  "Mobile App", "API / Backend", "Dashboard", "Portfolio", "Other", "Bot Whatsapp",
];

const ID_WORDS = [
  "saya","aku","adalah","dan","atau","yang","dengan","untuk","dari","pada",
  "dalam","tidak","sudah","akan","bisa","juga","telah","serta","namun",
  "karena","berbagai","sangat","lebih","semua","ini","itu","sebuah","suatu",
  "dibangun","dirancang","dikembangkan","menampilkan","memiliki","memungkinkan",
  "platform","aplikasi","website","sistem","fitur","halaman","pengguna",
  "kumpulan","karya","proyek","layanan","berbasis","terintegrasi",
];

function detectIndonesian(text: string): boolean {
  if (!text?.trim()) return false;
  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter((w) => ID_WORDS.includes(w));
  return matches.length / words.length > 0.06;
}

const emptyForm = (): Proyek => ({
  image_url: "", title_id: "", title_en: "", description_id: "", description_en: "",
  long_desc_id: "", long_desc_en: "", techs: [], category: "Web Application",
  year: new Date().getFullYear().toString(), live_url: "", github_url: "",
  sort_order: 0, is_active: true, github_private: false,
});

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, ok }: { message: string; ok: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }} exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-100 flex items-center gap-2.5 px-4 py-3 rounded-xl shadow-xl text-sm font-semibold max-w-sm ${ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}
    >
      <CheckCircle2 size={16} className="shrink-0" />
      {message}
    </motion.div>
  );
}

// ── Language Badge ────────────────────────────────────────────────────────────
function LangBadge({ text }: { text: string }) {
  if (!text.trim()) return null;
  const isId = detectIndonesian(text);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${isId ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"}`}>
      {isId ? "🇮🇩 Indonesia" : "🇺🇸 English"}
    </span>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, textarea = false, rows = 3, hint, badge }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; rows?: number; hint?: string; badge?: React.ReactNode;
}) {
  const cls = "w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 transition-colors";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">{label}</label>
        {badge}
      </div>
      {textarea
        ? <textarea rows={rows} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-y`} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
      {hint && <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

function SelectField({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void; options: string[];
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 transition-colors">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

// ── Tech Selector ─────────────────────────────────────────────────────────────
function TechSelector({ selected, onChange }: { selected: string[]; onChange: (v: string[]) => void }) {
  const toggle = (tech: string) => {
    onChange(selected.includes(tech) ? selected.filter((t) => t !== tech) : [...selected, tech]);
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
        Tech Stack <span className="text-gray-400">({selected.length} dipilih)</span>
      </label>
      <div className="flex flex-wrap gap-1.5 p-3 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 max-h-40 overflow-y-auto">
        {TECH_OPTIONS.map((tech) => (
          <button key={tech} type="button" onClick={() => toggle(tech)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all duration-150 ${selected.includes(tech)
              ? "bg-violet-600 border-violet-600 text-white"
              : "bg-gray-50 dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-600 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600"
            }`}>
            {tech}
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {selected.map((t) => (
            <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 text-violet-600 dark:text-violet-400 text-[11px] font-medium">
              {t}
              <button onClick={() => toggle(t)} className="hover:text-red-500 transition-colors"><X size={10} /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Image Upload ──────────────────────────────────────────────────────────────
function ImageUpload({ value, onChange }: { value: string; onChange: (url: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await axios.post<{ url?: string; error?: string }>(
        "/api/admin/proyek/upload", formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.url) onChange(res.data.url);
      else setError(res.data.error ?? "Upload gagal.");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Gagal upload gambar.");
    } finally {
      setUploading(false);
    }
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0]; if (f) handleFile(f);
  }, []);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">Screenshot Proyek</label>
      <div
        onDrop={onDrop} onDragOver={(e) => { e.preventDefault(); setDragOver(true); }} onDragLeave={() => setDragOver(false)}
        className={`relative rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${dragOver ? "border-violet-400 bg-violet-50 dark:bg-violet-900/10" : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900"}`}
      >
        {value ? (
          <div className="relative w-full aspect-video">
            <Image src={value} alt="Preview" fill className="object-contain p-2" unoptimized />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg text-xs font-semibold text-gray-800 dark:text-white shadow-sm">
                Ganti Screenshot
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-slate-800 flex items-center justify-center mb-3">
              {uploading ? <Loader2 size={24} className="animate-spin text-violet-500" /> : <ImageIcon size={24} className="text-gray-300 dark:text-slate-600" />}
            </div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-0.5">
              {uploading ? "Mengupload..." : "Drag & drop atau klik untuk upload"}
            </p>
            <p className="text-xs text-gray-400 dark:text-slate-500">JPG, PNG, WebP · maks 5 MB · Rasio 16:9 ideal</p>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 disabled:opacity-50 transition-colors">
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {value ? "Ganti gambar" : "Pilih file"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <X size={12} /> Hapus
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ── Proyek Form ───────────────────────────────────────────────────────────────
function ProyekForm({
  initial, onSave, onCancel,
}: {
  initial?: Proyek;
  onSave: (data: Proyek) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Proyek>(initial ?? emptyForm());
  const [saving, setSaving] = useState(false);
  const set = (key: keyof Proyek, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const sample = [form.title_id, form.description_id].filter(Boolean).join(" ");
  const isIndonesian = detectIndonesian(sample);
  const hasContent = !!sample.trim();

  const handleSubmit = async () => {
    if (!form.title_id.trim()) return;
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className="rounded-2xl border border-violet-200 dark:border-violet-800/60 bg-violet-50/40 dark:bg-slate-800 p-6 space-y-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">
          {initial?.id ? "Edit Proyek" : "Tambah Proyek Baru"}
        </h3>
        {hasContent && isIndonesian && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full">
            <Languages size={11} /> Auto-translate aktif
          </span>
        )}
      </div>

      {/* Screenshot */}
      <ImageUpload value={form.image_url} onChange={(url) => set("image_url", url)} />

      {/* Judul */}
      <Field
        label="Judul Proyek"
        value={form.title_id}
        onChange={(v) => set("title_id", v)}
        placeholder="Company Profile Dawu"
        badge={<LangBadge text={form.title_id} />}
      />

      {/* Deskripsi singkat */}
      <Field
        label="Deskripsi Singkat (tampil di card)"
        value={form.description_id}
        onChange={(v) => set("description_id", v)}
        placeholder="Website company profile modern untuk bisnis..."
        textarea rows={2}
        badge={<LangBadge text={form.description_id} />}
      />

      {/* Deskripsi panjang */}
      <Field
        label="Deskripsi Lengkap (tampil di modal)"
        value={form.long_desc_id}
        onChange={(v) => set("long_desc_id", v)}
        placeholder="Penjelasan lengkap mengenai proyek, arsitektur, fitur utama, tantangan..."
        textarea rows={5}
        badge={<LangBadge text={form.long_desc_id} />}
      />

      {/* Auto-translate indicator */}
      <AnimatePresence>
        {isIndonesian && hasContent && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <Languages size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Bahasa Indonesia terdeteksi</p>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-500 mt-0.5">
                <em>title_en</em>, <em>description_en</em>, dan <em>long_desc_en</em> akan otomatis dibuat via MyMemory API saat disimpan.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tech + Category + Year */}
      <TechSelector selected={form.techs} onChange={(v) => set("techs", v)} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <SelectField label="Kategori" value={form.category} onChange={(v) => set("category", v)} options={CATEGORY_OPTIONS} />
        <Field label="Tahun" value={form.year} onChange={(v) => set("year", v)} placeholder="2024" />
      </div>

      {/* URLs */}
      <div className="space-y-4">
        <Field label="Live URL (opsional)" value={form.live_url} onChange={(v) => set("live_url", v)} placeholder="https://example.com" />

        {/* GitHub: toggle private / public */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">Repository GitHub</label>
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <span className="text-xs text-gray-500 dark:text-slate-400">Private</span>
              <div
                onClick={() => set("github_private", !form.github_private)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer ${form.github_private ? "bg-slate-600 dark:bg-slate-500" : "bg-gray-200 dark:bg-slate-700"}`}
              >
                <motion.div
                  className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm"
                  animate={{ x: form.github_private ? 16 : 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              </div>
            </label>
          </div>

          <AnimatePresence>
            {form.github_private ? (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-500 dark:text-slate-400">
                  <Github size={13} className="shrink-0" />
                  Repository private — link tidak ditampilkan ke publik
                </div>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden">
                <input
                  type="text"
                  value={form.github_url}
                  onChange={(e) => set("github_url", e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 transition-colors"
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Sort order */}
      <Field label="Urutan Tampil" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v) || 0)} placeholder="0" hint="Angka kecil = tampil lebih dahulu" />

      {/* Active */}
      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)}
          className="accent-violet-600 w-4 h-4 rounded" />
        Aktif — tampil di halaman publik
      </label>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={handleSubmit} disabled={saving || !form.title_id.trim()}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving
            ? (isIndonesian ? "Menyimpan & Menerjemahkan..." : "Menyimpan...")
            : (isIndonesian ? "Simpan & Auto-Translate" : "Simpan")}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
          <X size={14} /> Batal
        </button>
      </div>
    </motion.div>
  );
}

// ── Item Row ──────────────────────────────────────────────────────────────────
function ItemRow({
  item, onEdit, onDelete, onToggle, deleting,
}: {
  item: Proyek; onEdit: () => void; onDelete: () => void; onToggle: () => void; deleting: boolean;
}) {
  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white dark:bg-slate-800 transition-all ${item.is_active ? "border-gray-100 dark:border-slate-700" : "border-dashed border-gray-200 dark:border-slate-700 opacity-60"}`}
    >
      <GripVertical size={15} className="text-gray-300 dark:text-slate-600 shrink-0 cursor-grab" />

      {/* Thumbnail */}
      <div className="shrink-0 w-16 h-10 rounded-lg border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.title_id} width={64} height={40} className="w-full h-full object-cover" unoptimized />
        ) : (
          <FolderOpen size={16} className="text-gray-300 dark:text-slate-600" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.title_id || "(tanpa judul)"}</p>
          {item.title_en && item.title_en !== item.title_id && (
            <span className="text-[10px] text-blue-400 dark:text-blue-500 font-medium shrink-0">EN ✓</span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-slate-500 flex-wrap">
          <span className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-slate-700 text-[10px] font-medium">{item.category}</span>
          <span className="flex items-center gap-0.5"><Calendar size={9} /> {item.year}</span>
          {item.techs.length > 0 && <span>{item.techs.slice(0, 3).join(", ")}{item.techs.length > 3 ? ` +${item.techs.length - 3}` : ""}</span>}
          {item.github_private && (
            <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-[10px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Github size={8} /> private
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 shrink-0">
        {item.live_url && (
          <a href={item.live_url} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
            <ExternalLink size={14} />
          </a>
        )}
        {item.github_url && !item.github_private && (
          <a href={item.github_url} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
            <Github size={14} />
          </a>
        )}
        {item.github_private && (
          <span title="Private repository" className="p-2 rounded-lg text-slate-400 dark:text-slate-600 cursor-default">
            <Github size={14} />
          </span>
        )}
        <button onClick={onToggle} title={item.is_active ? "Nonaktifkan" : "Aktifkan"}
          className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
          {item.is_active ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={onEdit}
          className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
          <Pencil size={14} />
        </button>
        <button onClick={onDelete} disabled={deleting}
          className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40">
          {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
        </button>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════
export default function ManageProyekClient({ initial }: { initial: Proyek[] }) {
  const [list, setList] = useState<Proyek[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Proyek | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = list.filter((item) => {
    const q = search.toLowerCase();
    return !q || item.title_id.toLowerCase().includes(q) || item.category.toLowerCase().includes(q) || item.techs.some((t) => t.toLowerCase().includes(q));
  });

  // ADD
  const handleAdd = async (data: Proyek) => {
    try {
      const res = await axios.post<Proyek & { _translated?: boolean }>("/api/admin/proyek", data);
      const { _translated, ...item } = res.data;
      setList((p) => [...p, item]);
      setShowForm(false);
      showToast(_translated ? "Proyek ditambahkan & versi EN dibuat!" : "Proyek berhasil ditambahkan!", true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast(msg ?? "Gagal menambahkan proyek.", false);
    }
  };

  // EDIT
  const handleEdit = async (data: Proyek) => {
    const targetId = editItem!.id!;
    try {
      const res = await axios.put<Proyek & { _translated?: boolean }>(`/api/admin/proyek/${targetId}`, data);
      const { _translated, ...item } = res.data;
      setList((p) => p.map((x) => (x.id === targetId ? item : x)));
      setEditItem(null);
      showToast(_translated ? "Disimpan & versi EN diperbarui!" : "Proyek berhasil diperbarui!", true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast(msg ?? "Gagal memperbarui.", false);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus proyek ini?")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/admin/proyek/${id}`);
      setList((p) => p.filter((x) => x.id !== id));
      showToast("Proyek dihapus.", true);
    } catch {
      showToast("Gagal menghapus.", false);
    } finally {
      setDeleting(null);
    }
  };

  // TOGGLE active
  const handleToggle = async (item: Proyek) => {
    const id = item.id!;
    const updated = { ...item, is_active: !item.is_active };
    setList((p) => p.map((x) => (x.id === id ? updated : x)));
    try {
      await axios.put(`/api/admin/proyek/${id}`, updated);
    } catch {
      setList((p) => p.map((x) => (x.id === id ? item : x)));
      showToast("Gagal mengubah status.", false);
    }
  };

  const stats = {
    total: list.length,
    active: list.filter((x) => x.is_active).length,
    bilingual: list.filter((x) => x.title_en && x.title_en !== x.title_id).length,
    techCount: new Set(list.flatMap((x) => x.techs)).size,
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total Proyek", value: stats.total, color: "text-gray-900 dark:text-white" },
          { label: "Aktif", value: stats.active, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Bilingual", value: stats.bilingual, color: "text-violet-600 dark:text-violet-400" },
          { label: "Teknologi Berbeda", value: stats.techCount, color: "text-sky-600 dark:text-sky-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari proyek, kategori, atau tech..."
            className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
        </div>

        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors ml-auto whitespace-nowrap">
          <Plus size={15} /> Tambah Proyek
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && !editItem && (
          <ProyekForm key="add-form" onSave={handleAdd} onCancel={() => setShowForm(false)} />
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400 dark:text-slate-500">
            {list.length === 0 ? "Belum ada proyek. Klik \"Tambah Proyek\" untuk mulai." : "Tidak ada hasil untuk pencarian ini."}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filtered.map((item) => (
              <div key={item.id}>
                <ItemRow
                  item={item}
                  onEdit={() => { setEditItem(item); setShowForm(false); }}
                  onDelete={() => handleDelete(item.id!)}
                  onToggle={() => handleToggle(item)}
                  deleting={deleting === item.id}
                />
                <AnimatePresence>
                  {editItem?.id === item.id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2">
                      <ProyekForm
                        initial={editItem ?? undefined}
                        onSave={handleEdit}
                        onCancel={() => setEditItem(null)}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </AnimatePresence>
        )}
      </div>

      <AnimatePresence>
        {toast && <Toast message={toast.msg} ok={toast.ok} />}
      </AnimatePresence>
    </div>
  );
}