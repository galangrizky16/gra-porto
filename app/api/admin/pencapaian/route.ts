import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// ── Language detection & translation ──────────────────────────────────────────
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

async function translateText(text: string): Promise<string> {
  if (!text.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`;
    const res = await fetch(url, { cache: "no-store" });
    const json = await res.json();
    return json?.responseData?.translatedText ?? text;
  } catch {
    return text;
  }
}

// ── GET all (admin: no is_active filter) ─────────────────────────────────────
export async function GET() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db
    .from("pencapaian")
    .select("*")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// ── POST create ───────────────────────────────────────────────────────────────
export async function POST(req: Request) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const body = await req.json();
  const { name_id, issuer_id, ...rest } = body;

  const combinedText = [name_id, issuer_id].filter(Boolean).join(" ");
  const isIndonesian = detectIndonesian(combinedText);

  let name_en = name_id ?? "";
  let issuer_en = issuer_id ?? "";

  if (isIndonesian) {
    [name_en, issuer_en] = await Promise.all([
      name_id ? translateText(name_id) : Promise.resolve(""),
      issuer_id ? translateText(issuer_id) : Promise.resolve(""),
    ]);
  }

  const { data, error } = await db
    .from("pencapaian")
    .insert({ ...rest, name_id, issuer_id, name_en, issuer_en })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, _translated: isIndonesian }, { status: 201 });
}