"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type AnalyticsConsent =
  | "unknown"
  | "accepted"
  | "rejected";

type ConsentContextValue = {
  consent: AnalyticsConsent;
  acceptAnalytics: () => void;
  rejectAnalytics: () => void;
  openCookieSettings: () => void;
};

const STORAGE_KEY = "elessen-analytics-consent";

const ConsentContext =
  createContext<ConsentContextValue | null>(null);

export function ConsentProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [consent, setConsent] =
    useState<AnalyticsConsent>("unknown");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedConsent =
      window.localStorage.getItem(STORAGE_KEY);

    if (
      storedConsent === "accepted" ||
      storedConsent === "rejected"
    ) {
      setConsent(storedConsent);
    }

    setMounted(true);
  }, []);

  const acceptAnalytics = () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      "accepted",
    );

    setConsent("accepted");
  };

  const rejectAnalytics = () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      "rejected",
    );

    setConsent("rejected");

    const browserWindow = window as typeof window & {
      clarity?: (
        command: string,
        value: {
          ad_Storage: "denied";
          analytics_Storage: "denied";
        },
      ) => void;

      gtag?: (...args: unknown[]) => void;
    };

    browserWindow.clarity?.("consentv2", {
      ad_Storage: "denied",
      analytics_Storage: "denied",
    });

    browserWindow.gtag?.("consent", "update", {
      analytics_storage: "denied",
      ad_storage: "denied",
    });
  };

  const openCookieSettings = () => {
    setConsent("unknown");
  };

  const value = useMemo(
    () => ({
      consent,
      acceptAnalytics,
      rejectAnalytics,
      openCookieSettings,
    }),
    [consent],
  );

  return (
    <ConsentContext.Provider value={value}>
      {children}

      {mounted && consent === "unknown" && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Analytics cookie preferences"
          className="fixed inset-x-4 bottom-4 z-[100] mx-auto max-w-3xl rounded-3xl border border-white/15 bg-[#4E5964] p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.28)] sm:bottom-6 sm:p-7"
        >
          <div className="grid gap-6 sm:grid-cols-[1fr_auto] sm:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.18em] text-[#FE5E04]">
                Analytics preferences
              </p>

              <p className="mt-3 max-w-xl text-sm leading-6 text-white/80">
                We use optional analytics to understand how
                people use the site and improve the
                experience. Necessary site preferences remain
                enabled.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:min-w-[190px]">
              <button
                type="button"
                onClick={acceptAnalytics}
                className="rounded-xl bg-[#FE5E04] px-5 py-3 font-semibold text-white transition hover:bg-[#E95404]"
              >
                Accept analytics
              </button>

              <button
                type="button"
                onClick={rejectAnalytics}
                className="rounded-xl border border-white/35 px-5 py-3 font-semibold text-white transition hover:border-white hover:bg-white/10"
              >
                Reject analytics
              </button>
            </div>
          </div>
        </div>
      )}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const context = useContext(ConsentContext);

  if (!context) {
    throw new Error(
      "useConsent must be used within ConsentProvider.",
    );
  }

  return context;
}