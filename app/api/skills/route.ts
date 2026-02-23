import { createClient } from "@/app/lib/supabase/server";
import { NextResponse } from "next/server";

function table(supabase: any, name: string) {
  return supabase.from(name);
}

export async function GET() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_skills")
    .select("*")
    .order("sort_order");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const body = await request.json();
  const { error } = await table(supabase, "home_skills").insert(body);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}