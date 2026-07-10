import type { Metadata } from "next";
import "./globals.css";

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
      className="h-full antialiased"
    >
      <body className="min-h-full bg-[#f8fafc] text-[#0f172a] flex flex-col">{children}</body>
    </html>
  );
}
