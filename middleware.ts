import { type NextRequest, NextResponse } from "next/server";
import { createServerClient, type CookieOptions } from "@supabase/ssr";

type CookieToSet = { name: string; value: string; options?: CookieOptions };

const PUBLIC_PATHS = ["/", "/login", "/signup", "/forgot-password", "/reset-password", "/public", "/online-result"];
const AUTH_ONLY_PATHS = ["/login", "/signup", "/forgot-password"];
const ONBOARDING_PATHS = ["/plans", "/payment", "/pending"];
const ADMIN_PATHS = ["/admin"];

function isPublic(pathname: string) {
  return (
    PUBLIC_PATHS.some(p => pathname === p || pathname.startsWith(p + "/")) ||
    pathname.startsWith("/s/") // school public sites
  );
}

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });
  const { pathname } = request.nextUrl;

  // API routes handle their own auth — never intercept them
  if (pathname.startsWith("/api/")) return supabaseResponse;

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet: CookieToSet[]) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // Not logged in — only public paths allowed
  if (!user) {
    if (isPublic(pathname)) return supabaseResponse;
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Logged in + hitting auth pages → redirect away
  if (AUTH_ONLY_PATHS.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Fetch user profile (service_provider flag + subscription status)
  const { data: profile } = await supabase
    .from("users")
    .select("is_service_provider, school_id, is_super_admin")
    .eq("id", user.id)
    .single();

  const isServiceProvider = profile?.is_service_provider ?? false;

  // Service provider routing
  if (isServiceProvider) {
    if (pathname.startsWith("/admin")) return supabaseResponse;
    // Redirect away from dashboard/onboarding to admin
    if (pathname.startsWith("/dashboard") || ONBOARDING_PATHS.some(p => pathname.startsWith(p))) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return supabaseResponse;
  }

  // School owner / staff routing — check subscription status
  if (pathname.startsWith("/admin")) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // Check subscription for non-public paths
  if (!isPublic(pathname) && !ONBOARDING_PATHS.some(p => pathname.startsWith(p))) {
    const schoolId = profile?.school_id;
    if (!schoolId) {
      // No school yet → back to plans
      if (!pathname.startsWith("/plans")) {
        return NextResponse.redirect(new URL("/plans", request.url));
      }
      return supabaseResponse;
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("school_id", schoolId)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    const status = sub?.status;

    if (!status) {
      // Has school but no subscription → back to plans so user re-selects on every login
      if (!ONBOARDING_PATHS.some(p => pathname.startsWith(p))) {
        return NextResponse.redirect(new URL("/plans", request.url));
      }
      return supabaseResponse;
    }

    if (status === "rejected") {
      if (!pathname.startsWith("/pending")) {
        return NextResponse.redirect(new URL("/pending", request.url));
      }
      return supabaseResponse;
    }

    // pending → allow dashboard; the layout shows a "under review" banner

    // status === "approved" → allow dashboard
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
