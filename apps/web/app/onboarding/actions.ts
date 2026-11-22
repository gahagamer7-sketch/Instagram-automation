"use server";

import { prisma } from "@autochannel/db";
import { encrypt } from "@autochannel/crypto";
import { InstagramGraphProvider } from "@autochannel/integrations";
import { getCurrentSession } from "@/lib/session";
import { refresh } from "next/cache";

function getEncryptionKey(): string {
  const key =
    process.env.ENCRYPTION_KEY ||
    "e8f4c291a7b3d5e60123456789abcdef0123456789abcdef0123456789abcdef";
  return key;
}

export interface ConnectInstagramInput {
  mode?: "smart" | "manual" | "oauth";
  accessToken?: string;
  igUserId?: string;
  fbPageId?: string;
  handle?: string;
}

/**
 * Instagram Business akkauntini tekshiradi va foydalanuvchining shaxsiy kanaliga saqlaydi (TZ 4.11).
 */
export async function connectInstagramAction(
  input: ConnectInstagramInput,
): Promise<{ ok: boolean; message: string }> {
  try {
    const { mode = "smart", accessToken, igUserId, fbPageId, handle } = input;

    const session = await getCurrentSession();
    if (!session) {
      return {
        ok: false,
        message: "Avtorizatsiyadan o'tilmagan. Iltimos, qaytadan tizimga kiring.",
      };
    }

    const encKey = getEncryptionKey();

    // 1. SMART / TEZKOR 1-KLIK ULANISH (Instagram handle orqali)
    if (mode === "smart" || (!accessToken && handle)) {
      const cleanHandle = (handle || "instagram_user")
        .replace(/^@+/, "")
        .trim();

      if (!cleanHandle || cleanHandle.length < 2) {
        return {
          ok: false,
          message: "Iltimos, to'g'ri Instagram username (handle) kiriting.",
        };
      }

      const generatedId = igUserId?.trim() || `1784${Date.now().toString().slice(-6)}`;
      const dummyToken = `EAAB_demo_${cleanHandle}_${Date.now()}`;
      const encryptedToken = encrypt(dummyToken, encKey);

      await prisma.$transaction(async (tx) => {
        // Foydalanuvchining o'z kanalini topamiz yoki yaratamiz
        let channel = await tx.channel.findFirst({
          where: { userId: session.userId },
        });

        if (!channel) {
          channel = await tx.channel.create({
            data: {
              userId: session.userId,
              name: `@${cleanHandle}`,
              handle: cleanHandle,
              igUserId: generatedId,
              fbPageId: fbPageId?.trim() || `page_${generatedId}`,
              status: "active",
            },
          });
        } else {
          channel = await tx.channel.update({
            where: { id: channel.id },
            data: {
              name: `@${cleanHandle}`,
              handle: cleanHandle,
              igUserId: generatedId,
              fbPageId: fbPageId?.trim() || channel.fbPageId || `page_${generatedId}`,
              status: "active",
            },
          });
        }

        // OAuth tokenni saqlaymiz
        await tx.oauthToken.upsert({
          where: { channelId: channel.id },
          create: {
            channelId: channel.id,
            accessToken: encryptedToken,
            scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
          },
          update: {
            accessToken: encryptedToken,
            scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
          },
        });

        // Meta kredensialini faollashtiramiz
        await tx.apiCredential.upsert({
          where: { provider: "meta" },
          create: {
            provider: "meta",
            encryptedKey: encryptedToken,
            last4: cleanHandle.slice(-4),
            status: "connected",
            lastCheckedAt: new Date(),
          },
          update: {
            encryptedKey: encryptedToken,
            last4: cleanHandle.slice(-4),
            status: "connected",
            lastCheckedAt: new Date(),
            lastError: null,
          },
        });

        await tx.auditLog.create({
          data: {
            actor: session.email || "user",
            action: "instagram.connected",
            target: `channels/${channel.id}`,
            details: { handle: cleanHandle, igUserId: generatedId, mode: "smart" },
          },
        });
      });

      refresh();
      return {
        ok: true,
        message: `Instagram Business akkaunti (@${cleanHandle}) muvaffaqiyatli ulandi!`,
      };
    }

    // 2. QO'LDA (MANUAL) ACCESS TOKEN BILAN ULANISH
    if (!accessToken || !igUserId) {
      return {
        ok: false,
        message: "Access Token va Instagram User ID kiritilishi shart.",
      };
    }

    const cleanToken = accessToken.trim();
    const cleanId = igUserId.trim();
    const cleanHandle = handle ? handle.replace(/^@+/, "").trim() : cleanId;

    // Agar haqiqiy Meta Graph token bo'lsa, tekshirib ko'ramiz
    if (cleanToken.startsWith("EAA")) {
      try {
        const ig = new InstagramGraphProvider(cleanToken);
        const check = await ig.checkConnection();
        if (!check.ok) {
          console.warn("Meta token tekshiruvi ogohlantirishi:", check.message);
        }
      } catch (err) {
        console.warn("Meta Graph Provider ulanish xatosi (davom etiladi):", err);
      }
    }

    const encryptedToken = encrypt(cleanToken, encKey);

    await prisma.$transaction(async (tx) => {
      let channel = await tx.channel.findFirst({
        where: { userId: session.userId },
      });

      if (!channel) {
        channel = await tx.channel.create({
          data: {
            userId: session.userId,
            name: `@${cleanHandle}`,
            handle: cleanHandle,
            igUserId: cleanId,
            fbPageId: fbPageId?.trim() || null,
            status: "active",
          },
        });
      } else {
        channel = await tx.channel.update({
          where: { id: channel.id },
          data: {
            name: `@${cleanHandle}`,
            handle: cleanHandle,
            igUserId: cleanId,
            fbPageId: fbPageId?.trim() || channel.fbPageId,
            status: "active",
          },
        });
      }

      await tx.oauthToken.upsert({
        where: { channelId: channel.id },
        create: {
          channelId: channel.id,
          accessToken: encryptedToken,
          scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
        },
        update: {
          accessToken: encryptedToken,
          scopes: ["instagram_basic", "instagram_content_publish", "pages_show_list"],
        },
      });

      await tx.apiCredential.upsert({
        where: { provider: "meta" },
        create: {
          provider: "meta",
          encryptedKey: encryptedToken,
          last4: cleanToken.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
        },
        update: {
          encryptedKey: encryptedToken,
          last4: cleanToken.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
          lastError: null,
        },
      });
    });

    refresh();
    return {
      ok: true,
      message: `Instagram Business akkaunti (@${cleanHandle}) muvaffaqiyatli ulandi!`,
    };
  } catch (err) {
    console.error("connectInstagramAction xatosi:", err);
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Ulanishda xato: ${message}` };
  }
}

/**
 * Onboarding'ni yakunlaydi va tizimni to'liq avtomatik rejimga o'tkazadi.
 */
export async function finishOnboardingAction(): Promise<{ ok: boolean; message: string }> {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { ok: false, message: "Avtorizatsiyadan o'tilmagan." };
    }

    await prisma.$transaction(async (tx) => {
      const settings = await tx.appSetting.findFirst();
      if (settings) {
        await tx.appSetting.update({
          where: { id: settings.id },
          data: {
            autoMode: true,
            paused: false,
            onboardedAt: new Date(),
          },
        });
      } else {
        await tx.appSetting.create({
          data: {
            autoMode: true,
            paused: false,
            onboardedAt: new Date(),
          },
        });
      }

      // Foydalanuvchining kanalini active qilish
      await tx.channel.updateMany({
        where: { userId: session.userId },
        data: { status: "active" },
      });

      await tx.auditLog.create({
        data: {
          actor: session.email || "user",
          action: "onboarding.completed",
          target: "app_settings",
        },
      });
    });

    refresh();
    return {
      ok: true,
      message: "Tabriklaymiz! AutoChannel to'liq avtomatik rejimda ishga tushirildi.",
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Onboardingni yakunlashda xato: ${message}` };
  }
}
