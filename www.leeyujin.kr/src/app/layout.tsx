import type { Metadata } from "next";
import "@/styles/globals.css";
import ThemeProvider from "@/components/ThemeProvider";
import { AuthStoreProvider } from "@/features/auth/providers";

export const metadata: Metadata = {
  title: "Portfolio Project",
  description: "User-facing web application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className="antialiased bg-background text-text-primary font-sans">
        <ThemeProvider>
          <AuthStoreProvider>{children}</AuthStoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

