import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

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

async function translateText(text: string): Promise<string> {
  if (!text.trim()) return text;
  try {
    const res = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`,
      { cache: "no-store" }
    );
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

    const { title_id, description_id, long_desc_id } = updateData;
    const sample = [title_id, description_id].filter(Boolean).join(" ");
    const isIndonesian = detectIndonesian(sample);

    let title_en = title_id ?? "";
    let description_en = description_id ?? "";
    let long_desc_en = long_desc_id ?? "";

    if (isIndonesian) {
      [title_en, description_en, long_desc_en] = await Promise.all([
        title_id    ? translateText(title_id)          : Promise.resolve(""),
        description_id ? translateText(description_id) : Promise.resolve(""),
        long_desc_id   ? translateText(long_desc_id)   : Promise.resolve(""),
      ]);
    }

    const { data, error } = await db
      .from("proyek")
      .update({ ...updateData, title_en, description_en, long_desc_en })
      .eq("id", id)
      .select();

    if (error) {
      console.error("[PUT proyek]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const updated = Array.isArray(data) ? data[0] : data;
    if (!updated) return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });

    return NextResponse.json({ ...updated, _translated: isIndonesian });
  } catch (err) {
    console.error("[PUT proyek] unexpected:", err);
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
    const { error } = await db.from("proyek").delete().eq("id", id);

    if (error) {
      console.error("[DELETE proyek]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE proyek] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}