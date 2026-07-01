"use client";

import { Inter, Playfair_Display, Poppins } from "next/font/google";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthSessionProvider } from "@/components/providers/session-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

export function AdminProviders({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${inter.variable} ${playfair.variable} ${poppins.variable} font-sans antialiased contents`}>
      <ThemeProvider>
        <AuthSessionProvider>
          {children}
          <Toaster richColors position="top-right" />
        </AuthSessionProvider>
      </ThemeProvider>
    </div>
  );
}
