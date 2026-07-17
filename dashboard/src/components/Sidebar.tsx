"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import {
  LayoutDashboard,
  Siren,
  ServerCog,
  BellRing,
  BookText,
  Users,
  FileText,
  BarChart2,
  Settings,
  Blocks,
  Zap,
} from "lucide-react";

const workspaceItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/incidents", label: "Incidents", icon: Siren },
  { href: "/alerts", label: "Alerts", icon: BellRing },
  { href: "/services", label: "Services", icon: ServerCog },
  { href: "/runbooks", label: "Runbooks", icon: BookText },
  { href: "/oncall", label: "On-Call", icon: Users },
];

const analyticsItems = [
  { href: "/postmortems", label: "Postmortems", icon: FileText },
  { href: "/insights", label: "Insights", icon: BarChart2 },
];

const bottomItems = [
  { href: "/integrations", label: "Integrations", icon: Blocks },
  { href: "/settings", label: "Settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="h-screen flex flex-col shrink-0 border-r"
      style={{
        width: "220px",
        background: "var(--bg-base)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-6 py-5 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <Link href="/dashboard">
          <Image
            src="/logo.png"
            alt="ContextOps"
            width={140}
            height={70}
            className="w-32 h-auto object-contain"
            priority
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 p-3">
        <p
          className="px-3 py-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}
        >
          Workspace
        </p>
        {workspaceItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "nav-link",
                isActive && "nav-link-active"
              )}
            >
              <Icon
                size={15}
                color={isActive ? "var(--ink)" : "var(--ink-muted)"}
              />
              <span>{label}</span>
              {label === "Incidents" && (
                <span
                  className="ml-auto text-xs font-mono px-1.5 py-0.5 rounded"
                  style={{
                    background: "var(--bg-sunken)",
                    color: "var(--ink-muted)",
                    border: "1px solid var(--border-subtle)",
                  }}
                >
                  Live
                </span>
              )}
            </Link>
          );
        })}

        <div className="mt-6">
          <p
            className="px-3 py-2 text-xs font-bold uppercase tracking-widest"
            style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}
          >
            Analytics
          </p>
          {analyticsItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "nav-link",
                  isActive && "nav-link-active"
                )}
              >
                <Icon
                  size={15}
                  color={isActive ? "var(--ink)" : "var(--ink-muted)"}
                />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Bottom */}
      <div
        className="p-3 border-t flex flex-col gap-0.5"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        {bottomItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn("nav-link", isActive && "nav-link-active")}
            >
              <Icon size={15} color="var(--ink-muted)" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
