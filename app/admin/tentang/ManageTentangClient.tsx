"use client";

import { useState, useRef } from "react";
import axios from "axios";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save, Plus, Trash2, Pencil, X, ChevronDown,
  CheckCircle2, Loader2, GraduationCap, Briefcase,
  User, Upload, ImageIcon, Languages,
} from "lucide-react";

// ── Types ────────────────────────────────────────────────────────────────────
type Profile = { id?: string; bio_1: string; bio_2: string; bio_3: string };

type Karier = {
  id?: string; logo_url: string; position: string; company: string;
  location: string; start_date: string; end_date: string;
  total_duration: string; work_type: string; work_mode: string;
  tasks: string[]; learnings: string[]; impacts: string[];
  sort_order: number; is_active: boolean;
};

type Pendidikan = {
  id?: string; logo_url: string; school: string; major: string;
  location: string; start_date: string; end_date: string;
  highlights: string[]; sort_order: number; is_active: boolean;
};

// ── Helpers ──────────────────────────────────────────────────────────────────
const arrayToText = (arr: string[]) => arr.join("\n");
const textToArray = (text: string) => text.split("\n").map(s => s.trim()).filter(Boolean);

const ID_WORDS = [
  "saya", "aku", "kamu", "anda", "adalah", "dan", "atau", "yang", "dengan",
  "untuk", "dari", "pada", "dalam", "tidak", "bukan", "sudah", "belum",
  "sedang", "akan", "bisa", "dapat", "juga", "telah", "serta",
  "namun", "tetapi", "jika", "ketika", "karena", "sehingga", "selain",
  "berbagai", "banyak", "beberapa", "sangat", "lebih", "semua",
  "ini", "itu", "tersebut", "antara", "hingga", "setiap", "baik",
  "berdomisili", "berminat", "berpengalaman", "membangun", "mengembangkan",
  "berkolaborasi", "menyukai", "memiliki", "seorang",
];

function detectIndonesian(text: string): boolean {
  if (!text?.trim()) return false;
  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter((w) => ID_WORDS.includes(w));
  return matches.length / words.length > 0.08;
}

function LangBadge({ text }: { text: string }) {
  const isId = detectIndonesian(text);
  if (!text.trim()) return null;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${isId ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800" : "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800"}`}>
      {isId ? "🇮🇩 Indonesia" : "🇺🇸 English"}
    </span>
  );
}

// ── Logo Upload ───────────────────────────────────────────────────────────────
function LogoUpload({ value, onChange, folder }: {
  value: string;
  onChange: (url: string) => void;
  folder: "karier" | "pendidikan";
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const res = await axios.post<{ url?: string; error?: string }>(
        "/api/admin/tentang/upload-logo",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (res.data.url) { onChange(res.data.url); }
      else { setError(res.data.error ?? "Gagal upload."); }
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg ?? "Gagal upload logo.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">Logo</label>
      <div onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }} onDragOver={(e) => e.preventDefault()} className="flex items-center gap-3">
        <div className="shrink-0 w-14 h-14 rounded-xl border-2 border-dashed border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-900 flex items-center justify-center overflow-hidden">
          {value ? <Image src={value} alt="Logo preview" width={56} height={56} className="w-full h-full object-contain p-1" unoptimized /> : <ImageIcon size={20} className="text-gray-300 dark:text-slate-600" />}
        </div>
        <div className="flex-1">
          <button type="button" onClick={() => inputRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm text-gray-600 dark:text-gray-300 hover:border-violet-400 dark:hover:border-violet-500 hover:text-violet-600 dark:hover:text-violet-400 transition-colors disabled:opacity-60 w-full">
            {uploading ? <Loader2 size={14} className="animate-spin shrink-0" /> : <Upload size={14} className="shrink-0" />}
            <span className="truncate">{uploading ? "Mengupload..." : value ? "Ganti logo" : "Upload logo"}</span>
          </button>
          <p className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 pl-0.5">PNG, JPG, SVG, WebP · maks 2 MB · bisa drag & drop</p>
          {error && <p className="text-[11px] text-red-500 mt-1 pl-0.5">{error}</p>}
        </div>
      </div>
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); e.target.value = ""; }} />
    </div>
  );
}

// ── Tab button ────────────────────────────────────────────────────────────────
type Tab = "bio" | "karier" | "pendidikan";
function TabButton({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${active ? "bg-violet-600 text-white shadow-sm" : "text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"}`}>
      {icon}{label}
    </button>
  );
}

// ── Toast ─────────────────────────────────────────────────────────────────────
function Toast({ message, ok }: { message: string; ok: boolean }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg text-sm font-medium ${ok ? "bg-emerald-500 text-white" : "bg-red-500 text-white"}`}>
      <CheckCircle2 size={16} />{message}
    </motion.div>
  );
}

