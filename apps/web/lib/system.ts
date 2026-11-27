import { cache } from "react";
import { connection } from "next/server";
import { prisma } from "@autochannel/db";

export type SystemSnapshot =
  | {
      ok: true;
      connectedProviders: string[];
    }
  | { ok: false; error: string };

async function loadSystemSnapshot(userId?: string): Promise<SystemSnapshot> {
  // Request vaqtida o'qiladi — Cache Components uchun dinamik nuqta.
  try {
    await connection();
  } catch {
    // Unit test yoki request scope tashqarisida
  }

  try {
    const connected = userId
      ? await prisma.apiCredential.findMany({
          where: { userId, status: "connected" },
          select: { provider: true },
        })
      : [];

    return {
      ok: true,
      connectedProviders: connected.map((c) => c.provider),
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
 * Joriy foydalanuvchining shaxsiy AI kalitlari holatini yuklaydi.
 */
export const getSystemSnapshot = cache(loadSystemSnapshot);
