import type { Metadata } from "next";
import "./globals.css";
import AppLayoutWrapper from "@/components/AppLayoutWrapper";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata: Metadata = {
  title: "ContextOps — AI Incident Response",
  description: "Automated incident triage and resolution engine powered by LangGraph and MCP.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@300;400;500;600;700&family=Geist+Mono:wght@400;500&display=swap" rel="stylesheet" />
      </head>
      <body
        style={{
          minHeight: "100vh",
          background: "var(--bg-base)",
          color: "var(--ink)",
        }}
      >
        <ClerkProvider>
          <AppLayoutWrapper>{children}</AppLayoutWrapper>
        </ClerkProvider>
      </body>
    </html>
  );
}
