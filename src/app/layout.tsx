import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/PwaRegister";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "HILEX",
  description: "Resurse digitale HILEX",
  manifest: "/manifest.webmanifest",
  applicationName: "HiLex",
  appleWebApp: {
    capable: true,
    title: "HiLex",
    statusBarStyle: "default"
  },
  icons: {
    icon: [
      { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" }
    ],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" }]
  }
};

export const viewport: Viewport = {
  themeColor: "#050943"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        <PwaRegister />
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
