import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AuthSessionProvider from "@/components/providers/SessionProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Tunca Law Firm - Admin",
  description: "Admin panel for Tunca Law Firm",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Client-side redirect to /admin if on /, /en, or /tr
  if (typeof window !== "undefined") {
    const path = window.location.pathname;
    if (path === "/" || path === "/en" || path === "/tr") {
      window.location.replace("/admin");
      return null;
    }
  }

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthSessionProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </AuthSessionProvider>
      </body>
    </html>
  );
}
