import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

const ADMIN_LOGIN_PATH = "/admin/auth/login";
const ADMIN_PATH = "/admin";
const FORBIDDEN_PATH = "/403";

const ADMIN_ROLES = new Set(["admin", "superadmin"]);

type Profile = {
  role: string;
  is_active: boolean;
};

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith(ADMIN_PATH)) {
    return NextResponse.next();
  }

  const isLoginPage = pathname === ADMIN_LOGIN_PATH;

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    if (isLoginPage) return response;
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = ADMIN_LOGIN_PATH;
    redirectUrl.searchParams.set("redirected", "1");
    return NextResponse.redirect(redirectUrl);
  }

  const { data } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("id", user.id)
    .single();

  const profile = data as Profile | null;

  const isAdmin =
    profile?.is_active === true && ADMIN_ROLES.has(profile?.role ?? "");

  if (!isAdmin) {
    if (isLoginPage) return response;
    return NextResponse.redirect(new URL(FORBIDDEN_PATH, request.url));
  }

  if (isLoginPage) {
    return NextResponse.redirect(new URL(ADMIN_PATH, request.url));
  }

  return response;
}

export const config = {
  matcher: ["/admin/:path*"],
};