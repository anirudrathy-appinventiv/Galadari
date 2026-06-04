import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Noto_Serif_Bengali } from "next/font/google";
import "./globals.css";

const display = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});

const body = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const bengali = Noto_Serif_Bengali({
  subsets: ["bengali"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Galadari · Voice Table",
  description: "A table for one, served by voice — the kitchen of Bengal.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${bengali.variable}`}>
      <body>{children}</body>
    </html>
  );
}
