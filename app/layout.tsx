import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { colorModeScript } from "@amezquita/design-system/lib/color-mode";

// Fonts, self-hosted (decisions/0005). Bricolage's opsz file carries the
// optical-size axis (12–96) and weights 200–800; Inter is static, as the file loads it.
import "@fontsource-variable/bricolage-grotesque/opsz.css";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";

// The brand contract's load order (architecture.md §4, Styling). No design system reset.css (port spec R5).
import "@amezquita/design-system/styles/brands/base-light.css";
import "@amezquita/design-system/styles/brands/base-dark.css";
import "../styles/brand/song-workshop-light.css";
import "../styles/brand/song-workshop-dark.css";
import "../styles/global.css";

export const metadata: Metadata = {
  title: { default: "Song Workshop", template: "%s · Song Workshop" },
  description: "Short music lessons you play with in the browser.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    // The colour-mode script sets data-mode on <html> before React hydrates.
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Sets data-mode before first paint. A constant string from the design
            system, the one allowed use of dangerouslySetInnerHTML (architecture.md §9). */}
        <script dangerouslySetInnerHTML={{ __html: colorModeScript() }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
