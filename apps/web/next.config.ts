import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Workspace paketlari TypeScript manba sifatida eksport qilinadi —
  // Next ularni o'zi transpile qilishi kerak.
  transpilePackages: [
    "@autochannel/ai",
    "@autochannel/core",
    "@autochannel/crypto",
    "@autochannel/db",
  ],
  // Prisma'ning query engine'i Node.js runtime'da tashqarida qolsin.
  serverExternalPackages: ["@prisma/client", ".prisma/client"],
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
