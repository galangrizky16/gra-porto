import { NextResponse } from "next/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";

const BUCKET = "pencapaian";
const MAX_SIZE = 3 * 1024 * 1024; // 3 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp", "image/svg+xml"];

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) return NextResponse.json({ error: "File tidak ditemukan." }, { status: 400 });
    if (!ALLOWED.includes(file.type))
      return NextResponse.json({ error: "Format tidak didukung. Gunakan JPG, PNG, WebP, atau SVG." }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "Ukuran file maksimal 3 MB." }, { status: 400 });

    // Gunakan service role agar bisa bypass RLS saat upload
    const supabase = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const ext = file.name.split(".").pop() ?? "jpg";
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filePath = `sertifikat/${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);

    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (error) {
      console.error("[upload pencapaian]", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filePath);

    return NextResponse.json({ url: urlData.publicUrl });
  } catch (err) {
    console.error("[upload pencapaian] unexpected:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}