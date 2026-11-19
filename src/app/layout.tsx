import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppShell from "@/components/AppShell";
import PwaRegister from "@/components/PwaRegister";

const inter = Inter({ subsets: ["latin"] });

export const viewport: Viewport = {
  themeColor: "#FACC15",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Toolsbd.com — Bangladesh's #1 Automated Software Tools & Licensing Hub",
  description: "Enterprise software utilities, instant bKash (01609166109) & Rocket (01731328169) automated verification, and HWID licensing.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.png",
    apple: "/icon-192.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Toolsbd",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${inter.className} min-h-screen bg-[#070707] text-white selection:bg-yellow-400 selection:text-black`}>
        <PwaRegister />
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
