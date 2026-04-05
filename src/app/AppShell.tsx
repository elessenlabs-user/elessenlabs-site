"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { usePathname } from "next/navigation";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  return (
    <>
      <Script
        src="https://assets.calendly.com/assets/external/widget.js"
        strategy="afterInteractive"
      />

      {isAdmin ? (
        <>{children}</>
      ) : (
        <>
          <header className="sticky top-0 z-50 border-b border-black/10 bg-white/80 backdrop-blur-md">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6">
              <Link href="/" className="flex items-center group shrink-0">
                <span className="relative inline-flex items-center">
                  <span className="absolute -inset-4 rounded-3xl logo-glow opacity-60 blur-2xl transition-opacity duration-300 group-hover:opacity-100" />
                  <Image
                    src="/logo.png"
                    alt="Elessen Labs"
                    width={320}
                    height={120}
                    priority
                    className="relative h-14 w-auto md:h-16 object-contain"
                />
                </span>
              </Link>

              <div className="flex items-center gap-3">
                <div className="md:hidden">
                  <details className="relative">
                    <summary className="cursor-pointer list-none rounded-xl border border-black/20 px-3 py-2 text-sm font-semibold">
                      Menu
                    </summary>

                    <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-black/10 bg-white p-2 shadow-lg">
                      <Link
                        href="/how-we-help"
                        className="block rounded-xl px-3 py-2 text-sm hover:bg-black/5"
                      >
                        How we help
                      </Link>
                      <Link
                        href="/experience"
                        className="block rounded-xl px-3 py-2 text-sm hover:bg-black/5"
                      >
                        Experience
                      </Link>
                      <Link
                        href="/readiness"
                        className="block rounded-xl px-3 py-2 text-sm hover:bg-black/5"
                      >
                        Readiness
                      </Link>
                      <Link
                        href="/start"
                        className="mt-1 block rounded-xl border border-black/15 px-3 py-2 text-sm font-semibold hover:bg-black/5"
                      >
                        Start your product
                      </Link>
                    </div>
                  </details>
                </div>

                <nav className="flex items-center gap-6">
                  {/* Hidden until ready */}
                  <Link
                    href="/start"
                    className="rounded-xl border border-black/20 px-4 py-2 font-semibold transition-all duration-200 hover:border-black hover:-translate-y-[1px] hover:shadow-md"
                  >
                    Start your product
                  </Link>
                </nav>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-5xl px-6 py-8 md:py-12">{children}</main>

          <footer className="border-t border-black/10">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 md:px-6 md:py-3">
              <div>© {new Date().getFullYear()} Elessen Labs</div>
              <div className="opacity-70">
                Product design • MVP delivery • Platform strategy
              </div>
            </div>
          </footer>
        </>
      )}
    </>
  );
}