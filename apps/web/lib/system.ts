import { cache } from "react";
import { connection } from "next/server";
import { prisma } from "@autochannel/db";

export type SystemSnapshot =
  | {
      ok: true;
      paused: boolean;
      pauseReason: string | null;
      autoMode: boolean;
      dailyReelsMax: number;
      connectedProviders: string[];
      hasChannel: boolean;
    }
  | { ok: false; error: string };

async function loadSystemSnapshot(): Promise<SystemSnapshot> {
  // Request vaqtida o'qiladi — Cache Components uchun dinamik nuqta.
  await connection();

  try {
    const [settings, connected, channelCount] = await Promise.all([
      prisma.appSetting.findFirst(),
      prisma.apiCredential.findMany({
        where: { status: "connected" },
        select: { provider: true },
      }),
      prisma.channel.count(),
    ]);

    return {
      ok: true,
      paused: settings?.paused ?? false,
      pauseReason: settings?.pauseReason ?? null,
      autoMode: settings?.autoMode ?? true,
      dailyReelsMax: settings?.dailyReelsMax ?? 1,
      connectedProviders: connected.map((c) => c.provider),
      hasChannel: channelCount > 0,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      ok: false,
      error: message.split("\n")[0]?.slice(0, 160) ?? "Baza xatosi",
    };
  }
}

/**
 * Yuqori paneldagi holat indikatori uchun yagona o'qish.
 * Baza ulanmagan bo'lsa ham panel ishlashi kerak — shuning uchun xato
 * yutiladi va holat "baza ulanmagan" ko'rinishida qaytadi.
 * `cache` — bir so'rov ichida takroriy o'qishlarni birlashtiradi.
 */
export const getSystemSnapshot = cache(loadSystemSnapshot);
