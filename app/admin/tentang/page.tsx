import { createClient } from "@/app/lib/supabase/server";
import Header from "@/app/admin/components/Header";
import ManageTentangClient from "./ManageTentangClient";

export const metadata = {
  title: "Manage Tentang – GraAdmin",
};

export default async function ManageTentangPage() {
  const supabase = await createClient();

  const [
    { data: profileData },
    { data: karierData },
    { data: pendidikanData },
  ] = await Promise.all([
    supabase.from("tentang_profile").select("*").single(),
    supabase.from("tentang_karier").select("*").order("sort_order"),
    supabase.from("tentang_pendidikan").select("*").order("sort_order"),
  ]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Manage Tentang" />
      <div className="flex-1 p-6">
        <ManageTentangClient
          initialProfile={profileData}
          initialKarier={karierData ?? []}
          initialPendidikan={pendidikanData ?? []}
        />
      </div>
    </div>
  );
}