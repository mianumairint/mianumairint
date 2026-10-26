import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "Mian Umair International — Himalayan Salt Exporter Since 1995",
    template: "%s | Mian Umair International",
  },
  description:
    "Pakistan's premier Himalayan salt exporter since 1995. Salt lamps, edible pink salt, black salt, tiles, bricks & bulk wholesale. Shipping to 30+ countries worldwide.",
  keywords: [
    "Himalayan salt",
    "pink salt exporter",
    "salt lamps",
    "Pakistan salt",
    "bulk salt wholesale",
    "Khewra salt mine",
    "edible pink salt",
    "salt tiles",
    "Mian Umair International",
  ],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mian Umair International",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,400;0,700;1,400&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
