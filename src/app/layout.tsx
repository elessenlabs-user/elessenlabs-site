import "./globals.css";

import type { Metadata } from "next";
import Script from "next/script";

import AppShell from "./AppShell";
import { ThemeProvider } from "../components/theme/ThemeProvider";
import { ConsentProvider } from "../components/privacy/ConsentProvider";
import AnalyticsScripts from "../components/privacy/AnalyticsScripts";

const THEME_SCRIPT = `
(function () {
  try {
    var storedTheme =
      localStorage.getItem("elessen-theme");

    var preference =
      storedTheme === "light" ||
      storedTheme === "dark" ||
      storedTheme === "system"
        ? storedTheme
        : "system";

    var prefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    var resolvedTheme =
      preference === "dark" ||
      (preference === "system" && prefersDark)
        ? "dark"
        : "light";

    var root = document.documentElement;

    root.classList.toggle(
      "dark",
      resolvedTheme === "dark"
    );

    root.dataset.theme = resolvedTheme;
    root.style.colorScheme = resolvedTheme;
  } catch (error) {
    document.documentElement.dataset.theme =
      "light";
  }
})();
`;

export const metadata: Metadata = {
  title: {
    default: "Elessen Labs",
    template: "%s | Elessen Labs",
  },

  description:
    "Founder-led product and service design and development consultancy. We design and build websites, apps, platforms and digital services.",

  icons: {
    icon: "/favicon.ico",
    apple: "/apple-icon.png",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
    >
      <head>
        <Script
          id="elessen-theme"
          strategy="beforeInteractive"
        >
          {THEME_SCRIPT}
        </Script>
      </head>

      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <ConsentProvider>
            <AppShell>{children}</AppShell>

            <AnalyticsScripts />
          </ConsentProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}