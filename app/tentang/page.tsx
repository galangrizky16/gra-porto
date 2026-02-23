import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import TentangContent from "@/app/components/tentang/TentangContent";

export const metadata: Metadata = {
  title: "Tentang Saya – Galang Rizky Arridho | Web Developer Jakarta",
  description:
    "Kenali Galang Rizky Arridho, seorang Web Developer berpengalaman dari Jakarta Timur yang berdedikasi membangun solusi digital menggunakan Next.js, Laravel, PHP, dan TypeScript.",
  keywords: [
    "Galang Rizky Arridho",
    "Web Developer Jakarta",
    "Next.js Developer",
    "Laravel Developer",
    "TypeScript Developer",
    "Frontend Developer Indonesia",
    "Full Stack Developer Jakarta",
  ],
  authors: [{ name: "Galang Rizky Arridho", url: "https://gra-porto.vercel.app" }],
  openGraph: {
    title: "Tentang Saya – Galang Rizky Arridho",
    description:
      "Web Developer dari Jakarta Timur yang berfokus pada arsitektur perangkat lunak, kode bersih, dan solusi digital berdampak.",
    url: "https://gra-porto.vercel.app/tentang",
    siteName: "Gra Porto",
    locale: "id_ID",
    type: "profile",
  },
  twitter: {
    card: "summary",
    title: "Tentang Saya – Galang Rizky Arridho",
    description: "Web Developer dari Jakarta Timur yang berfokus pada Next.js, Laravel, dan TypeScript.",
  },
  alternates: {
    canonical: "https://gra-porto.vercel.app/tentang",
  },
};

export default async function TentangPage() {
  const supabase = await createClient();

  const [
    { data: profileData },
    { data: karierData },
    { data: pendidikanData },
  ] = await Promise.all([
    supabase.from("tentang_profile").select("*").single(),
    supabase.from("tentang_karier").select("*").eq("is_active", true).order("sort_order"),
    supabase.from("tentang_pendidikan").select("*").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <TentangContent
      initialProfile={profileData}
      initialKarier={karierData ?? []}
      initialPendidikan={pendidikanData ?? []}
    />
  );
}