import "../styles/globals.css";

import AppShell from "../components/AppShell";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata = {
  title: "Shippy Board — Personal Task Dashboard",
  description: "A silent, paper-feel logger for tracking tasks and analytics.",
};

// Runs before hydration to avoid a flash of the wrong theme.
const themeInitScript = `
  try {
    var t = localStorage.getItem("shippy_board_theme");
    if (t === "paper" || t === "mono" || t === "accent" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    } else {
      document.documentElement.setAttribute("data-theme", "paper");
    }
  } catch (e) {
    document.documentElement.setAttribute("data-theme", "paper");
  }
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="paper" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AppShell>{children}</AppShell>
        </ThemeProvider>
      </body>
    </html>
  );
}
