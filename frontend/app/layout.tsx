import "../styles/globals.css";

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
      <body>{children}</body>
    </html>
  );
}
