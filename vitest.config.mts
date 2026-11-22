import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./apps/web", import.meta.url)),
    },
  },
  test: {
    environment: "node",
    setupFiles: ["test/setup-env.ts"],
    include: [
      "apps/web/lib/**/*.test.ts",
      "packages/*/src/**/*.test.ts",
    ],
  },
});
