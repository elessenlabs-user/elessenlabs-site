import "./globals.css";
import type { Metadata } from "next";
import Script from "next/script";
import AppShell from "./AppShell";


export const metadata: Metadata = {
  title: "Elessen Labs",
  description:
    "Product design and MVP delivery for startups and teams building real software.",
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
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
  <link
    rel="stylesheet"
    href="https://assets.calendly.com/assets/external/widget.css"
  />

  <Script
    src="https://www.googletagmanager.com/gtag/js?id=G-X5S5S1HR9S"
    strategy="afterInteractive"
  />

  <Script id="google-analytics" strategy="afterInteractive">
    {`
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', 'G-X5S5S1HR9S', {
  page_title: document.title,
  page_path: window.location.pathname,
});
`}
  </Script>
</head>
      <body className="min-h-screen bg-white text-gray-900">
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXX"
          strategy="afterInteractive"
        />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-XXXX');
          `}
        </Script>

        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}