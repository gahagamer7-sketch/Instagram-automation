import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@autochannel/db";
import { encrypt } from "@autochannel/crypto";
import { InstagramGraphProvider } from "@autochannel/integrations";
import { getCurrentSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const cookieState = request.cookies.get("meta_oauth_state")?.value;

  let from = "/onboarding?step=4";
  try {
    if (state) {
      const decoded = JSON.parse(
        Buffer.from(state, "base64url").toString("utf8"),
      );
      if (decoded.from) from = decoded.from;
    }
  } catch {}

  const redirectUrl = new URL(from, request.url);

  if (error || !code) {
    redirectUrl.searchParams.set(
      "meta_error",
      errorDescription || error || "Kirish bekor qilindi",
    );
    return NextResponse.redirect(redirectUrl);
  }

  if (!cookieState || cookieState !== state) {
    redirectUrl.searchParams.set("meta_error", "CSRF holati mos kelmadi");
    return NextResponse.redirect(redirectUrl);
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const encKey = process.env.ENCRYPTION_KEY;

  if (!appId || !appSecret || !encKey) {
    redirectUrl.searchParams.set(
      "meta_error",
      "Serverda META kalitlari sozlanmagan",
    );
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const origin = request.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/meta/callback`;

    // 1. Qisqa muddatli access tokenga almashtirish
    const shortLived = await InstagramGraphProvider.exchangeCodeForToken(
      code,
      appId,
      appSecret,
      redirectUri,
    );

    // 2. 60 kunlik Long-Lived tokenga almashtirish
    const igShort = new InstagramGraphProvider(shortLived.accessToken);
    const longLived = await igShort.exchangeLongLivedToken(appId, appSecret);

    // 3. Instagram Business akkauntlarini tekshirish va ma'lumotlarni olish
    const igLong = new InstagramGraphProvider(longLived.accessToken);
    const check = await igLong.checkConnection();

    if (!check.ok || !check.accounts || check.accounts.length === 0) {
      redirectUrl.searchParams.set(
        "meta_error",
        check.message || "Instagram Business akkaunti topilmadi",
      );
      return NextResponse.redirect(redirectUrl);
    }

    const account = check.accounts[0]; // Asosiy Instagram Business akkaunt
    const encryptedToken = encrypt(longLived.accessToken, encKey);
    const expiresAt = new Date(Date.now() + longLived.expiresIn * 1000);

    // 4. DB'ga saqlash (foydalanuvchining shaxsiy kanaliga bog'laymiz)
    const session = await getCurrentSession();
    const channelWhere = session ? { userId: session.userId } : {};

    await prisma.$transaction(async (tx) => {
      let channel = await tx.channel.findFirst({ where: channelWhere });
      if (!channel) {
        channel = await tx.channel.create({
          data: {
            userId: session?.userId,
            name: account.igUsername,
            handle: account.igUsername,
            igUserId: account.igUserId,
            fbPageId: account.pageId,
            status: "active",
          },
        });
      } else {
        channel = await tx.channel.update({
          where: { id: channel.id },
          data: {
            handle: account.igUsername,
            igUserId: account.igUserId,
            fbPageId: account.pageId,
            status: "active",
          },
        });
      }

      await tx.oauthToken.upsert({
        where: { channelId: channel.id },
        create: {
          channelId: channel.id,
          accessToken: encryptedToken,
          expiresAt,
          scopes: [
            "instagram_basic",
            "instagram_content_publish",
            "pages_show_list",
          ],
        },
        update: {
          accessToken: encryptedToken,
          expiresAt,
          scopes: [
            "instagram_basic",
            "instagram_content_publish",
            "pages_show_list",
          ],
        },
      });

      await tx.apiCredential.upsert({
        where: { provider: "meta" },
        create: {
          provider: "meta",
          encryptedKey: encryptedToken,
          last4: longLived.accessToken.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
        },
        update: {
          encryptedKey: encryptedToken,
          last4: longLived.accessToken.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
          lastError: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actor: "oauth.meta",
          action: "instagram.connected",
          target: `channels/${channel.id}`,
          details: {
            igUserId: account.igUserId,
            igUsername: account.igUsername,
            expiresAt: expiresAt.toISOString(),
          },
        },
      });
    });

    redirectUrl.searchParams.set("meta_success", "1");
    redirectUrl.searchParams.set("handle", account.igUsername);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("meta_oauth_state");
    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    redirectUrl.searchParams.set("meta_error", msg);
    return NextResponse.redirect(redirectUrl);
  }
}

