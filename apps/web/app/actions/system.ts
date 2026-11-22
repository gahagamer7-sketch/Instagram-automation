"use server";

import { prisma } from "@autochannel/db";
import { refresh } from "next/cache";

/**
 * "To'xtatish" / "Davom ettirish" tugmasi (TZ 4.5, 4.12).
 * Butun tizimni darhol to'xtatadi: cron'lar `paused` bo'lsa job yaratmaydi.
 */
export async function toggleSystem(): Promise<void> {
  const settings = await prisma.appSetting.findFirst();

  if (!settings) {
    await prisma.appSetting.create({
      data: { paused: true, pauseReason: "Admin to'xtatdi" },
    });
  } else {
    const nextPaused = !settings.paused;
    await prisma.appSetting.update({
      where: { id: settings.id },
      data: {
        paused: nextPaused,
        pauseReason: nextPaused ? "Admin to'xtatdi" : null,
      },
    });
    await prisma.auditLog.create({
      data: {
        actor: "admin",
        action: nextPaused ? "system.pause" : "system.resume",
        target: "app_settings",
      },
    });
  }

  refresh();
}
