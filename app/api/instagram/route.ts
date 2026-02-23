// app/api/instagram/route.ts
// Fetch data Instagram dari Behold.so JSON feed

import { NextResponse } from "next/server";

const BEHOLD_URL = process.env.BEHOLD_FEED_URL;

// Cache sederhana di memory (5 menit)
let cache: { data: unknown; at: number } | null = null;
const CACHE_TTL = 5 * 60 * 1000;

export async function GET() {
  if (!BEHOLD_URL) {
    return NextResponse.json(
      { error: "BEHOLD_FEED_URL belum di-set di .env.local" },
      { status: 500 }
    );
  }

  if (cache && Date.now() - cache.at < CACHE_TTL) {
    return NextResponse.json(cache.data);
  }

  try {
    const res = await fetch(BEHOLD_URL, { next: { revalidate: 300 } });
    if (!res.ok) throw new Error(`Behold API error: ${res.status}`);
    const data = await res.json();
    cache = { data, at: Date.now() };
    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json(
      { error: "Gagal fetch dari Behold", detail: String(err) },
      { status: 500 }
    );
  }
}