import { NextResponse } from "next/server";
import { createClient } from "@/app/lib/supabase/server";

// ── GET /api/messages ─────────────────────────────────────────────────────────
export async function GET() {
  // Gunakan createClient yang sudah ada — tidak perlu generic Database
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any;

  const { data, error } = await supabase
    .from("messages")
    .select(
      `id, user_id, content, created_at,
       profiles ( id, email, name, avatar_url, role, created_at )`
    )
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// ── POST /api/messages ────────────────────────────────────────────────────────
export async function POST(req: Request) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = await createClient() as any;

  // Validasi session — dibaca otomatis dari cookie
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const content: string = (body.content ?? "").trim();

  if (!content || content.length > 1000) {
    return NextResponse.json({ error: "Konten tidak valid" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("messages")
    .insert({ user_id: user.id, content })
    .select("id, user_id, content, created_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
}