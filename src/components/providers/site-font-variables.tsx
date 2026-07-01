import { Playfair_Display, Poppins } from "next/font/google";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
  preload: false,
});

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
  preload: false,
});

/** Non-blocking font variables for blog/product detail typography. */
export function SiteFontVariables({ children }: { children: React.ReactNode }) {
  return <div className={`${playfair.variable} ${poppins.variable} contents`}>{children}</div>;
}
