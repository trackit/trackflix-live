import type { Metadata } from "next";
import { Inter } from "next/font/google";
import '@/styles/globals.css';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Trackflix live",
  description: "Trackflix Live streamlines live streaming event management with AWS MediaLive, driving efficiency, cost savings, and scalable broadcasting solutions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
