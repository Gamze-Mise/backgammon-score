import type { Metadata, Viewport } from "next";
import { Bitter, Nunito } from "next/font/google";
import "./globals.css";

const bitter = Bitter({
  variable: "--font-heading",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const nunito = Nunito({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#c2410c",
};

export const metadata: Metadata = {
  title: "Backgammon Scoreboard",
  description: "Simple two-player backgammon score tracker.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${bitter.variable} ${nunito.variable}`}>
      <body className="min-h-screen bg-[#fef7ed] text-stone-800 font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
