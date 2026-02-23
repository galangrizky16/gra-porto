import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const BUCKET = "proyek";
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    if (!ALLOWED.includes(file.type))
      return NextResponse.json({ error: "Format tidak didukung. Gunakan JPG, PNG, WebP, atau GIF." }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "Ukuran file maksimal 5 MB." }, { status: 400 });

    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `screenshots/${fileName}`;

    const buffer = new Uint8Array(await file.arrayBuffer());

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, { contentType: file.type, upsert: false });

    if (error) {
      console.error("[upload proyek]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filePath);
    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("[upload proyek] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}