import "../styles/globals.css";
import AppHeader from "../components/AppHeader";
import { ThemeProvider } from "../components/ThemeProvider";

export const metadata = {
  title: "Personal Task Dashboard",
  description: "Simple task management dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AppHeader />
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
