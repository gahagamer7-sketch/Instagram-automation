import { NextResponse, type NextRequest } from "next/server";
import { InstagramGraphProvider } from "@autochannel/integrations";
import { getMetaUnifiedLoginConfig } from "@/lib/meta-config";
import crypto from "node:crypto";

export async function GET(request: NextRequest) {
  const from = request.nextUrl.searchParams.get("from") || "/onboarding?step=4";
  const isPopup = request.nextUrl.searchParams.get("popup") === "1";
  const origin = request.nextUrl.origin;

  let config;
  try {
    config = getMetaUnifiedLoginConfig(origin);
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (isPopup) {
      const html = `
        <!DOCTYPE html>
        <html>
          <body style="background:#0f172a;color:#f8fafc;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;">
            <script>
              if (window.opener) {
                window.opener.postMessage({
                  type: 'INSTAGRAM_ERROR',
                  error: 'missing_config',
                  message: ${JSON.stringify(errorMsg)}
                }, '*');
                window.close();
              } else {
                window.location.href = '${from}${from.includes("?") ? "&" : "?"}instagram_error=' + encodeURIComponent(${JSON.stringify(errorMsg)});
              }
            </script>
            <p>${errorMsg}</p>
          </body>
        </html>
      `;
      return new NextResponse(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    const url = new URL(from, request.url);
    url.searchParams.set("instagram_error", errorMsg);
    return NextResponse.redirect(url);
  }

  // CSRF himoyasi: 32 baytli kriptografik tasodifiy token
  const csrfToken = crypto.randomBytes(32).toString("hex");

  const statePayload = {
    csrf: csrfToken,
    from,
    popup: isPopup ? 1 : 0,
    timestamp: Date.now(),
  };

  const state = Buffer.from(JSON.stringify(statePayload)).toString("base64url");

  // Meta Unified Login (Facebook Login for Business):
  // https://www.facebook.com/{GRAPH_API_VERSION}/dialog/oauth
  // Parametrlar: client_id, config_id, redirect_uri, response_type=code, override_default_response_type=true, state
  const oauthUrl = InstagramGraphProvider.buildUnifiedLoginOAuthUrl({
    appId: config.appId,
    configId: config.configId,
    redirectUri: config.redirectUri || `${origin}/api/auth/instagram/callback`,
    apiVersion: config.apiVersion,
    overrideDefaultResponseType: true,
    state,
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
