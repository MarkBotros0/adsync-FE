import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { BrandAuthProvider } from "@/contexts/brand-auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
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
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Synchronously apply saved theme before first paint to prevent FOUC */}
        <script dangerouslySetInnerHTML={{ __html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(t===null&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()` }} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <BrandAuthProvider>
            <Suspense fallback={<div>Loading...</div>}>
              {children}
            </Suspense>
            <Toaster position="top-center" richColors />
          </BrandAuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
