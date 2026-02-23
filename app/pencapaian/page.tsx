import type { Metadata } from "next";
import { createClient } from "@/app/lib/supabase/server";
import PencapaianContent from "@/app/components/pencapaian/PencapaianContent";

export const metadata: Metadata = {
  title: "Pencapaian – Galang Rizky Arridho | Sertifikat & Penghargaan",
  description:
    "Kumpulan sertifikat, pelatihan, dan penghargaan yang telah diraih Galang Rizky Arridho sebagai Web Developer dari Jakarta Timur.",
  keywords: [
    "Galang Rizky Arridho",
    "Sertifikat Web Developer",
    "Pencapaian",
    "Software Engineering",
    "Pelatihan",
  ],
  openGraph: {
    title: "Pencapaian – Galang Rizky Arridho",
    description: "Sertifikat, pelatihan, dan penghargaan yang telah diraih.",
    url: "https://gra-porto.vercel.app/pencapaian",
    siteName: "Gra Porto",
    locale: "id_ID",
    type: "website",
  },
  alternates: {
    canonical: "https://gra-porto.vercel.app/pencapaian",
  },
};

export default async function PencapaianPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data } = await db
    .from("pencapaian")
    .select("*")
    .eq("is_active", true)
    .order("sort_order");

  return <PencapaianContent initialData={data ?? []} />;
}