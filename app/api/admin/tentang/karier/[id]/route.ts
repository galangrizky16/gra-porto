import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

const ID_WORDS = [
  "saya", "aku", "kamu", "anda", "adalah", "dan", "atau", "yang", "dengan",
  "untuk", "dari", "pada", "dalam", "tidak", "bukan", "sudah", "belum",
  "sedang", "akan", "bisa", "dapat", "juga", "telah", "serta",
  "namun", "tetapi", "jika", "ketika", "karena", "sehingga", "selain",
  "berbagai", "banyak", "beberapa", "sangat", "lebih", "semua",
  "ini", "itu", "tersebut", "antara", "hingga", "setiap", "baik",
];

function detectIndonesian(text: string): boolean {
  if (!text?.trim()) return false;
  const words = text.toLowerCase().split(/\s+/);
  const matches = words.filter((w) => ID_WORDS.includes(w));
  return matches.length / words.length > 0.08;
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

async function translateArrays(tasks: string[], learnings: string[], impacts: string[]) {
  const allItems = [...tasks, ...learnings, ...impacts];
  const translated = await Promise.all(allItems.map((t) => translateText(t)));
  return {
    tasks: translated.slice(0, tasks.length),
    learnings: translated.slice(tasks.length, tasks.length + learnings.length),
    impacts: translated.slice(tasks.length + learnings.length),
  };
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
    const { id: _id, ...updateData } = body;
    void _id;

    const { tasks = [], learnings = [], impacts = [] } = updateData;
    const sampleText = [...tasks, ...learnings, ...impacts].slice(0, 5).join(" ");
    const isIndonesian = detectIndonesian(sampleText);

    let content_id = null;
    let content_en = null;

    if (isIndonesian) {
      content_id = { tasks, learnings, impacts };
      const translated = await translateArrays(tasks, learnings, impacts);
      content_en = translated;
    }

    const { data, error } = await db
      .from("tentang_karier")
      .update({ ...updateData, content_id, content_en })
      .eq("id", id)
      .select();

    if (error) {
      console.error("[PUT karier] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const updated = Array.isArray(data) ? data[0] : data;
    if (!updated) {
      return NextResponse.json({ error: "Data tidak ditemukan." }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (err) {
    console.error("[PUT karier] unexpected:", err);
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

    const { error } = await db.from("tentang_karier").delete().eq("id", id);

    if (error) {
      console.error("[DELETE karier] error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[DELETE karier] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}