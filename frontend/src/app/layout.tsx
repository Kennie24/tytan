import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import LenisProvider from "@/components/providers/LenisProvider";
import LoadingScreen from "@/components/layout/LoadingScreen";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TYTAN TAKUBA | Big Sound. Bigger Story.",
  description:
    "Official website of Tytan Takuba – musician, songwriter, and artist. Buy albums, stream music, and experience the sound.",
  openGraph: {
    title: "TYTAN TAKUBA",
    description: "Big Sound. Bigger Story.",
    type: "music.album",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${bebasNeue.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-black text-white overflow-x-hidden antialiased">
        <LoadingScreen />
        <LenisProvider>{children}</LenisProvider>
      </body>
    </html>
  );
}
