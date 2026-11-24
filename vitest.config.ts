import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    // The same "@/" as tsconfig.json's paths.
    alias: { "@": fileURLToPath(new URL("./", import.meta.url)) },
  },
  test: {
    // Node by default; component tests opt into jsdom with `// @vitest-environment jsdom`.
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "e2e/**", ".next/**", "out/**"],
  },
});
