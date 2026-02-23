import { createClient } from "@/app/lib/supabase/server";
import Header from "@/app/admin/components/Header";
import ManagePencapaianClient from "./ManagePencapaianClient";

export const metadata = {
  title: "Manage Pencapaian – GraAdmin",
};

export default async function ManagePencapaianPage() {
  const supabase = await createClient();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const db = supabase as any;

  const { data } = await db
    .from("pencapaian")
    .select("*")
    .order("sort_order");

  return (
    <div className="flex flex-col min-h-screen">
      <Header title="Manage Pencapaian" />
      <div className="flex-1 p-6">
        <ManagePencapaianClient initial={data ?? []} />
      </div>
    </div>
  );
}