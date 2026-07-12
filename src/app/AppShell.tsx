"use client";

import { useState } from "react";
import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { useTheme } from "../components/theme/ThemeProvider";
import { useConsent } from "../components/privacy/ConsentProvider";
import { openBookingPopup } from "../lib/bookings";

const navigation = [
  {
    label: "Services",
    href: "/#services",
  },
  {
    label: "Work",
    href: "/#work",
  },
  {
    label: "Process",
    href: "/#process",
  },
  {
    label: "About",
    href: "/#about",
  },
];

type AppShellProps = {
  children: ReactNode;
};

function MoonIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20.2 15.5A8.5 8.5 0 0 1 8.5 3.8 8.5 8.5 0 1 0 20.2 15.5Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="3.5" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.42 1.42" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.42" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M4 7h16" />
      <path d="M4 12h16" />
      <path d="M4 17h16" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
    >
      <path d="M6 6l12 12" />
      <path d="M18 6 6 18" />
    </svg>
  );
}

export default function AppShell({
  children,
}: AppShellProps) {
  const pathname = usePathname();

  const [isMenuOpen, setIsMenuOpen] =
    useState(false);

  const {
    resolvedTheme,
    mounted,
    toggleTheme,
  } = useTheme();

  const { openCookieSettings } = useConsent();

  const isAdmin = pathname?.startsWith("/admin");

  if (isAdmin) {
    return <>{children}</>;
  }

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  const handleBooking = () => {
    closeMenu();
    openBookingPopup();
  };

  return (
    <>
      {/* Navigation */}

      <header className="fixed left-0 right-0 top-0 z-50 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto mt-4 max-w-7xl">
          <div className="flex items-center justify-between rounded-2xl border border-[var(--border)] bg-[var(--header-background)] px-5 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-xl sm:px-6 lg:px-8 lg:py-4">
            {/* Logo */}

            <Link
              href="/#top"
              onClick={closeMenu}
              aria-label="Elessen Labs home"
              className="flex shrink-0 items-center rounded-xl transition-colors dark:bg-white dark:px-2 dark:py-1"
            >
              <Image
                src="/logo.png"
                alt="Elessen Labs"
                width={240}
                height={90}
                priority
                className="h-10 w-auto object-contain sm:h-12"
              />
            </Link>

            {/* Desktop navigation */}

            <nav
              aria-label="Primary navigation"
              className="hidden items-center gap-9 text-[15px] font-medium text-[var(--text)] lg:flex"
            >
              {navigation.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="transition-colors hover:text-[#FE5E04]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Header actions */}

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                disabled={!mounted}
                aria-label={
                  resolvedTheme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                title={
                  resolvedTheme === "dark"
                    ? "Switch to light mode"
                    : "Switch to dark mode"
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface-soft)] text-[var(--text)] transition-all hover:-translate-y-0.5 hover:border-[#FE5E04] hover:text-[#FE5E04] disabled:opacity-0"
              >
                {mounted ? (
                  resolvedTheme === "dark" ? (
                    <SunIcon />
                  ) : (
                    <MoonIcon />
                  )
                ) : (
                  <span className="h-5 w-5" />
                )}
              </button>

              <button
                type="button"
                onClick={handleBooking}
                className="hidden rounded-xl bg-[#FE5E04] px-5 py-3 font-semibold text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#E95404] hover:shadow-[0_12px_30px_rgba(254,94,4,0.22)] sm:inline-flex"
              >
                Let&apos;s Talk
              </button>

              <button
                type="button"
                aria-label={
                  isMenuOpen
                    ? "Close navigation menu"
                    : "Open navigation menu"
                }
                aria-controls="mobile-navigation"
                aria-expanded={isMenuOpen}
                onClick={() =>
                  setIsMenuOpen(
                    (current) => !current,
                  )
                }
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text)] transition hover:border-[#FE5E04] hover:text-[#FE5E04] lg:hidden"
              >
                {isMenuOpen ? (
                  <CloseIcon />
                ) : (
                  <MenuIcon />
                )}
              </button>
            </div>
          </div>

          {/* Mobile navigation */}

          {isMenuOpen && (
            <nav
              id="mobile-navigation"
              aria-label="Mobile navigation"
              className="mt-2 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 text-[var(--text)] shadow-[0_20px_60px_rgba(0,0,0,0.16)] lg:hidden"
            >
              <div className="flex flex-col">
                {navigation.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    onClick={closeMenu}
                    className="rounded-xl px-4 py-3 font-semibold transition hover:bg-[var(--surface-soft)] hover:text-[#FE5E04]"
                  >
                    {item.label}
                  </Link>
                ))}

                <button
                  type="button"
                  onClick={handleBooking}
                  className="mt-3 rounded-xl bg-[#FE5E04] px-5 py-3.5 font-semibold text-white transition hover:bg-[#E95404] sm:hidden"
                >
                  Let&apos;s Talk
                </button>
              </div>
            </nav>
          )}
        </div>
      </header>

      <main className="pt-28 sm:pt-32">
        {children}
      </main>

      <footer className="border-t border-[var(--border)] bg-[var(--surface)] py-10 text-[var(--text)] transition-colors duration-300">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-8 text-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            © {new Date().getFullYear()} Elessen Labs
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
            <span className="text-[var(--muted)]">
              Product Design • Service Design • Product Development
            </span>

            <button
              type="button"
              onClick={openCookieSettings}
              className="w-fit font-semibold text-[var(--muted)] transition hover:text-[#FE5E04]"
            >
              Cookie settings
            </button>
          </div>
        </div>
      </footer>
    </>
  );
}