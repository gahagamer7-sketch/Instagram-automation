import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace paketlari TypeScript manba sifatida eksport qilinadi —
  // Next ularni o'zi transpile qilishi kerak.
  transpilePackages: [
    "@autochannel/ai",
    "@autochannel/core",
    "@autochannel/crypto",
    "@autochannel/db",
    "@autochannel/integrations",
  ],
  // Prisma va FFmpeg native paketlari runtime'da tashqarida qolsin.
  serverExternalPackages: ["@prisma/client", ".prisma/client", "ffmpeg-static"],
  outputFileTracingIncludes: {
    "/reels/create": [
      "./node_modules/ffmpeg-static/**/*",
      "../../node_modules/.pnpm/ffmpeg-static*/node_modules/ffmpeg-static/**/*",
      "../../packages/core/fonts/**/*",
    ],
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
