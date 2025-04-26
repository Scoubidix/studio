import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import Header from "@/components/shared/header"; // Added header import

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mon Assistant Kiné", // Updated title
  description: "Application de suivi patient pour kinésithérapeutes", // Updated description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr"> {/* Set language to French */}
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Header /> {/* Added Header */}
        <main className="container mx-auto px-4 py-8">{children}</main> {/* Added container and padding */}
        <Toaster /> {/* Added Toaster */}
      </body>
    </html>
  );
}
