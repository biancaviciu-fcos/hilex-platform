import type { Metadata } from "next";
import { WhatsAppWidget } from "@/components/WhatsAppWidget";
import "./globals.css";

export const metadata: Metadata = {
  title: "HILEX",
  description: "Resurse digitale HILEX"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ro">
      <body>
        {children}
        <WhatsAppWidget />
      </body>
    </html>
  );
}
