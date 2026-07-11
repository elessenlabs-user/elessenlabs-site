"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  return (
    <>
      {/* Navigation */}

      <header className="fixed left-0 right-0 top-0 z-50">
        <div className="mx-auto mt-5 flex max-w-7xl items-center justify-between rounded-2xl border border-[#4E5964]/10 bg-white/75 px-8 py-4 shadow-[0_20px_60px_rgba(0,0,0,0.06)] backdrop-blur-xl">

          {/* Logo */}

          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Elessen Labs"
              width={240}
              height={90}
              priority
              className="h-12 w-auto object-contain"
            />
          </Link>

          {/* Navigation */}

          <nav className="hidden items-center gap-10 text-[15px] font-medium text-[#4E5964] lg:flex">

            <Link
              href="/experience"
              className="transition hover:text-[#FE5E04]"
            >
              Work
            </Link>

            <Link
              href="/how-we-help"
              className="transition hover:text-[#FE5E04]"
            >
              Services
            </Link>

            <Link
              href="/government"
              className="transition hover:text-[#FE5E04]"
            >
              Government
            </Link>

            <Link
              href="/insights"
              className="transition hover:text-[#FE5E04]"
            >
              Insights
            </Link>

          </nav>

          {/* CTA */}

          <Link
            href="#contact"
            className="rounded-xl bg-[#FE5E04] px-5 py-3 font-semibold text-white transition hover:bg-[#E95404]"
          >
            Let's Talk
          </Link>

        </div>
      </header>

      <main className="pt-32">
        {children}
      </main>

      <footer className="border-t border-[#4E5964]/10 py-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 text-sm text-[#4E5964]/70">

          <div>
            © {new Date().getFullYear()} Elessen Labs
          </div>

          <div>
            Human-Centred Design • Product Strategy • Digital Delivery
          </div>

        </div>
      </footer>
    </>
  );
}