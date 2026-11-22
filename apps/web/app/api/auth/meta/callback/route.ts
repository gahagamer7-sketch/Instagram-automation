import { NextResponse, type NextRequest } from "next/server";
import { prisma } from "@autochannel/db";
import { encrypt } from "@autochannel/crypto";
import { InstagramGraphProvider } from "@autochannel/integrations";
import { getCurrentSession } from "@/lib/session";

function renderPopupResult(data: {
  ok: boolean;
  handle?: string;
  igUserId?: string;
  error?: string;
  from?: string;
}) {
  const fallbackUrl = (data.from || "/onboarding?step=4") +
    (data.from?.includes("?") ? "&" : "?") +
    (data.ok
      ? `meta_success=1&handle=${encodeURIComponent(data.handle || "")}`
      : `meta_error=${encodeURIComponent(data.error || "Ulanishda xatolik yuz berdi")}`);

  const html = `
    <!DOCTYPE html>
    <html lang="uz">
      <head>
        <meta charset="utf-8" />
        <title>Meta Ulanishi</title>
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
          }
          .title { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
          .desc { font-size: 13px; color: #94a3b8; }
          .spinner {
            margin: 20px auto;
            width: 32px;
            height: 32px;
            border: 3px solid rgba(255,255,255,0.1);
            border-top-color: #38bdf8;
            border-radius: 50%;
            animation: spin 0.8s linear infinite;
          }
          @keyframes spin { to { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="spinner"></div>
          <div class="title">${data.ok ? "Akkaunt ulandi!" : "Xatolik yuz berdi"}</div>
          <div class="desc">${data.ok ? "Oyna yopilmoqda..." : (data.error || "Iltimos, kuting...")}</div>
        </div>
        <script>
          const payload = ${JSON.stringify(data)};
          try {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({
                type: payload.ok ? 'INSTAGRAM_CONNECTED' : 'INSTAGRAM_ERROR',
                handle: payload.handle,
                igUserId: payload.igUserId,
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
  const errorDescription = searchParams.get("error_description");

  const cookieState = request.cookies.get("meta_oauth_state")?.value;

  let from = "/onboarding?step=4";
  let isPopup = false;
  try {
    if (state) {
      const decoded = JSON.parse(
        Buffer.from(state, "base64url").toString("utf8"),
      );
      if (decoded.from) from = decoded.from;
      if (decoded.popup) isPopup = Boolean(decoded.popup);
    }
  } catch {}

  const redirectUrl = new URL(from, request.url);

  if (error || !code) {
    const errorMsg = errorDescription || error || "Kirish bekor qilindi";
    if (isPopup) {
      return renderPopupResult({ ok: false, error: errorMsg, from });
    }
    redirectUrl.searchParams.set("meta_error", errorMsg);
    return NextResponse.redirect(redirectUrl);
  }

  if (!cookieState || cookieState !== state) {
    const errorMsg = "CSRF holati mos kelmadi";
    if (isPopup) {
      return renderPopupResult({ ok: false, error: errorMsg, from });
    }
    redirectUrl.searchParams.set("meta_error", errorMsg);
    return NextResponse.redirect(redirectUrl);
  }

  const appId = process.env.META_APP_ID;
  const appSecret = process.env.META_APP_SECRET;
  const encKey = process.env.ENCRYPTION_KEY;

  if (!appId || !appSecret || !encKey) {
    const errorMsg = "Serverda META kalitlari sozlanmagan";
    if (isPopup) {
      return renderPopupResult({ ok: false, error: errorMsg, from });
    }
    redirectUrl.searchParams.set("meta_error", errorMsg);
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

    if (isPopup) {
      const response = renderPopupResult({
        ok: true,
        handle: account.igUsername,
        igUserId: account.igUserId,
        from,
      });
      response.cookies.delete("meta_oauth_state");
      return response;
    }

    redirectUrl.searchParams.set("meta_success", "1");
    redirectUrl.searchParams.set("handle", account.igUsername);

    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("meta_oauth_state");
    return response;
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    if (isPopup) {
      return renderPopupResult({ ok: false, error: msg, from });
    }
    redirectUrl.searchParams.set("meta_error", msg);
    return NextResponse.redirect(redirectUrl);
  }
}

