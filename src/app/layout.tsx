import type { Metadata } from "next";
import "./globals.css";
import AuthProvider from "@/components/shared/AuthProvider";
import { BRAND_ASSET_BASE, DEFAULT_SHARE_IMAGE } from "@/lib/branding";

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
    title: "Mian Umair International",
    description: "Premium Himalayan salt products. Manufacturer and exporter since 1995.",
    images: [DEFAULT_SHARE_IMAGE],
  },
  twitter: {
    card: "summary_large_image",
    title: "Mian Umair International",
    description: "Premium Himalayan salt products. Manufacturer and exporter since 1995.",
    images: [DEFAULT_SHARE_IMAGE],
  },
  icons: {
    icon: [
      { url: `${BRAND_ASSET_BASE}/favicon-32.webp`, sizes: "32x32", type: "image/webp" },
      { url: `${BRAND_ASSET_BASE}/favicon-192.webp`, sizes: "192x192", type: "image/webp" },
    ],
    shortcut: `${BRAND_ASSET_BASE}/favicon.ico`,
    apple: { url: `${BRAND_ASSET_BASE}/apple-touch-icon.png`, sizes: "180x180", type: "image/png" },
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
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
