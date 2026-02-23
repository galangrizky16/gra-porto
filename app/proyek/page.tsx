import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import ProyekContent from "@/app/components/proyek/ProyekContent";

export const metadata: Metadata = {
  title: "Proyek – Galang Rizky Arridho",
  description:
    "Kumpulan proyek web development karya Galang Rizky Arridho. Dibangun menggunakan Next.js, Laravel, PHP, Tailwind CSS, dan teknologi modern lainnya.",
  keywords: [
    "proyek web developer",
    "portfolio galang rizky arridho",
    "next.js project",
    "laravel project",
    "web development indonesia",
    "GRA",
  ],
  openGraph: {
    title: "Proyek – Galang Rizky Arridho",
    description: "Kumpulan proyek web development karya Galang Rizky Arridho menggunakan teknologi modern.",
    url: "https://gra-porto.vercel.app/proyek",
    siteName: "Gra Porto",
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://gra-porto.vercel.app/proyek",
  },
};

export default async function ProyekPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data } = await db
    .from("proyek")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return <ProyekContent initialData={data ?? []} />;
}