// ── Card ──────────────────────────────────────────────────────────────────────
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 p-6">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">{title}</h3>
      {children}
    </div>
  );
}

// ── ArrayField ────────────────────────────────────────────────────────────────
function ArrayField({ label, value, onChange, placeholder }: { label: string; value: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const text = arrayToText(value);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">
          {label}<span className="ml-1 text-gray-400 dark:text-slate-500 font-normal">(satu baris = satu item)</span>
        </label>
        <LangBadge text={text} />
      </div>
      <textarea rows={4} value={text} onChange={(e) => onChange(textToArray(e.target.value))} placeholder={placeholder}
        className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 resize-y transition-colors"
      />
    </div>
  );
}

// ── Field ─────────────────────────────────────────────────────────────────────
function Field({ label, value, onChange, placeholder, textarea = false }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; textarea?: boolean }) {
  const cls = "w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 transition-colors";
  return (
    <div>
      <label className="block text-xs font-medium text-gray-600 dark:text-gray-300 mb-1.5">{label}</label>
      {textarea
        ? <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={`${cls} resize-y`} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
    </div>
  );
}

// ── BioField (with lang badge) ────────────────────────────────────────────────
function BioField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  const cls = "w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:focus:ring-violet-500 transition-colors resize-y";
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-xs font-medium text-gray-600 dark:text-gray-300">{label}</label>
        <LangBadge text={value} />
      </div>
      <textarea rows={4} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// BIO TAB
// ════════════════════════════════════════════════════════════════════════════
function BioTab({ initial, onToast }: { initial: Profile | null; onToast: (msg: string, ok: boolean) => void }) {
  const [form, setForm] = useState<Profile>(initial ?? { bio_1: "", bio_2: "", bio_3: "" });
  const [saving, setSaving] = useState(false);
  const [translated, setTranslated] = useState(false);

  const allText = [form.bio_1, form.bio_2, form.bio_3].filter(Boolean).join(" ");
  const isIndonesian = detectIndonesian(allText);

  const handleSave = async () => {
    setSaving(true);
    setTranslated(false);
    try {
      const res = await axios.put<{ _translated?: boolean }>("/api/admin/tentang/profile", form);
      if (res.data._translated) setTranslated(true);
      onToast(
        res.data._translated
          ? "Bio disimpan & versi English otomatis dibuat!"
          : "Bio berhasil disimpan!",
        true
      );
    } catch {
      onToast("Gagal menyimpan bio.", false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card title="Bio / Paragraf Tentang Saya">
      <div className="space-y-4">
        <BioField label="Paragraf 1" value={form.bio_1} onChange={(v) => setForm({ ...form, bio_1: v })} placeholder="Paragraf pertama..." />
        <BioField label="Paragraf 2" value={form.bio_2} onChange={(v) => setForm({ ...form, bio_2: v })} placeholder="Paragraf kedua..." />
        <BioField label="Paragraf 3" value={form.bio_3} onChange={(v) => setForm({ ...form, bio_3: v })} placeholder="Paragraf ketiga..." />

        <AnimatePresence>
          {isIndonesian && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
              <Languages size={13} className="shrink-0" />
              Konten Bahasa Indonesia terdeteksi — versi English akan otomatis dibuat saat disimpan.
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {translated && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 size={13} className="shrink-0" />
              Bio tersimpan dalam 2 bahasa (ID + EN) — language switch aktif di halaman publik.
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex justify-end pt-2">
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {saving ? (isIndonesian ? "Menyimpan & Menerjemahkan..." : "Menyimpan...") : (isIndonesian ? "Simpan & Auto-Translate" : "Simpan Bio")}
          </button>
        </div>
      </div>
    </Card>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// KARIER FORM
// ════════════════════════════════════════════════════════════════════════════
const emptyKarier = (): Karier => ({
  logo_url: "", position: "", company: "", location: "",
  start_date: "", end_date: "", total_duration: "", work_type: "", work_mode: "",
  tasks: [], learnings: [], impacts: [], sort_order: 0, is_active: true,
});

function KarierForm({ initial, onSave, onCancel }: { initial?: Karier; onSave: (data: Karier) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Karier>(initial ?? emptyKarier());
  const [saving, setSaving] = useState(false);
  const set = (key: keyof Karier, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const sampleText = [...form.tasks, ...form.learnings, ...form.impacts].slice(0, 5).join(" ");
  const isIndonesian = detectIndonesian(sampleText);

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
      className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-slate-800 p-5 space-y-4">
      <LogoUpload value={form.logo_url} onChange={(url) => set("logo_url", url)} folder="karier" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Posisi / Jabatan" value={form.position} onChange={(v) => set("position", v)} placeholder="Backend Developer" />
        <Field label="Nama Perusahaan" value={form.company} onChange={(v) => set("company", v)} placeholder="PT. Contoh Indonesia" />
        <Field label="Lokasi" value={form.location} onChange={(v) => set("location", v)} placeholder="Jakarta Selatan" />
        <Field label="Mulai" value={form.start_date} onChange={(v) => set("start_date", v)} placeholder="Jan 2023" />
        <Field label="Selesai" value={form.end_date} onChange={(v) => set("end_date", v)} placeholder="Des 2023" />
        <Field label="Total Durasi" value={form.total_duration} onChange={(v) => set("total_duration", v)} placeholder="12 bulan" />
        <Field label="Tipe Kerja" value={form.work_type} onChange={(v) => set("work_type", v)} placeholder="Full Time / Part Time / Internship" />
        <Field label="Mode Kerja" value={form.work_mode} onChange={(v) => set("work_mode", v)} placeholder="Hybrid / WFO / WFH" />
        <Field label="Urutan" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v))} placeholder="0" />
      </div>
      <ArrayField label="Tugas" value={form.tasks} onChange={(v) => set("tasks", v)} placeholder="Tugas pertama&#10;Tugas kedua" />
      <ArrayField label="Apa yang Saya Pelajari" value={form.learnings} onChange={(v) => set("learnings", v)} placeholder="Pelajaran pertama&#10;Pelajaran kedua" />
      <ArrayField label="Dampak" value={form.impacts} onChange={(v) => set("impacts", v)} placeholder="Dampak pertama&#10;Dampak kedua" />

      <AnimatePresence>
        {isIndonesian && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
            <Languages size={13} className="shrink-0" />
            Bahasa Indonesia terdeteksi — versi English otomatis dibuat saat disimpan.
          </motion.div>
        )}
      </AnimatePresence>

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer pt-1">
        <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="accent-violet-600 w-4 h-4" />
        Aktif (tampil di halaman)
      </label>
      <div className="flex gap-3 pt-1">
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Menyimpan..." : isIndonesian ? "Simpan & Auto-Translate" : "Simpan"}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
          <X size={14} /> Batal
        </button>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// KARIER TAB
// ════════════════════════════════════════════════════════════════════════════
function KarierTab({ initial, onToast }: { initial: Karier[]; onToast: (msg: string, ok: boolean) => void }) {
  const [list, setList] = useState<Karier[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Karier | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = async (data: Karier) => {
    try {
      const res = await axios.post("/api/admin/tentang/karier", data);
      setList((p) => [...p, res.data]);
      setShowForm(false);
      onToast("Karier berhasil ditambahkan!", true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      onToast(msg ? `Gagal menambahkan karier: ${msg}` : "Gagal menambahkan karier.", false);
    }
  };

  const handleEdit = async (data: Karier) => {
    const targetId = editItem!.id;
    try {
      const res = await axios.put(`/api/admin/tentang/karier/${targetId}`, data);
      setList((p) => p.map((x) => (x.id === targetId ? res.data : x)));
      setEditItem(null);
      onToast("Karier berhasil diperbarui!", true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      onToast(msg ? `Gagal memperbarui karier: ${msg}` : "Gagal memperbarui karier.", false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus karier ini?")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/admin/tentang/karier/${id}`);
      setList((p) => p.filter((x) => x.id !== id));
      onToast("Karier dihapus.", true);
    } catch {
      onToast("Gagal menghapus karier.", false);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors">
          <Plus size={15} /> Tambah Karier
        </button>
      </div>
      <AnimatePresence>
        {showForm && !editItem && <KarierForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}
      </AnimatePresence>
      {list.length === 0 && <div className="text-center py-12 text-sm text-gray-400 dark:text-slate-500">Belum ada data karier.</div>}
      {list.map((item) => (
        <div key={item.id} className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {item.logo_url && (
                <div className="shrink-0 w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-600 bg-white flex items-center justify-center overflow-hidden">
                  <Image src={item.logo_url} alt={`Logo ${item.company}`} width={36} height={36} className="w-full h-full object-contain p-0.5" unoptimized />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.position || "(tanpa posisi)"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.company} • {item.start_date} – {item.end_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3 shrink-0">
              <button onClick={() => setExpandedId(expandedId === item.id ? null : item.id ?? null)}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors">
                <motion.div animate={{ rotate: expandedId === item.id ? 180 : 0 }} transition={{ duration: 0.2 }}><ChevronDown size={15} /></motion.div>
              </button>
              <button onClick={() => { setEditItem(item); setShowForm(false); }}
                className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(item.id!)} disabled={deleting === item.id}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40">
                {deleting === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {editItem?.id === item.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-100 dark:border-slate-700">
                <div className="p-4">
                  <KarierForm initial={editItem ?? undefined} onSave={handleEdit} onCancel={() => setEditItem(null)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <AnimatePresence>
            {expandedId === item.id && !editItem && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-100 dark:border-slate-700">
                <div className="px-5 py-4 space-y-3 text-xs text-gray-600 dark:text-gray-300">
                  <div>
                    <p className="font-semibold text-violet-600 dark:text-violet-400 mb-1 uppercase tracking-wider text-[10px]">Tugas</p>
                    <ul className="space-y-1">{item.tasks.map((t, i) => <li key={i} className="flex gap-2"><span className="text-violet-400 shrink-0">•</span>{t}</li>)}</ul>
                  </div>
                  <div>
                    <p className="font-semibold text-cyan-600 dark:text-cyan-400 mb-1 uppercase tracking-wider text-[10px]">Apa yang Dipelajari</p>
                    <ul className="space-y-1">{item.learnings.map((l, i) => <li key={i} className="flex gap-2"><span className="text-cyan-400 shrink-0">•</span>{l}</li>)}</ul>
                  </div>
                  <div>
                    <p className="font-semibold text-emerald-600 dark:text-emerald-400 mb-1 uppercase tracking-wider text-[10px]">Dampak</p>
                    <ul className="space-y-1">{item.impacts.map((imp, i) => <li key={i} className="flex gap-2"><span className="text-emerald-400 shrink-0">•</span>{imp}</li>)}</ul>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PENDIDIKAN FORM
// ════════════════════════════════════════════════════════════════════════════
const emptyPendidikan = (): Pendidikan => ({
  logo_url: "", school: "", major: "", location: "",
  start_date: "", end_date: "", highlights: [], sort_order: 0, is_active: true,
});

function PendidikanForm({ initial, onSave, onCancel }: { initial?: Pendidikan; onSave: (data: Pendidikan) => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState<Pendidikan>(initial ?? emptyPendidikan());
  const [saving, setSaving] = useState(false);
  const set = (key: keyof Pendidikan, value: unknown) => setForm((p) => ({ ...p, [key]: value }));

  const sampleText = form.highlights.slice(0, 5).join(" ");
  const isIndonesian = detectIndonesian(sampleText);

  const handleSubmit = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 12 }}
      className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-slate-800 p-5 space-y-4">
      <LogoUpload value={form.logo_url} onChange={(url) => set("logo_url", url)} folder="pendidikan" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Field label="Nama Sekolah" value={form.school} onChange={(v) => set("school", v)} placeholder="SMKN 5 Jakarta" />
        <Field label="Jurusan / Program" value={form.major} onChange={(v) => set("major", v)} placeholder="Teknik Informatika" />
        <Field label="Lokasi" value={form.location} onChange={(v) => set("location", v)} placeholder="Jakarta Timur" />
        <Field label="Mulai" value={form.start_date} onChange={(v) => set("start_date", v)} placeholder="Jul 2021" />
        <Field label="Selesai" value={form.end_date} onChange={(v) => set("end_date", v)} placeholder="Jul 2025" />
        <Field label="Urutan" value={String(form.sort_order)} onChange={(v) => set("sort_order", Number(v))} placeholder="0" />
      </div>
      <ArrayField label="Highlight Pendidikan" value={form.highlights} onChange={(v) => set("highlights", v)} placeholder="Highlight pertama&#10;Highlight kedua" />

      <AnimatePresence>
        {isIndonesian && (
          <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-400">
            <Languages size={13} className="shrink-0" />
            Bahasa Indonesia terdeteksi — versi English otomatis dibuat saat disimpan.
          </motion.div>
        )}
      </AnimatePresence>

      <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 cursor-pointer">
        <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="accent-violet-600 w-4 h-4" />
        Aktif (tampil di halaman)
      </label>
      <div className="flex gap-3">
        <button onClick={handleSubmit} disabled={saving}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors">
          {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {saving ? "Menyimpan..." : isIndonesian ? "Simpan & Auto-Translate" : "Simpan"}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-700 text-sm font-medium transition-colors">
          <X size={14} /> Batal
        </button>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// PENDIDIKAN TAB
// ════════════════════════════════════════════════════════════════════════════
function PendidikanTab({ initial, onToast }: { initial: Pendidikan[]; onToast: (msg: string, ok: boolean) => void }) {
  const [list, setList] = useState<Pendidikan[]>(initial);
  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<Pendidikan | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const handleAdd = async (data: Pendidikan) => {
    try {
      const res = await axios.post("/api/admin/tentang/pendidikan", data);
      setList((p) => [...p, res.data]);
      setShowForm(false);
      onToast("Pendidikan berhasil ditambahkan!", true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      onToast(msg ? `Gagal menambahkan pendidikan: ${msg}` : "Gagal menambahkan pendidikan.", false);
    }
  };

  const handleEdit = async (data: Pendidikan) => {
    const targetId = editItem!.id;
    try {
      const res = await axios.put(`/api/admin/tentang/pendidikan/${targetId}`, data);
      setList((p) => p.map((x) => (x.id === targetId ? res.data : x)));
      setEditItem(null);
      onToast("Pendidikan berhasil diperbarui!", true);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      onToast(msg ? `Gagal memperbarui pendidikan: ${msg}` : "Gagal memperbarui pendidikan.", false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus pendidikan ini?")) return;
    setDeleting(id);
    try {
      await axios.delete(`/api/admin/tentang/pendidikan/${id}`);
      setList((p) => p.filter((x) => x.id !== id));
      onToast("Pendidikan dihapus.", true);
    } catch {
      onToast("Gagal menghapus pendidikan.", false);
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => { setShowForm(true); setEditItem(null); }}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-semibold transition-colors">
          <Plus size={15} /> Tambah Pendidikan
        </button>
      </div>
      <AnimatePresence>
        {showForm && !editItem && <PendidikanForm onSave={handleAdd} onCancel={() => setShowForm(false)} />}
      </AnimatePresence>
      {list.length === 0 && <div className="text-center py-12 text-sm text-gray-400 dark:text-slate-500">Belum ada data pendidikan.</div>}
      {list.map((item) => (
        <div key={item.id} className="rounded-2xl border border-gray-100 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              {item.logo_url && (
                <div className="shrink-0 w-9 h-9 rounded-lg border border-gray-200 dark:border-slate-600 bg-white flex items-center justify-center overflow-hidden">
                  <Image src={item.logo_url} alt={`Logo ${item.school}`} width={36} height={36} className="w-full h-full object-contain p-0.5" unoptimized />
                </div>
              )}
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{item.school || "(tanpa nama)"}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.major} • {item.start_date} – {item.end_date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-3 shrink-0">
              <button onClick={() => setEditItem(editItem?.id === item.id ? null : item)}
                className="p-2 rounded-lg text-gray-400 hover:text-violet-600 dark:hover:text-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => handleDelete(item.id!)} disabled={deleting === item.id}
                className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-40">
                {deleting === item.id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
              </button>
            </div>
          </div>
          <AnimatePresence>
            {editItem?.id === item.id && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-gray-100 dark:border-slate-700">
                <div className="p-4">
                  <PendidikanForm initial={editItem ?? undefined} onSave={handleEdit} onCancel={() => setEditItem(null)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════
export default function ManageTentangClient({ initialProfile, initialKarier, initialPendidikan }: {
  initialProfile: Profile | null;
  initialKarier: Karier[];
  initialPendidikan: Pendidikan[];
}) {
  const [tab, setTab] = useState<Tab>("bio");
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  const showToast = (msg: string, ok: boolean) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 p-1.5 bg-gray-50 dark:bg-slate-800 rounded-2xl w-fit">
        <TabButton active={tab === "bio"} onClick={() => setTab("bio")} icon={<User size={15} />} label="Bio" />
        <TabButton active={tab === "karier"} onClick={() => setTab("karier")} icon={<Briefcase size={15} />} label="Karier" />
        <TabButton active={tab === "pendidikan"} onClick={() => setTab("pendidikan")} icon={<GraduationCap size={15} />} label="Pendidikan" />
      </div>
      <AnimatePresence mode="wait">
        {tab === "bio" && (
          <motion.div key="bio" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <BioTab initial={initialProfile} onToast={showToast} />
          </motion.div>
        )}
        {tab === "karier" && (
          <motion.div key="karier" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <KarierTab initial={initialKarier} onToast={showToast} />
          </motion.div>
        )}
        {tab === "pendidikan" && (
          <motion.div key="pendidikan" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
            <PendidikanTab initial={initialPendidikan} onToast={showToast} />
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {toast && <Toast message={toast.msg} ok={toast.ok} />}
      </AnimatePresence>
    </div>
  );
}