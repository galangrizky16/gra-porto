import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

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

function parseJsonField<T>(field: unknown, fallback: T): T {
  if (!field) return fallback;
  if (typeof field === "string") {
    try { return JSON.parse(field); } catch { return fallback; }
  }
  if (typeof field === "object") return field as T;
  return fallback;
}

export async function GET() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data, error } = await db.from("tentang_profile").select("*").single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function PUT(req: Request) {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const body = await req.json();
  const { bio_1, bio_2, bio_3 } = body;

  const allText = [bio_1, bio_2, bio_3].filter(Boolean).join(" ");
  const isIndonesian = detectIndonesian(allText);

  let bio_id = null;
  let bio_en = null;

  if (isIndonesian) {
    bio_id = { bio_1: bio_1 ?? "", bio_2: bio_2 ?? "", bio_3: bio_3 ?? "" };

    const [t1, t2, t3] = await Promise.all([
      bio_1 ? translateText(bio_1) : Promise.resolve(""),
      bio_2 ? translateText(bio_2) : Promise.resolve(""),
      bio_3 ? translateText(bio_3) : Promise.resolve(""),
    ]);

    bio_en = { bio_1: t1, bio_2: t2, bio_3: t3 };
  }

  const { data: existing } = await db.from("tentang_profile").select("id").single();

  const payload = { bio_1, bio_2, bio_3, bio_id, bio_en };

  let result;
  if (existing?.id) {
    result = await db
      .from("tentang_profile")
      .update(payload)
      .eq("id", existing.id)
      .select()
      .single();
  } else {
    result = await db
      .from("tentang_profile")
      .insert(payload)
      .select()
      .single();
  }

  if (result.error) return NextResponse.json({ error: result.error.message }, { status: 500 });

  return NextResponse.json({
    ...result.data,
    _translated: isIndonesian,
  });
}