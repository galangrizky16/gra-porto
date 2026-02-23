import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

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

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { id } = await params;
    const body = await req.json();
    const { id: _id, created_at, updated_at, ...updateData } = body;
    void _id; void created_at; void updated_at;

    const { name_id, issuer_id } = updateData;

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
      .update({ ...updateData, name_en, issuer_en })
      .eq("id", id)
      .select();

    if (error) {
      console.error("[PUT pencapaian]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const updated = Array.isArray(data) ? data[0] : data;
    if (!updated) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });

    return NextResponse.json({ ...updated, _translated: isIndonesian });
  } catch (err) {
    console.error("[PUT pencapaian] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const db = supabase as any;

    const { id } = await params;
    const { error } = await db.from("pencapaian").delete().eq("id", id);

    if (error) {
      console.error("[DELETE pencapaian]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE pencapaian] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}