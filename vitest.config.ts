import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // Node until the first component test; jsdom and React Testing Library come with phase 4.
    environment: "node",
    include: ["**/*.test.{ts,tsx}"],
    exclude: ["node_modules/**", "e2e/**", ".next/**", "out/**"],
  },
});
