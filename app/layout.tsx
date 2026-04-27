import type { Metadata } from "next";
import { Inter, Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import { BrandAuthProvider } from "@/contexts/brand-auth-context";
import { ThemeProvider } from "@/contexts/theme-context";
import { Toaster } from "sonner";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
  weight: ["500", "600", "700", "800"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-jetbrains",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: {
    default: "Echofold — Brand Intelligence for Agencies",
    template: "%s · Echofold",
  },
  description:
    "Echofold is the intelligence layer for every brand you run — listening, sentiment, competitors, and AI insights in one feed.",
  applicationName: "Echofold",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "Echofold — Brand Intelligence for Agencies",
    description:
      "Hear every echo of your brand — before it goes loud. Listening, sentiment, competitors, and AI insights for every brand you run.",
    siteName: "Echofold",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Echofold — Brand Intelligence for Agencies",
    description:
      "Hear every echo of your brand — before it goes loud.",
  },
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
      <body className={`${inter.variable} ${manrope.variable} ${jetbrainsMono.variable} font-sans antialiased`}>
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
