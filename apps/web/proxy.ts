import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/auth";

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const adminPassword = process.env.ADMIN_PASSWORD;

  // Agar ADMIN_PASSWORD o'rnatilmagan bo'lsa (lokal test yoki ochiq dev), ruxsat beriladi
  if (!adminPassword) {
    return NextResponse.next();
  }

  // Ochiq marshrutlar: login, Next.js statik fayllari, cron (o'z bearer siri mavjud)
  if (
    pathname === "/login" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/cron") ||
    pathname === "/favicon.ico" ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/)
  ) {
    return NextResponse.next();
  }

  const sessionCookie = request.cookies.get(SESSION_COOKIE)?.value;
  const isAuthenticated = sessionCookie
    ? await verifySessionToken(sessionCookie, adminPassword)
    : false;

  if (isAuthenticated) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Himoyalangan API marshrutlari uchun 401
  if (pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "Avtorizatsiyadan o'tilmagan. Iltimos login qiling." },
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
