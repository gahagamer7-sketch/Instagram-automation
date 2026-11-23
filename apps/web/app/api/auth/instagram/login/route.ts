import { NextResponse, type NextRequest } from "next/server";
import { InstagramGraphProvider } from "@autochannel/integrations";
import crypto from "node:crypto";

export async function GET(request: NextRequest) {
  const appId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID;
  const from = request.nextUrl.searchParams.get("from") || "/onboarding?step=4";
  const isPopup = request.nextUrl.searchParams.get("popup") === "1";

  if (!appId) {
    if (isPopup) {
      const html = `
        <!DOCTYPE html>
        <html>
          <body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'INSTAGRAM_ERROR',
                  error: 'missing_app_id',
                  message: 'INSTAGRAM_APP_ID sozlanmagan. Iltimos, Meta App Dashboard orqali Instagram App ID kiriting.'
                }, '*');
                window.close();
              } else {
                window.location.href = '${from}${from.includes("?") ? "&" : "?"}instagram_error=missing_app_id';
              }
            </script>
            <p>Instagram App ID sozlanmagan...</p>
          </body>
        </html>
      `;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const url = new URL(from, request.url);
    url.searchParams.set("instagram_error", "missing_app_id");
    return NextResponse.redirect(url);
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/instagram/callback`;

  // CSRF himoyasi: 32 baytli kriptografik tasodifiy token
  const csrfToken = crypto.randomBytes(32).toString("hex");

  const statePayload = {
    csrf: csrfToken,
    from,
    popup: isPopup ? 1 : 0,
    timestamp: Date.now(),
  };

  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  // Rasmiy native Instagram OAuth URL:
  // https://www.instagram.com/oauth/authorize
  const oauthUrl = InstagramGraphProvider.buildInstagramOAuthUrl({
    appId,
    redirectUri,
    state,
    scopes: [
      "instagram_business_basic",
      "instagram_business_content_publish",
      "instagram_business_manage_comments",
      "instagram_business_manage_messages",
    ],
    enableFbLogin: false, // Facebook login muqobilini ko'rsatmaslik
    forceAuthentication: true, // Instagram kirish oynasini majburiy chiqarish
  });

  const response = NextResponse.redirect(oauthUrl);

  // CSRF holatini xavfsiz HttpOnly cookie'ga saqlaymiz
  response.cookies.set("instagram_oauth_state", csrfToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 daqiqa
  });

  return response;
}
