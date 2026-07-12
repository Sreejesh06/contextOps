import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import Sidebar from "@/components/Sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ContextOps - The Glass",
  description: "Real-time AI incident dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex text-white selection:bg-white/30 overflow-hidden">
        <div className="mesh-gradient-bg"></div>
        
        <Sidebar />
        
        <main className="flex-1 h-screen overflow-y-auto p-4 lg:p-8 relative">
          <SmoothScroll>{children}</SmoothScroll>
        </main>
      </body>
    </html>
  );
}
