import "./globals.css";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Elessen Labs",
  description:
    "Product design and MVP delivery for startups and teams building real software.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">

        {/* HEADER */}
        <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-md">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">

            {/* LOGO */}
            <Link href="/" className="flex items-center group">
              <span className="relative inline-flex items-center">

                {/* glow aura */}
                <span className="absolute -inset-4 rounded-3xl logo-glow opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />

                <Image
                  src="/logo-v2.png"
                  alt="Elessen Labs"
                  width={260}
                  height={80}
                  priority
                  className="relative h-16 w-auto md:h-[72px] logo-tight"
                />
              </span>
            </Link>

            {/* NAV */}
            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link href="/how-we-help" className="opacity-70 hover:opacity-100 transition">
                How we help
              </Link>

              <Link href="/experience" className="opacity-70 hover:opacity-100 transition">
                Experience
              </Link>

              <Link href="/readiness" className="opacity-70 hover:opacity-100 transition">
                Readiness
              </Link>

              {/* CTA */}
              <Link
                href="/start"
                className="rounded-xl border border-black/20 px-4 py-2 font-semibold transition-all duration-200 hover:border-black hover:-translate-y-[1px] hover:shadow-md"
              >
                Start your product
              </Link>
            </nav>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="mx-auto max-w-5xl px-6 py-8 md:py-12">
          {children}
        </main>

        {/* FOOTER */}
        <footer className="border-t border-black/10">
          <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-10 text-sm text-gray-700">
            <div>© {new Date().getFullYear()} Elessen Labs</div>
            <div className="opacity-70">
              Product design • MVP delivery • Platform strategy
            </div>
          </div>
        </footer>

      </body>
    </html>
  );
}