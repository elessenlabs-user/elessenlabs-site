"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";

export type ThemePreference =
  | "light"
  | "dark"
  | "system";

export type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
  theme: ThemePreference;
  resolvedTheme: ResolvedTheme;
  mounted: boolean;
  setTheme: (theme: ThemePreference) => void;
  toggleTheme: () => void;
};

const STORAGE_KEY = "elessen-theme";

const ThemeContext =
  createContext<ThemeContextValue | null>(null);

function isThemePreference(
  value: string | null,
): value is ThemePreference {
  return (
    value === "light" ||
    value === "dark" ||
    value === "system"
  );
}

function resolveTheme(
  preference: ThemePreference,
): ResolvedTheme {
  if (preference === "light") {
    return "light";
  }

  if (preference === "dark") {
    return "dark";
  }

  return window.matchMedia(
    "(prefers-color-scheme: dark)",
  ).matches
    ? "dark"
    : "light";
}

function applyTheme(
  preference: ThemePreference,
): ResolvedTheme {
  const resolved = resolveTheme(preference);
  const root = document.documentElement;

  root.classList.toggle(
    "dark",
    resolved === "dark",
  );

  root.dataset.theme = resolved;
  root.style.colorScheme = resolved;

  return resolved;
}

export function ThemeProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [theme, setThemeState] =
    useState<ThemePreference>("system");

  const [resolvedTheme, setResolvedTheme] =
    useState<ResolvedTheme>("light");

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const storedTheme =
      window.localStorage.getItem(STORAGE_KEY);

    const initialTheme = isThemePreference(storedTheme)
      ? storedTheme
      : "system";

    setThemeState(initialTheme);
    setResolvedTheme(applyTheme(initialTheme));
    setMounted(true);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)",
    );

    const handleSystemThemeChange = () => {
      if (theme === "system") {
        setResolvedTheme(applyTheme("system"));
      }
    };

    mediaQuery.addEventListener(
      "change",
      handleSystemThemeChange,
    );

    return () => {
      mediaQuery.removeEventListener(
        "change",
        handleSystemThemeChange,
      );
    };
  }, [theme]);

  const setTheme = useCallback(
    (nextTheme: ThemePreference) => {
      setThemeState(nextTheme);

      window.localStorage.setItem(
        STORAGE_KEY,
        nextTheme,
      );

      setResolvedTheme(applyTheme(nextTheme));
    },
    [],
  );

  const toggleTheme = useCallback(() => {
    setTheme(
      resolvedTheme === "dark"
        ? "light"
        : "dark",
    );
  }, [resolvedTheme, setTheme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme,
      mounted,
      setTheme,
      toggleTheme,
    }),
    [
      theme,
      resolvedTheme,
      mounted,
      setTheme,
      toggleTheme,
    ],
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      "useTheme must be used within ThemeProvider.",
    );
  }

  return context;
}