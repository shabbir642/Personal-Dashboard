import "../styles/globals.css";
import AppHeader from "../components/AppHeader";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata = {
  title: "Personal Task Dashboard",
  description: "Simple task management dashboard",
};

// Runs before hydration to avoid a flash of the wrong theme.
const themeInitScript = `
  try {
    var t = localStorage.getItem("task_dashboard_theme");
    if (t === "light" || t === "dark") {
      document.documentElement.setAttribute("data-theme", t);
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <ThemeProvider>
          <AppHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
