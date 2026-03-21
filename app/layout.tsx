import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { BrandAuthProvider } from "@/contexts/brand-auth-context";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Social Media Analytics Dashboard",
  description: "Track and analyze your social media campaign performance across Facebook, Instagram, and TikTok",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <BrandAuthProvider>
          <Suspense fallback={<div>Loading...</div>}>
            {children}
          </Suspense>
          <Toaster position="top-center" richColors />
        </BrandAuthProvider>
      </body>
    </html>
  );
}
