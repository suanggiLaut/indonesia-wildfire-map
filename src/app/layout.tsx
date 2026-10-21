import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title:
    "Indonesia Wildfire Map — Peta Titik Panas Kebakaran Hutan & Lahan (NASA FIRMS)",
  description:
    "Peta live titik panas (hotspot) kebakaran hutan dan lahan di Indonesia dari satelit NASA VIIRS & MODIS. Filter per provinsi, 24 jam / 48 jam / 7 hari.",
  keywords:
    "peta kebakaran hutan indonesia, titik panas, hotspot karhutla, NASA FIRMS, VIIRS, MODIS, wildfire map indonesia, peta karhutla",
  openGraph: {
    title: "Indonesia Wildfire Map — Live Hotspot Kebakaran Hutan & Lahan",
    description:
      "Di mana kebakaran hutan terjadi di Indonesia saat ini? Lihat titik panas dari satelit NASA secara real-time.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Indonesia Wildfire Map — Live Hotspot Kebakaran Hutan & Lahan",
    description:
      "Di mana kebakaran hutan terjadi di Indonesia saat ini? Lihat titik panas dari satelit NASA secara real-time.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
