import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole site is static files (decisions/0001).
  output: "export",
  // The design system ships TypeScript source, imported by path.
  transpilePackages: ["@amezquita/design-system"],
  reactStrictMode: true,
  turbopack: {
    resolveAlias: {
      // TEMPORARY OVERRIDE (decisions/0007): the drawer's scroll lock adds a <style>
      // element that our CSP blocks. This stand-in adds none.
      "react-remove-scroll-bar": "./lib/overrides/react-remove-scroll-bar.ts",
    },
  },
};

export default nextConfig;
