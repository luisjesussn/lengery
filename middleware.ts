import { NextRequest, NextResponse } from "next/server";

const SECURITY_HEADERS: Record<string, string> = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  "X-DNS-Prefetch-Control": "on",
};

const PROD_ONLY_HEADERS: Record<string, string> = {
  "Strict-Transport-Security": "max-age=63072000; includeSubDomains; preload",
};

const COOKIE_DEV = "intima-session";
const COOKIE_PROD = "__Host-intima-session";

function isSafeRelativePath(p: string): boolean {
  return p.startsWith("/") && !p.startsWith("//") && !p.startsWith("/\\");
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isProd = process.env.NODE_ENV === "production";
  const cookieName = isProd ? COOKIE_PROD : COOKIE_DEV;

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const cookie = req.cookies.get(cookieName);
    if (!cookie) {
      const url = req.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      if (isSafeRelativePath(pathname)) {
        url.searchParams.set("from", pathname);
      }
      return NextResponse.redirect(url);
    }
  }

  const res = NextResponse.next();
  for (const [k, v] of Object.entries(SECURITY_HEADERS)) {
    res.headers.set(k, v);
  }
  if (isProd) {
    for (const [k, v] of Object.entries(PROD_ONLY_HEADERS)) {
      res.headers.set(k, v);
    }
  }
  return res;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
