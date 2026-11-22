import { NextResponse } from "next/server";

function authorized(request: Request): boolean {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && auth === `Bearer ${secret}`;
}

// Vercel Cron #2 (har soatda): joylash vaqti yetgan "ready" videoni topadi va
// Instagram Graph API orqali joylaydi. Hobby cron +/-1 soat aniqligini
// kompensatsiya qilish uchun soatlik ishlaydi; idempotent (holat mashinasi).
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // TODO(core): 1) app_settings.paused tekshiruvi
  //             2) videos: status=ready AND scheduledFor <= now AND publishedAt IS NULL
  //             3) container yaratish -> status polling -> media_publish
  //             4) ketma-ket 2 xatoda avto-pauza + Telegram xabar

  return NextResponse.json({ ok: true, published: [] });
}
