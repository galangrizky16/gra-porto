import { createClient } from "@/app/lib/supabase/server";
import { LogOut, Bell } from "lucide-react";

type Profile = {
  full_name: string | null;
  role: string;
};

interface HeaderProps {
  title?: string;
}

export default async function Header({ title = "Dashboard" }: HeaderProps) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data } = user
    ? await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .single()
    : { data: null };

  const profile = data as Profile | null;

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : user?.email?.[0]?.toUpperCase() ?? "A";

  return (
    <header className="sticky top-0 z-20 h-16 flex items-center justify-between pl-14 pr-6 lg:px-6 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-100 dark:border-slate-800">
      <div>
        <h1 className="text-base font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <button className="relative p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-violet-500" />
        </button>

        <div className="flex items-center gap-2.5 pl-3 border-l border-gray-100 dark:border-slate-800">
          <div className="w-8 h-8 rounded-xl bg-violet-100 dark:bg-violet-900/40 flex items-center justify-center">
            <span className="text-xs font-bold text-violet-600 dark:text-violet-400">
              {initials}
            </span>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs font-semibold text-gray-800 dark:text-white leading-tight">
              {profile?.full_name ?? user?.email ?? "Admin"}
            </p>
            <p className="text-[11px] text-gray-400 dark:text-slate-500 capitalize leading-tight">
              {profile?.role ?? "admin"}
            </p>
          </div>
        </div>

        <form action="/admin/auth/logout" method="POST">
          <button
            type="submit"
            className="p-2 rounded-xl text-gray-400 dark:text-slate-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            title="Logout"
          >
            <LogOut size={17} />
          </button>
        </form>
      </div>
    </header>
  );
}