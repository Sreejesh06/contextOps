"use client";

import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

export default function AppLayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";

  if (isLanding) {
    return <main className="w-full min-h-screen overflow-x-hidden">{children}</main>;
  }

  return (
    <div
      style={{
        display: "flex",
        height: "100vh",
        overflow: "hidden",
        width: "100vw"
      }}
    >
      <Sidebar />
      <main
        style={{
          flex: 1,
          height: "100vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {children}
      </main>
    </div>
  );
}
