import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ochiq marshrutlar: landing page (/), login, register, Next.js statik fayllari, cron, OAuth
  const isPublicRoute =
    pathname === "/" ||
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/api/media") ||
    pathname.startsWith("/api/auth/meta") ||
    pathname.startsWith("/api/auth/instagram") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/);

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionCookie ? await verifySessionToken(sessionCookie) : null;

  if (session) {
    // Agar foydalanuvchi tizimga kirgan bo'lsa va login/register ga kelsa, dashboard ga yo'naltiriladi
    if (pathname === "/login" || pathname === "/register") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  // Ochiq sahifalar barcha uchun ochiq
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Himoyalangan API marshrutlari uchun 401
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Avtorizatsiyadan o'tilmagan. Iltimos ro'yxatdan o'ting yoki tizimga kiring." },
      { status: 401 },
    );
  }

  // Boshqa barcha dashboard sahifalari uchun login sahifasiga yo'naltirish
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("from", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
