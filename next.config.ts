import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // The whole site is static files (decisions/0001).
  output: "export",
  // The design system ships TypeScript source, imported by path.
  transpilePackages: ["@amezquita/design-system"],
  reactStrictMode: true,
};

export default nextConfig;
