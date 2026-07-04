import type { Metadata, Viewport } from "next";
import { Space_Grotesk, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const display = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

const body = IBM_Plex_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The Loss Landscape — an interactive expedition",
  description:
    "Fly through the optimization landscape of a neural network: basins, saddles, ridges, and the geometry of why some minima generalize and others don't.",
  keywords: [
    "loss landscape",
    "deep learning",
    "optimization",
    "neural networks",
    "gradient descent",
    "SGD",
    "sharp minima",
    "flat minima",
  ],
  authors: [{ name: "Loss Landscape" }],
  openGraph: {
    title: "The Loss Landscape — an interactive expedition",
    description:
      "An interactive, scroll-driven journey through the geometry of deep learning optimization.",
    type: "website",
    images: ["/og-image.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "The Loss Landscape — an interactive expedition",
    description:
      "An interactive, scroll-driven journey through the geometry of deep learning optimization.",
    images: ["/og-image.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#05070C",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  );
}
