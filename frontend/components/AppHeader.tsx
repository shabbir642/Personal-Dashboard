"use client";

import Link from "next/link";

import { useTheme } from "./ThemeProvider";

export default function AppHeader() {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="app-header">
      <div className="header-brand">Task Dashboard</div>
      <nav className="header-nav">
        <Link href="/">Tasks</Link>
        <Link href="/analytics">Analytics</Link>
      </nav>
      <button type="button" className="secondary-btn" onClick={toggleTheme}>
        {theme === "light" ? "Dark" : "Light"} Theme
      </button>
    </header>
  );
}
