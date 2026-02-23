import Header from "@/app/admin/components/Header";
import { createClient } from "@/app/lib/supabase/server";
import ManageProyekClient from "./ManageProyekClient";

export const metadata = {
  title: "Manage Proyek – GraAdmin",
};

export default async function ManageProyekPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data } = await db
    .from("proyek")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Manage Proyek" />
      <div className="flex-1 p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Manage Proyek</h2>
          <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">
            Tambah, edit, dan hapus proyek yang tampil di halaman portfolio.
          </p>
        </div>
        <ManageProyekClient initial={data ?? []} />
      </div>
    </div>
  );
}