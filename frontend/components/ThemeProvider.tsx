"use client";

import { createContext, ReactNode, useContext, useEffect, useMemo, useState } from "react";

export type Theme = "paper" | "mono" | "accent" | "dark";

export const THEMES: { value: Theme; label: string }[] = [
  { value: "paper", label: "paper" },
  { value: "mono", label: "mono" },
  { value: "accent", label: "accent" },
  { value: "dark", label: "dark" },
];

const STORAGE_KEY = "shippy_board_theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (next: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

function isTheme(v: unknown): v is Theme {
  return v === "paper" || v === "mono" || v === "accent" || v === "dark";
}

function readInitialTheme(): Theme {
  if (typeof document === "undefined") return "paper";
  const attr = document.documentElement.getAttribute("data-theme");
  if (isTheme(attr)) return attr;
  const stored = window.localStorage.getItem(STORAGE_KEY);
  return isTheme(stored) ? stored : "paper";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}

export { STORAGE_KEY as THEME_STORAGE_KEY };
