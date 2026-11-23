import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@autochannel/db";
import { encrypt } from "@autochannel/crypto";
import { InstagramGraphProvider } from "@autochannel/integrations";
import { getCurrentSession } from "@/lib/session";

function renderPopupResult(data: {
  ok: boolean;
  handle?: string;
  igUserId?: string;
  profilePictureUrl?: string;
  accountType?: string;
  error?: string;
  from?: string;
}) {
  const fallbackUrl =
    (data.from || "/onboarding?step=4") +
    (data.from?.includes("?") ? "&" : "?") +
    (data.ok
      ? `instagram_success=1&handle=${encodeURIComponent(data.handle || "")}`
      : `instagram_error=${encodeURIComponent(data.error || "Ulanishda xatolik yuz berdi")}`);

  const html = `
    <!DOCTYPE html>
    <html lang="uz">
      <head>
        <meta charset="utf-8" />
        <title>Instagram Ulanishi</title>
        <style>
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            background: #0f172a;
            color: #f8fafc;
          }
          .card {
            text-align: center;
            padding: 30px;
            border-radius: 16px;
            background: #1e293b;
            border: 1px solid #334155;
            max-width: 400px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5);
          }
          .title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
          .desc { font-size: 13px; color: #94a3b8; }
          .spinner {
            margin: 20px auto;
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: #e1306c;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <div class="title">${data.ok ? "Instagram muvaffaqiyatli ulandi!" : "Xatolik yuz berdi"}</div>
          <div class="desc">${data.ok ? `@${data.handle || "akkaunt"} ulandi. Oyna yopilmoqda...` : (data.error || "Iltimos, kuting...")}</div>
        </div>
        <script>
          const payload = ${JSON.stringify(data)};
          try {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({
                type: payload.ok ? 'INSTAGRAM_CONNECTED' : 'INSTAGRAM_ERROR',
                handle: payload.handle,
                igUserId: payload.igUserId,
                profilePictureUrl: payload.profilePictureUrl,
                accountType: payload.accountType,
                error: payload.error
              }, '*');
              setTimeout(() => window.close(), 600);
            } else {
              window.location.href = ${JSON.stringify(fallbackUrl)};
            }
          } catch (e) {
            window.location.href = ${JSON.stringify(fallbackUrl)};
          }
        </script>
      </body>
    </html>
  `;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorReason = searchParams.get("error_reason");
  const errorDescription = searchParams.get("error_description");

  const cookieCsrf = request.cookies.get("instagram_oauth_state")?.value;

  let from = "/onboarding?step=4";
  let isPopup = false;
  let stateCsrf: string | null = null;

  try {
    if (state) {
      const decoded = JSON.parse(
        Buffer.from(state, "base64url").toString("utf8"),
      );
      if (decoded.from) from = decoded.from;
      if (decoded.popup) isPopup = Boolean(decoded.popup);
      if (decoded.csrf) stateCsrf = decoded.csrf;
    }
  } catch {}

  const redirectUrl = new URL(from, request.url);

  // 1. Foydalanuvchi kirishni bekor qilganda yoki xatolik yuz berganda
  if (error || !code) {
    const errorMsg =
      errorDescription || errorReason || error || "Instagram orqali kirish bekor qilindi";
    if (isPopup) {
      return renderPopupResult({ ok: false, error: errorMsg, from });
    }
    redirectUrl.searchParams.set("instagram_error", errorMsg);
    return NextResponse.redirect(redirectUrl);
  }

  // 2. CSRF tekshiruvi (state va cookie mos kelishi shart)
  if (!cookieCsrf || !stateCsrf || cookieCsrf !== stateCsrf) {
    const errorMsg = "Xavfsizlik tekshiruvi muvaffaqiyatsiz (CSRF mos kelmadi). Qaytadan urinib ko'ring.";
    if (isPopup) {
      return renderPopupResult({ ok: false, error: errorMsg, from });
    }
    redirectUrl.searchParams.set("instagram_error", errorMsg);
    return NextResponse.redirect(redirectUrl);
  }

  const appId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID;
  const appSecret = process.env.INSTAGRAM_APP_SECRET || process.env.META_APP_SECRET;
  const encKey =
    process.env.ENCRYPTION_KEY ||
    "e8f4c291a7b3d5e60123456789abcdef0123456789abcdef0123456789abcdef";

  if (!appId || !appSecret) {
    const errorMsg = "Serverda Instagram App ID yoki App Secret sozlanmagan";
    if (isPopup) {
      return renderPopupResult({ ok: false, error: errorMsg, from });
    }
    redirectUrl.searchParams.set("instagram_error", errorMsg);
    return NextResponse.redirect(redirectUrl);
  }

  try {
    const origin = request.nextUrl.origin;
    const redirectUri = `${origin}/api/auth/instagram/callback`;

    // 3. Authorization Code ni Access Tokenga almashtirish (POST https://api.instagram.com/oauth/access_token)
    const shortLived = await InstagramGraphProvider.exchangeInstagramCodeForToken({
      code,
      appId,
      appSecret,
      redirectUri,
    });

    // 4. Qisqa muddatli tokenni 60 kunlik Long-Lived tokenga almashtirish (GET https://graph.instagram.com/access_token)
    const longLived = await InstagramGraphProvider.exchangeInstagramLongLivedToken({
      shortLivedToken: shortLived.accessToken,
      appSecret,
    });

    // 5. Instagram Graph API orqali professional profil ma'lumotlarini olish (GET https://graph.instagram.com/v21.0/me)
    const profile = await InstagramGraphProvider.getInstagramProfile(longLived.accessToken);

    if (!profile.id || !profile.username) {
      throw new Error("Instagram akkaunti ma'lumotlarini aniqlab bo'lmadi");
    }

    // Professional (Business yoki Creator) hisob ekanligini tekshirish
    if (
      profile.accountType &&
      profile.accountType !== "BUSINESS" &&
      profile.accountType !== "MEDIA_CREATOR" &&
      profile.accountType !== "CREATOR"
    ) {
      throw new Error(
        `Instagram akkaunti turi: ${profile.accountType}. Avtomatlashtirish uchun akkauntingiz Instagram ilovasida Professional (Business yoki Creator) holatiga o'tkazilgan bo'lishi kerak.`
      );
    }

    const encryptedToken = encrypt(longLived.accessToken, encKey);
    const expiresAt = new Date(Date.now() + longLived.expiresIn * 1000);

    // 6. Foydalanuvchining kanalini bazada yaratish / yangilash
    const session = await getCurrentSession();
    if (!session) {
      throw new Error("Avtorizatsiyadan o'tilmagan. Iltimos, tizimga qayta kiring.");
    }

    await prisma.$transaction(async (tx) => {
      // Bir xil igUserId bo'yicha boshqa foydalanuvchining kanali bo'lsa uni bo'shatamiz
      const existingOther = await tx.channel.findFirst({
        where: { igUserId: profile.id, NOT: { userId: session.userId } },
      });
      if (existingOther) {
        await tx.channel.update({
          where: { id: existingOther.id },
          data: { status: "paused", igUserId: null, handle: null },
        });
      }

      let channel = await tx.channel.findFirst({
        where: { userId: session.userId },
      });

      if (!channel) {
        channel = await tx.channel.create({
          data: {
            userId: session.userId,
            name: profile.name || `@${profile.username}`,
            handle: profile.username,
            igUserId: profile.id,
            fbPageId: `ig_${profile.id}`,
            status: "active",
          },
        });
      } else {
        channel = await tx.channel.update({
          where: { id: channel.id },
          data: {
            name: profile.name || `@${profile.username}`,
            handle: profile.username,
            igUserId: profile.id,
            fbPageId: `ig_${profile.id}`,
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
            "instagram_business_basic",
            "instagram_business_content_publish",
            "instagram_business_manage_comments",
            "instagram_business_manage_messages",
          ],
        },
        update: {
          accessToken: encryptedToken,
          expiresAt,
          scopes: [
            "instagram_business_basic",
            "instagram_business_content_publish",
            "instagram_business_manage_comments",
            "instagram_business_manage_messages",
          ],
        },
      });

      await tx.apiCredential.upsert({
        where: { provider: "meta" },
        create: {
          provider: "meta",
          encryptedKey: encryptedToken,
          last4: profile.username.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
        },
        update: {
          encryptedKey: encryptedToken,
          last4: profile.username.slice(-4),
          status: "connected",
          lastCheckedAt: new Date(),
          lastError: null,
        },
      });

      await tx.auditLog.create({
        data: {
          actor: session.email || "oauth.instagram",
          action: "instagram.oauth_connected",
          target: `channels/${channel.id}`,
          details: {
            igUserId: profile.id,
            handle: profile.username,
            accountType: profile.accountType,
            expiresAt: expiresAt.toISOString(),
          },
        },
      });
    });

    const response = isPopup
      ? renderPopupResult({
          ok: true,
          handle: profile.username,
          igUserId: profile.id,
          profilePictureUrl: profile.profilePictureUrl,
          accountType: profile.accountType,
          from,
        })
      : NextResponse.redirect(
          `${from}${from.includes("?") ? "&" : "?"}instagram_connected=1&handle=${encodeURIComponent(
            profile.username,
          )}`,
        );

    // CSRF cookie ni tozalaymiz
    response.cookies.delete("instagram_oauth_state");
    return response;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (isPopup) {
      return renderPopupResult({ ok: false, error: errorMsg, from });
    }
    redirectUrl.searchParams.set("instagram_error", errorMsg);
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("instagram_oauth_state");
    return response;
  }
}
