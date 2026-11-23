import { NextResponse, type NextRequest } from "next/server";
import { InstagramGraphProvider } from "@autochannel/integrations";

export async function GET(request: NextRequest) {
  const appId = process.env.INSTAGRAM_APP_ID || process.env.META_APP_ID;
  const from = request.nextUrl.searchParams.get("from") || "/onboarding?step=4";
  const isPopup = request.nextUrl.searchParams.get("popup") === "1";

  if (!appId) {
    if (isPopup) {
      const html = `
        <!DOCTYPE html>
        <html>
          <body>
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'INSTAGRAM_ERROR',
                  error: 'missing_app_id',
                  message: 'Meta/Instagram App ID sozlanmagan'
                }, '*');
                window.close();
              } else {
                window.location.href = '${from}${from.includes("?") ? "&" : "?"}meta_error=missing_app_id';
              }
            </script>
            <p style="font-family:sans-serif;padding:20px;text-align:center;">Meta/Instagram App ID sozlanmagan...</p>
          </body>
        </html>
      `;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const url = new URL(from, request.url);
    url.searchParams.set("meta_error", "missing_app_id");
    return NextResponse.redirect(url);
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/instagram/callback`;
  const state = Buffer.from(
    JSON.stringify({
      csrf: crypto.randomUUID(),
      from,
      popup: isPopup ? 1 : 0,
    }),
  ).toString("base64url");

  const oauthUrl = InstagramGraphProvider.buildInstagramOAuthUrl({
    appId,
    redirectUri,
    state,
  });

  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set("instagram_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 daqiqa
  });

  return response;
}

