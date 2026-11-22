import { NextResponse } from "next/server";

function authorized(request: Request): boolean {
  const auth = request.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  return Boolean(secret) && auth === `Bearer ${secret}`;
}

// Vercel Cron #1 (kuniga 1 marta): bugungi ishlab chiqarish job'ini yaratadi
// va GitHub Actions render worker'ini workflow_dispatch orqali ishga tushiradi.
export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // TODO(core): 1) app_settings.paused tekshiruvi
  //             2) jobs jadvaliga { type: "produce_daily" } qo'shish (idempotent: bugun bittadan ko'p emas)
  //             3) GitHub Actions workflow_dispatch chaqiruvi

  return NextResponse.json({ ok: true, job: null });
}
