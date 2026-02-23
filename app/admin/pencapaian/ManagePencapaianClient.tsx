"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Save, Trash2, Pencil, X, Loader2, CheckCircle2,
  Upload, ImageIcon, Award, Languages, ExternalLink,
  GripVertical, Eye, EyeOff, Search,
} from "lucide-react";

// ── Types ─────────────────────────────────────────────────────────────────────
export type Pencapaian = {
  id?: string;
  image_url: string;
  name_id: string;
  name_en: string;
  issuer_id: string;
  issuer_en: string;
  date: string;
  type: string;
  category: string;
  credential_url: string;
  sort_order: number;
  is_active: boolean;
};

// ── Constants ─────────────────────────────────────────────────────────────────
const TYPE_OPTIONS = ["Pelatihan", "Sertifikasi", "Kompetisi", "Penghargaan"];
const CATEGORY_OPTIONS = [
  "Software Engineering", "Web Development", "Mobile Development",
  "UI/UX Design", "Data Science", "Cloud Computing", "API",
  "Cybersecurity", "DevOps", "Project Management", "Other",
];

const TYPE_COLORS: Record<string, { badge: string; bg: string; icon: string }> = {
  Kompetisi:   { badge: "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800",   bg: "from-amber-50 to-orange-100 dark:from-amber-900/20 dark:to-orange-900/20",   icon: "text-amber-500" },
  Sertifikasi: { badge: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800", bg: "from-emerald-50 to-teal-100 dark:from-emerald-900/20 dark:to-teal-900/20", icon: "text-emerald-500" },
  Penghargaan: { badge: "bg-yellow-50 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800",  bg: "from-yellow-50 to-amber-100 dark:from-yellow-900/20 dark:to-amber-900/20",  icon: "text-yellow-500" },
  Pelatihan:   { badge: "bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border-violet-200 dark:border-violet-800",  bg: "from-violet-50 to-indigo-100 dark:from-violet-900/20 dark:to-indigo-900/20",  icon: "text-violet-500" },
};

const ID_WORDS = [
  "saya", "aku", "adalah", "dan", "atau", "yang", "dengan", "untuk", "dari",
  "pada", "dalam", "tidak", "sudah", "akan", "bisa", "juga", "telah", "serta",
  "namun", "karena", "berbagai", "sangat", "lebih", "semua", "ini", "itu",
  "pelatihan", "sertifikasi", "penghargaan", "kompetisi", "internasional",
  "nasional", "juara", "peserta", "bidang", "tingkat", "program",
];

function detectIndonesian(text: string): boolean {
  if (!text?.trim()) return false;
  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter((w) => ID_WORDS.includes(w));
  return matches.length / words.length > 0.06;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const emptyForm = (): Pencapaian => ({
  image_url: "", name_id: "", name_en: "", issuer_id: "", issuer_en: "",
  date: "", type: "Pelatihan", category: "Software Engineering",
  credential_url: "", sort_order: 0, is_active: true,
});

// ── Sub-components ────────────────────────────────────────────────────────────

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

function LangBadge({ text }: { text: string }) {
  if (!text.trim()) return null;
  const isId = detectIndonesian(text);
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${isId ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"}`}>
      {isId ? "🇮🇩 Indonesia" : "🇺🇸 English"}
    </span>
  );
}

function Field({ label, value, onChange, placeholder, textarea = false, hint, badge }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; textarea?: boolean; hint?: string; badge?: React.ReactNode;
}) {
  const cls = "w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 transition-colors";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">{label}</label>
        {badge}
      </div>
      {textarea
        ? <textarea rows={3} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-y`} />
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
        "/api/admin/pencapaian/upload",
        formData,
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
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  }, []);

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">
        Gambar Sertifikat
      </label>

      <div
        onDrop={onDrop}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        className={`relative rounded-2xl border-2 border-dashed transition-colors overflow-hidden ${dragOver ? "border-violet-400 bg-violet-50 dark:bg-violet-900/10" : "border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900"}`}
      >
        {value ? (
          <div className="relative w-full aspect-video">
            <Image src={value} alt="Preview sertifikat" fill className="object-contain p-2" unoptimized />
            <div className="absolute inset-0 bg-black/0 hover:bg-black/20 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
              <button type="button" onClick={() => inputRef.current?.click()}
                className="px-3 py-1.5 bg-white/90 dark:bg-slate-800/90 rounded-lg text-xs font-semibold text-gray-800 dark:text-white shadow-sm">
                Ganti Gambar
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
            <p className="text-xs text-gray-400 dark:text-slate-500">JPG, PNG, WebP, SVG · maks 3 MB</p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-medium text-gray-600 dark:text-gray-300 hover:border-violet-400 hover:text-violet-600 dark:hover:text-violet-400 disabled:opacity-50 transition-colors">
          {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
          {value ? "Ganti gambar" : "Pilih file"}
        </button>
        {value && (
          <button type="button" onClick={() => onChange("")}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-200 dark:border-red-800 text-xs font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
            <X size={12} /> Hapus gambar
          </button>
        )}
      </div>
      {error && <p className="text-[11px] text-red-500 mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ── Form ──────────────────────────────────────────────────────────────────────
function PencapaianForm({
  initial, onSave, onCancel,
}: {
  initial?: Pencapaian;
  onSave: (data: Pencapaian) => Promise<void>;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Pencapaian>(initial ?? emptyForm());
  const [saving, setSaving] = useState(false);
  const set = (key: keyof Pencapaian, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const combinedText = [form.name_id, form.issuer_id].filter(Boolean).join(" ");
  const isIndonesian = detectIndonesian(combinedText);
  const hasContent = !!combinedText.trim();

  const handleSubmit = async () => {
    if (!form.name_id.trim()) return;
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
          {initial?.id ? "Edit Pencapaian" : "Tambah Pencapaian Baru"}
        </h3>
        {hasContent && isIndonesian && (
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-full">
            <Languages size={11} /> Auto-translate aktif
          </span>
        )}
      </div>

      {/* Image upload */}
      <ImageUpload value={form.image_url} onChange={(url) => set("image_url", url)} />

      {/* Nama & penerbit */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Nama Sertifikat / Penghargaan"
          value={form.name_id}
          onChange={(v) => set("name_id", v)}
          placeholder="Pelatihan Software Engineering"
          badge={<LangBadge text={form.name_id} />}
        />
        <Field
          label="Nama Penerbit / Penyelenggara"
          value={form.issuer_id}
          onChange={(v) => set("issuer_id", v)}
          placeholder="Kampus Merdeka"
          badge={<LangBadge text={form.issuer_id} />}
        />
      </div>

      {/* Type, Category, Date */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <SelectField label="Tipe" value={form.type} onChange={(v) => set("type", v)} options={TYPE_OPTIONS} />
        <SelectField label="Kategori" value={form.category} onChange={(v) => set("category", v)} options={CATEGORY_OPTIONS} />
        <Field label="Tanggal" value={form.date} onChange={(v) => set("date", v)} placeholder="29 Juli 2023" />
      </div>

      {/* Credential URL + sort + active */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field
          label="Credential URL (opsional)"
          value={form.credential_url}
          onChange={(v) => set("credential_url", v)}
          placeholder="https://credentials.example.com/..."
          hint="Link verifikasi sertifikat jika ada"
        />
        <Field
          label="Urutan Tampil"
          value={String(form.sort_order)}
          onChange={(v) => set("sort_order", Number(v) || 0)}
          placeholder="0"
          hint="Angka kecil = tampil lebih dahulu"
        />
      </div>

      {/* Info auto-translate */}
      <AnimatePresence>
        {isIndonesian && hasContent && (
          <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
            <Languages size={14} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Bahasa Indonesia terdeteksi</p>
              <p className="text-[11px] text-amber-600/80 dark:text-amber-500 mt-0.5">
                Versi English (<em>name_en</em>, <em>issuer_en</em>) akan otomatis dibuat via MyMemory API saat disimpan.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active toggle */}
      <label className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-300 cursor-pointer select-none">
        <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)}
          className="accent-violet-600 w-4 h-4 rounded" />
        Aktif — tampil di halaman publik
      </label>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-1">
        <button onClick={handleSubmit} disabled={saving || !form.name_id.trim()}
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

// ── Item Card (list row) ──────────────────────────────────────────────────────
function ItemRow({
  item, onEdit, onDelete, onToggle, deleting,
}: {
  item: Pencapaian;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  deleting: boolean;
}) {
  const colors = TYPE_COLORS[item.type] ?? TYPE_COLORS["Pelatihan"];

  return (
    <motion.div layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border bg-white dark:bg-slate-800 transition-all ${item.is_active ? "border-gray-100 dark:border-slate-700" : "border-dashed border-gray-200 dark:border-slate-700 opacity-60"}`}
    >
      {/* drag handle */}
      <GripVertical size={15} className="text-gray-300 dark:text-slate-600 shrink-0 cursor-grab" />

      {/* thumbnail */}
      <div className="shrink-0 w-11 h-11 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-900 overflow-hidden flex items-center justify-center">
        {item.image_url ? (
          <Image src={item.image_url} alt={item.name_id} width={44} height={44} className="w-full h-full object-cover" unoptimized />
        ) : (
          <div className={`w-full h-full flex items-center justify-center bg-linear-to-br ${colors.bg}`}>
            <Award size={18} className={colors.icon} />
          </div>
        )}
      </div>

      {/* info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5 flex-wrap">
          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide border ${colors.badge}`}>
            <Award size={8} /> {item.type}
          </span>
          <span className="text-[10px] text-gray-400 dark:text-slate-500">{item.category}</span>
        </div>
        <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.name_id || "(tanpa nama)"}</p>
        <p className="text-xs text-gray-400 dark:text-slate-500 truncate">
          {item.issuer_id && <span>{item.issuer_id}</span>}
          {item.issuer_id && item.date && <span className="mx-1">·</span>}
          {item.date && <span>{item.date}</span>}
          {item.name_en && <span className="ml-1.5 text-blue-400 dark:text-blue-500">· EN ✓</span>}
        </p>
      </div>

      {/* actions */}
      <div className="flex items-center gap-1 shrink-0">
        {item.credential_url && (
          <a href={item.credential_url} target="_blank" rel="noopener noreferrer"
            className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
            <ExternalLink size={14} />
          </a>
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
export default function ManagePencapaianClient({ initial }: { initial: Pencapaian[] }) {
  const [list, setList] = useState<Pencapaian[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Pencapaian | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Semua");

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  // filter
  const filtered = list.filter((item) => {
    const q = search.toLowerCase();
    const matchQ = !q || item.name_id.toLowerCase().includes(q) || item.issuer_id.toLowerCase().includes(q) || item.category.toLowerCase().includes(q);
    const matchT = filterType === "Semua" || item.type === filterType;
    return matchQ && matchT;
  });

  // ADD
  const handleAdd = async (data: Pencapaian) => {
    try {
      const res = await axios.post<Pencapaian & { _translated?: boolean }>("/api/admin/pencapaian", data);
      const { _translated, ...item } = res.data;
      setList((p) => [...p, item]);
      setShowForm(false);
      showToast(_translated ? "Pencapaian ditambahkan & versi EN dibuat!" : "Pencapaian berhasil ditambahkan!", true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast(msg ?? "Gagal menambahkan pencapaian.", false);
    }
  };

  // EDIT
  const handleEdit = async (data: Pencapaian) => {
    const targetId = editItem!.id!;
    try {
      const res = await axios.put<Pencapaian & { _translated?: boolean }>(`/api/admin/pencapaian/${targetId}`, data);
      const { _translated, ...item } = res.data;
      setList((p) => p.map((x) => (x.id === targetId ? item : x)));
      setEditItem(null);
      showToast(_translated ? "Disimpan & versi EN diperbarui!" : "Pencapaian berhasil diperbarui!", true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      showToast(msg ?? "Gagal memperbarui.", false);
    }
  };

  // DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus pencapaian ini?")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/admin/pencapaian/${id}`);
      setList((p) => p.filter((x) => x.id !== id));
      showToast("Pencapaian dihapus.", true);
    } catch {
      showToast("Gagal menghapus.", false);
    } finally {
      setDeleting(null);
    }
  };

  // TOGGLE active
  const handleToggle = async (item: Pencapaian) => {
    const id = item.id!;
    const updated = { ...item, is_active: !item.is_active };
    setList((p) => p.map((x) => (x.id === id ? updated : x)));
    try {
      await axios.put(`/api/admin/pencapaian/${id}`, updated);
    } catch {
      setList((p) => p.map((x) => (x.id === id ? item : x)));
      showToast("Gagal mengubah status.", false);
    }
  };

  const stats = {
    total: list.length,
    active: list.filter((x) => x.is_active).length,
    bilingual: list.filter((x) => x.name_en && x.name_en !== x.name_id).length,
    byType: TYPE_OPTIONS.reduce((acc, t) => ({ ...acc, [t]: list.filter((x) => x.type === t).length }), {} as Record<string, number>),
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Stats strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: stats.total, color: "text-gray-900 dark:text-white" },
          { label: "Aktif", value: stats.active, color: "text-emerald-600 dark:text-emerald-400" },
          { label: "Bilingual", value: stats.bilingual, color: "text-violet-600 dark:text-violet-400" },
          { label: "Terjemahan Pending", value: stats.total - stats.bilingual, color: "text-amber-600 dark:text-amber-400" },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-3">
            <p className="text-[11px] text-gray-400 dark:text-slate-500 mb-1">{s.label}</p>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500 pointer-events-none" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari pencapaian..."
            className="w-full pl-8 pr-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 transition-colors" />
          {search && <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"><X size={13} /></button>}
        </div>

        {/* Filter type */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {["Semua", ...TYPE_OPTIONS].map((t) => (
            <button key={t} onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${filterType === t ? "bg-violet-600 border-violet-600 text-white" : "bg-white dark:bg-slate-800 border-gray-200 dark:border-slate-700 text-gray-500 dark:text-gray-400 hover:border-violet-400 hover:text-violet-600"}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors ml-auto whitespace-nowrap">
          <Plus size={15} /> Tambah Pencapaian
        </button>
      </div>

      {/* Add form */}
      <AnimatePresence>
        {showForm && !editItem && (
          <PencapaianForm key="add-form" onSave={handleAdd} onCancel={() => setShowForm(false)} />
        )}
      </AnimatePresence>

      {/* List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-16 text-sm text-gray-400 dark:text-slate-500">
            {list.length === 0 ? "Belum ada pencapaian. Klik \"Tambah Pencapaian\" untuk mulai." : "Tidak ada hasil untuk filter ini."}
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
                      <PencapaianForm
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