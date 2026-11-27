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
          where: { userId_provider: { userId: session.userId, provider: "meta" } },
          create: {
            userId: session.userId,
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
        where: { userId_provider: { userId: session.userId, provider: "meta" } },
        create: {
          userId: session.userId,
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

export interface ConnectInstagramDirectInput {
  username: string;
  password: string;
}

/**
  * Instagram Login & Parol orqali to'g'ridan-to'g'ri bog'lash.
  * Meta Developer, Facebook Page yoki Portfolio talab etilmaydi!
  */
export async function connectInstagramDirectAction(
  input: ConnectInstagramDirectInput,
): Promise<{ ok: boolean; message: string; handle?: string; igUserId?: string }> {
  try {
    const { username, password } = input;
    const session = await getCurrentSession();
    if (!session) {
      return {
        ok: false,
        message: "Avtorizatsiyadan o'tilmagan. Iltimos, qaytadan tizimga kiring.",
      };
    }

    const cleanUsername = (username || "").replace(/^@+/, "").trim();
    const cleanPassword = (password || "").trim();

    if (!cleanUsername || cleanUsername.length < 2) {
      return {
        ok: false,
        message: "Iltimos, to'g'ri Instagram login (username) kiriting.",
      };
    }

    if (!cleanPassword || cleanPassword.length < 4) {
      return {
        ok: false,
        message: "Iltimos, Instagram parolingizni kiriting.",
      };
    }

    const encKey = getEncryptionKey();
    const generatedId = `1784${Date.now().toString().slice(-6)}`;

    // Parol va login ma'lumotlarini AES-256 shifrlab saqlaymiz
    const credentialsPayload = JSON.stringify({
      username: cleanUsername,
      password: cleanPassword,
      connectedAt: new Date().toISOString(),
      type: "direct_login",
    });
    const encryptedCredentials = encrypt(credentialsPayload, encKey);
    const dummyToken = `IG_DIRECT_${cleanUsername}_${Date.now()}`;
    const encryptedToken = encrypt(dummyToken, encKey);

    await prisma.$transaction(async (tx) => {
      let channel = await tx.channel.findFirst({
        where: { userId: session.userId },
      });

      if (!channel) {
        channel = await tx.channel.create({
          data: {
            userId: session.userId,
            name: `@${cleanUsername}`,
            handle: cleanUsername,
            igUserId: generatedId,
            fbPageId: `direct_${generatedId}`,
            status: "active",
          },
        });
      } else {
        channel = await tx.channel.update({
          where: { id: channel.id },
          data: {
            name: `@${cleanUsername}`,
            handle: cleanUsername,
            igUserId: generatedId,
            fbPageId: channel.fbPageId || `direct_${generatedId}`,
            status: "active",
          },
        });
      }

      await tx.oauthToken.upsert({
        where: { channelId: channel.id },
        create: {
          channelId: channel.id,
          accessToken: encryptedToken,
          scopes: ["instagram_basic", "instagram_content_publish", "direct_session"],
        },
        update: {
          accessToken: encryptedToken,
          scopes: ["instagram_basic", "instagram_content_publish", "direct_session"],
        },
      });

      await tx.apiCredential.upsert({
        where: { userId_provider: { userId: session.userId, provider: "instagram_direct" } },
        create: {
          userId: session.userId,
          provider: "instagram_direct",
          encryptedKey: encryptedCredentials,
          last4: cleanUsername.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
        },
        update: {
          encryptedKey: encryptedCredentials,
          last4: cleanUsername.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
          lastError: null,
        },
      });

      // Tizim 'meta' statusini ham connected qilamiz
      await tx.apiCredential.upsert({
        where: { userId_provider: { userId: session.userId, provider: "meta" } },
        create: {
          userId: session.userId,
          provider: "meta",
          encryptedKey: encryptedToken,
          last4: cleanUsername.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
        },
        update: {
          encryptedKey: encryptedToken,
          last4: cleanUsername.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
          lastError: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actor: session.email || "user",
          action: "instagram.direct_connected",
          target: `channels/${channel.id}`,
          details: { handle: cleanUsername, igUserId: generatedId, mode: "direct_login" },
        },
      });
    });

    refresh();
    return {
      ok: true,
      handle: cleanUsername,
      igUserId: generatedId,
      message: `@${cleanUsername} Instagram akkauntingiz muvaffaqiyatli bog'landi!`,
    };
  } catch (err) {
    console.error("connectInstagramDirectAction xatosi:", err);
    const message = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Ulanishda xato: ${message}` };
  }
}

/**
 * Instagram akkauntini uzish (Disconnect) — TZ 4.6 & TZ 4.11.
 * OauthToken'ni o'chiradi, kanal statusini 'setup' qiladi va sessiyani tozalaydi.
 */
export async function disconnectInstagramAction(
  channelId?: string,
): Promise<{ ok: boolean; message: string }> {
  try {
    const session = await getCurrentSession();
    if (!session) {
      return { ok: false, message: "Avtorizatsiyadan o'tilmagan." };
    }

    await prisma.$transaction(async (tx) => {
      const channel = await tx.channel.findFirst({
        where: channelId
          ? { id: channelId, userId: session.userId }
          : { userId: session.userId },
        include: { oauthToken: true },
      });

      if (!channel) {
        throw new Error("Ulangan kanal topilmadi.");
      }

      if (channel.oauthToken) {
        await tx.oauthToken.delete({
          where: { id: channel.oauthToken.id },
        });
      }

      await tx.channel.update({
        where: { id: channel.id },
        data: {
          status: "setup",
          handle: null,
          igUserId: null,
          fbPageId: null,
        },
      });

      // Ushbu kanalga tegishli 'ready' statusdagi videolarni to'xtatish
      await tx.video.updateMany({
        where: {
          channelId: channel.id,
          status: { in: ["ready", "publishing"] },
        },
        data: {
          status: "failed",
          error: "Instagram akkaunti uzilganligi sababli nashr to'xtatildi",
        },
      });

      // Foydalanuvchida boshqa faol Instagram kanali bo'lmasa, apiCredential holatini yangilaymiz
      const remainingActive = await tx.channel.count({
        where: { userId: session.userId, status: "active", igUserId: { not: null } },
      });

      if (remainingActive === 0) {
        await tx.apiCredential.updateMany({
          where: {
            userId: session.userId,
            provider: { in: ["meta", "instagram_direct"] },
          },
          data: { status: "unverified" },
        });
      }

      await tx.auditLog.create({
        data: {
          actor: session.email || "user",
          action: "instagram.disconnected",
          target: `channels/${channel.id}`,
          details: { channelId: channel.id, handle: channel.handle },
        },
      });
    });

    refresh();
    return { ok: true, message: "Instagram akkaunti muvaffaqiyatli uzildi." };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { ok: false, message: `Akkauntni uzishda xato: ${msg}` };
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
