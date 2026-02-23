import { createClient } from "@/app/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "./components/Header";
import HomeAdminClient from "./HomeAdminClient";

type Profile = {
  id: string;
  name: string;
  location: string;
  work_type: string;
  bio_1: string;
  bio_2: string;
};

export default async function AdminPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/admin/auth/login");

  const [{ data: profileData }] = await Promise.all([
    supabase.from("home_profile").select("*").single(),
  ]);

  const profile = profileData as Profile | null;

  if (!profile) {
    return (
      <>
        <Header title="Manage Home" />
        <div className="flex-1 p-6 flex items-center justify-center">
          <p className="text-sm text-red-500">
            Data profil tidak ditemukan. Jalankan SQL schema terlebih dahulu.
          </p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Manage Home" />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Manage Home
          </h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Edit konten yang tampil di halaman utama portfolio.
          </p>
        </div>
        <HomeAdminClient profile={profile} />
      </div>
    </>
  );
}