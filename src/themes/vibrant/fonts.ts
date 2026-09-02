import { DM_Sans, Noto_Serif } from "next/font/google";

export const vibrantSans = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-vibrant-sans",
  display: "swap",
});

export const vibrantSerif = Noto_Serif({
  subsets: ["latin"],
  weight: ["500", "600", "700", "900"],
  variable: "--font-vibrant-serif",
  display: "swap",
});
