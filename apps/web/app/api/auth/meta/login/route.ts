import { NextResponse, type NextRequest } from "next/server";
import { InstagramGraphProvider } from "@autochannel/integrations";

export async function GET(request: NextRequest) {
  const appId = process.env.META_APP_ID;
  const from = request.nextUrl.searchParams.get("from") || "/onboarding?step=4";

  if (!appId) {
    const url = new URL(from, request.url);
    url.searchParams.set("meta_error", "missing_app_id");
    return NextResponse.redirect(url);
  }

  const origin = request.nextUrl.origin;
  const redirectUri = `${origin}/api/auth/meta/callback`;
  const state = Buffer.from(
    JSON.stringify({
      csrf: crypto.randomUUID(),
      from,
    }),
  ).toString("base64url");

  const oauthUrl = InstagramGraphProvider.buildOAuthUrl({
    appId,
    redirectUri,
    state,
  });

  const response = NextResponse.redirect(oauthUrl);
  response.cookies.set("meta_oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600, // 10 daqiqa
  });

  return response;
}

