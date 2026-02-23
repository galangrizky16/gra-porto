"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import { headers } from "next/headers";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6).max(128),
});

const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

type Profile = {
  role: string;
  is_active: boolean;
};

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const window = 60_000;
  const max = 5;

  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return false;
  }

  if (entry.count >= max) return true;

  entry.count++;
  return false;
}

export type LoginState = {
  error?: string;
};

export async function loginAction(
  _prev: LoginState,
  formData: FormData
): Promise<LoginState> {
  const headerStore = await headers();
  const ip =
    headerStore.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (isRateLimited(ip)) {
    return { error: "Terlalu banyak percobaan. Coba lagi dalam beberapa saat." };
  }

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: "Email atau password tidak valid." };
  }

  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    return { error: "Email atau password salah." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Terjadi kesalahan. Silakan coba lagi." };
  }

  const { data } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;

  const adminRoles = new Set(["admin", "superadmin"]);
  if (!profile?.is_active || !adminRoles.has(profile?.role ?? "")) {
    await supabase.auth.signOut();
    return { error: "Akun Anda tidak memiliki akses admin." };
  }

  redirect("/admin");
}