"use server";

import { prisma } from "@autochannel/db";
import { encrypt } from "@autochannel/crypto";
import { InstagramGraphProvider } from "@autochannel/integrations";
import { refresh } from "next/cache";

function getEncryptionKey(): string {
  const key = process.env.ENCRYPTION_KEY;
  if (!key || key.length < 16) {
    throw new Error("ENCRYPTION_KEY sozlanmagan.");
  }
  return key;
}

export interface ConnectInstagramInput {
  accessToken: string;
  igUserId: string;
  fbPageId?: string;
  handle?: string;
}

/**
 * Instagram Business akkauntini tekshiradi va DB'da saqlaydi (TZ 4.11).
 */
export async function connectInstagramAction(
  input: ConnectInstagramInput,
): Promise<{ ok: boolean; message: string }> {
  try {
    const { accessToken, igUserId, fbPageId, handle } = input;
    if (!accessToken.trim() || !igUserId.trim()) {
      return { ok: false, message: "Access Token va Instagram User ID kiritilishi shart." };
    }

    // 1. Meta Graph API orqali tokenni tekshirish
    const ig = new InstagramGraphProvider(accessToken);
    const check = await ig.checkConnection();
    if (!check.ok) {
      return { ok: false, message: `Token tekshirishda xato: ${check.message}` };
    }

    const encKey = getEncryptionKey();
    const encryptedToken = encrypt(accessToken.trim(), encKey);

    await prisma.$transaction(async (tx) => {
      // 2. Channel topish yoki yaratish
      let channel = await tx.channel.findFirst();
      if (!channel) {
        channel = await tx.channel.create({
          data: {
            name: handle || "Instagram Kanal",
            handle: handle || null,
            igUserId: igUserId.trim(),
            fbPageId: fbPageId?.trim() || null,
            status: "active",
          },
        });
      } else {
        channel = await tx.channel.update({
          where: { id: channel.id },
          data: {
            igUserId: igUserId.trim(),
            fbPageId: fbPageId?.trim() || null,
            handle: handle || channel.handle,
            status: "active",
          },
        });
      }

      // 3. OauthToken yaratish yoki yangilash
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

      // 4. ApiCredential'da Meta holatini 'connected' qilish
      await tx.apiCredential.upsert({
        where: { provider: "meta" },
        create: {
          provider: "meta",
          encryptedKey: encryptedToken,
          last4: accessToken.trim().slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
        },
        update: {
          encryptedKey: encryptedToken,
          last4: accessToken.trim().slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
          lastError: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actor: "admin",
          action: "instagram.connected",
          target: `channels/${channel.id}`,
          details: { igUserId, handle },
        },
      });
    });

    refresh();
    return {
      ok: true,
      message: `Instagram Business akkaunti (@${handle || igUserId}) muvaffaqiyatli ulandi!`,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Ulanishda xato: ${message}` };
  }
}

/**
 * Onboarding'ni yakunlaydi va tizimni to'liq avtomatik rejimga o'tkazadi.
 */
export async function finishOnboardingAction(): Promise<{ ok: boolean; message: string }> {
  try {
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

      await tx.auditLog.create({
        data: {
          actor: "admin",
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

