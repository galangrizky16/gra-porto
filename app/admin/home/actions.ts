"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/app/lib/supabase/server";
import { z } from "zod";

const profileSchema = z.object({
  name: z.string().min(1).max(100),
  location: z.string().min(1).max(100),
  work_type: z.string().min(1).max(50),
  bio_1: z.string().min(1).max(1000),
  bio_2: z.string().min(1).max(1000),
});

const skillSchema = z.object({
  name: z.string().min(1).max(50),
  icon_name: z.string().min(1).max(50),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/),
  sort_order: z.coerce.number().int().min(0),
});

export type ActionState = {
  error?: string;
  success?: boolean;
  translated?: boolean;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function table(supabase: any, name: string) {
  return supabase.from(name);
}

// ── Language Detection ────────────────────────────────────────────────────────
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
  const lower = text.toLowerCase();
  const words = lower.split(/\s+/);
  const matches = words.filter((w) => ID_WORDS.includes(w));
  return matches.length / words.length > 0.08;
}

// ── MyMemory Free Translation API ────────────────────────────────────────────
// Gratis, tanpa API key, tanpa kartu kredit
// Limit: 5000 karakter/hari — cukup untuk portfolio
// Docs: https://mymemory.translated.net/doc/spec.php
async function translateText(text: string): Promise<string> {
  if (!text.trim()) return text;
  try {
    const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=id|en`;
    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: { Accept: "application/json" },
    });

    if (!res.ok) return text;

    const json = await res.json();
    const translated: string = json?.responseData?.translatedText ?? "";

    // MyMemory mengembalikan warning string jika limit habis
    if (
      !translated ||
      translated.toUpperCase().startsWith("MYMEMORY WARNING") ||
      translated.toUpperCase().includes("PLEASE")
    ) {
      return text;
    }

    return translated;
  } catch {
    return text;
  }
}

async function translateToEnglish(data: {
  name: string;
  location: string;
  work_type: string;
  bio_1: string;
  bio_2: string;
}): Promise<{
  name: string;
  location: string;
  work_type: string;
  bio_1: string;
  bio_2: string;
} | null> {
  try {
    // name & location = proper noun, tidak diterjemahkan
    const [work_type, bio_1, bio_2] = await Promise.all([
      translateText(data.work_type),
      translateText(data.bio_1),
      translateText(data.bio_2),
    ]);

    return {
      name: data.name,
      location: data.location,
      work_type,
      bio_1,
      bio_2,
    };
  } catch {
    return null;
  }
}

// ── updateProfileAction ───────────────────────────────────────────────────────
export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const raw = {
    name: formData.get("name") as string,
    location: formData.get("location") as string,
    work_type: formData.get("work_type") as string,
    bio_1: formData.get("bio_1") as string,
    bio_2: formData.get("bio_2") as string,
  };

  const parsed = profileSchema.safeParse(raw);
  if (!parsed.success) return { error: "Data tidak valid." };

  const data = parsed.data;

  const combinedText = `${data.bio_1} ${data.bio_2} ${data.work_type}`;
  const isIndonesian = detectIndonesian(combinedText);

  let content_id = data;
  let content_en = data;
  let translated = false;

  if (isIndonesian) {
    const translatedData = await translateToEnglish(data);
    if (translatedData) {
      content_id = data;
      content_en = translatedData;
      translated = true;
    }
  } else {
    content_en = data;
    content_id = data;
  }

  const supabase = await createClient();
  const { error } = await table(supabase, "home_profile")
    .update({
      ...data,
      content_id: JSON.stringify(content_id),
      content_en: JSON.stringify(content_en),
      updated_at: new Date().toISOString(),
    })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (error) return { error: "Gagal menyimpan profil." };

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true, translated };
}

// ── Skill Actions ─────────────────────────────────────────────────────────────
export async function addSkillAction(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const parsed = skillSchema.safeParse({
    name: formData.get("name"),
    icon_name: formData.get("icon_name"),
    color: formData.get("color"),
    sort_order: formData.get("sort_order"),
  });

  if (!parsed.success) return { error: "Data skill tidak valid." };

  const supabase = await createClient();
  const { error } = await table(supabase, "home_skills").insert(parsed.data);

  if (error) return { error: "Gagal menambah skill." };

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function deleteSkillAction(id: string): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await table(supabase, "home_skills").delete().eq("id", id);

  if (error) return { error: "Gagal menghapus skill." };

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}

export async function toggleSkillAction(
  id: string,
  is_active: boolean
): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await table(supabase, "home_skills")
    .update({ is_active })
    .eq("id", id);

  if (error) return { error: "Gagal mengubah status skill." };

  revalidatePath("/");
  revalidatePath("/admin");
  return { success: true };
}