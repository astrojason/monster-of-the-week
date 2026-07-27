import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { AuthProvider } from "@/lib/auth";
import { Navbar } from "@/components/Navbar";
import pkg from "../../package.json";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Monster of the Week - Campaign Tracker",
  description: "Track hunters, mysteries, and sessions for your MotW campaign",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <AuthProvider>
          <Navbar />
          <main className="container mx-auto px-4 py-6 max-w-7xl">
            {children}
          </main>
          <footer className="border-t border-border py-4 mt-4">
            <div className="container mx-auto px-4 max-w-7xl flex justify-end">
              <Link href="/changelog" className="text-xs text-muted hover:text-foreground transition-colors font-mono">
                v{pkg.version}
              </Link>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
