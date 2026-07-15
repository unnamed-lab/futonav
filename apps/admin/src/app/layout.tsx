import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700", "800"],
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "FutoNav Admin Panel",
  description: "Management dashboard for FutoNav smart campus navigation POIs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`h-full antialiased ${sans.variable} ${mono.variable}`}
    >
      <body className="min-h-full bg-[#f8fafc] text-[#0f172a] flex flex-col font-sans">{children}</body>
    </html>
  );
}

