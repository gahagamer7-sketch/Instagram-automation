export interface MetaUnifiedLoginEnvConfig {
  appId: string;
  appSecret: string;
  configId: string;
  redirectUri?: string;
  apiVersion: string;
}

/**
 * Meta Unified Login (Facebook Login for Business) muhit o'zgaruvchilarini tekshiradi va qaytaradi.
 * 2026 yangi Meta Developer App arxitekturasi uchun maxsus.
 */
export function getMetaUnifiedLoginConfig(origin?: string): MetaUnifiedLoginEnvConfig {
  const appId = (process.env.META_APP_ID || process.env.INSTAGRAM_APP_ID || "").trim();
  const appSecret = (process.env.META_APP_SECRET || process.env.INSTAGRAM_APP_SECRET || "").trim();
  const configId = (
    process.env.META_INSTAGRAM_CONFIG_ID ||
    process.env.META_CONFIG_ID ||
    process.env.INSTAGRAM_CONFIG_ID ||
    ""
  ).trim();
  const apiVersion = (process.env.META_GRAPH_API_VERSION || "v21.0").trim();
  const explicitRedirectUri = process.env.META_REDIRECT_URI?.trim();

  const missing: string[] = [];
  if (!appId) missing.push("META_APP_ID");
  if (!appSecret) missing.push("META_APP_SECRET");
  if (!configId) missing.push("META_INSTAGRAM_CONFIG_ID");

  if (missing.length > 0) {
    throw new Error(
      `Meta Unified Login konfiguratsiyasi to'liq emas. Yetishmayotgan o'zgaruvchilar: ${missing.join(
        ", ",
      )}. Iltimos, Vercel yoki .env.local da ushbu kalitlarni belgilang.`,
    );
  }

  const redirectUri =
    explicitRedirectUri || (origin ? `${origin}/api/auth/instagram/callback` : undefined);

  return {
    appId,
    appSecret,
    configId,
    redirectUri,
    apiVersion,
  };
}
