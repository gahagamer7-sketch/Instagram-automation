"use server";

import { prisma } from "@autochannel/db";
import { refresh } from "next/cache";

export async function retryJobAction(jobId: string): Promise<{ ok: boolean; message: string }> {
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: {
        status: "pending",
        error: null,
        attempts: 0,
        runAt: new Date(),
      },
    });

    await prisma.auditLog.create({
      data: {
        actor: "admin",
        action: "job.retry",
        target: `jobs/${jobId}`,
      },
    });

    refresh();
    return { ok: true, message: "Vazifa navbatga qayta qo'yildi." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Xatolik yuz berdi",
    };
  }
}

export async function cancelJobAction(jobId: string): Promise<{ ok: boolean; message: string }> {
  try {
    await prisma.job.update({
      where: { id: jobId },
      data: { status: "cancelled" },
    });

    await prisma.auditLog.create({
      data: {
        actor: "admin",
        action: "job.cancel",
        target: `jobs/${jobId}`,
      },
    });

    refresh();
    return { ok: true, message: "Vazifa bekor qilindi." };
  } catch (err) {
    return {
      ok: false,
      message: err instanceof Error ? err.message : "Xatolik yuz berdi",
    };
  }
}
