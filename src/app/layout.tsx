import type { Metadata } from "next";
import { Geist, Geist_Mono, Anybody, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { CollectionProvider } from "@/context/CollectionContext";
import Chatbot from "@/components/Chatbot";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const anybody = Anybody({
  variable: "--font-anybody",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HYPERDRIVE GARAGE - KINETIC PRECISION",
  description: "Experience the apex of automotive performance, meticulously calibrated for the track and the street.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${anybody.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <head>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=block" />
      </head>
      <body className="min-h-full flex flex-col bg-surface text-secondary font-geist overflow-x-hidden">
        <CollectionProvider>
          {children}
          <Chatbot />
        </CollectionProvider>
      </body>
    </html>
  );
}
