"use client";

import { SignInButton, Show, UserButton } from "@clerk/nextjs";
import { useState } from "react";
import { CheckCheck, Clock, AlertTriangle } from "lucide-react";

type HeaderProps = {
  incident?: any;
  onResolve?: () => void;
};

export default function Header({ incident, onResolve }: HeaderProps) {
  const [resolving, setResolving] = useState(false);
  const isResolved = incident?.status === "RESOLVED";

  const handleResolve = async () => {
    if (!incident?.id || resolving) return;
    setResolving(true);
    try {
      await fetch(`http://localhost:8080/api/incidents/${incident.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "RESOLVED" }),
      });
      if (onResolve) onResolve();
    } catch (e) {
      console.error("Failed to resolve", e);
    } finally {
      setResolving(false);
    }
  };

  const incidentLabel = incident?.id
    ? `INC-${incident.id.slice(0, 6).toUpperCase()}`
    : "—";

  const incidentTitle =
    incident?.trigger_data?.summary ||
    incident?.trigger_data?.title ||
    (incident ? "Active Incident" : "No Active Incident");

  const service =
    incident?.trigger_data?.service ||
    incident?.trigger_data?.routing_key ||
    "—";

  const createdAt = incident?.created_at
    ? new Date(incident.created_at).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <header
      className="shrink-0 flex items-center justify-between px-6 py-0 border-b"
      style={{
        height: "56px",
        background: "var(--bg-base)",
        borderColor: "var(--border-subtle)",
      }}
    >
      {/* Left — incident identity */}
      <div className="flex items-center gap-3">
        {incident && (
          <span
            className={`lozenge ${
              isResolved ? "lozenge-resolved" : "lozenge-investigating"
            }`}
          >
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{
                background: isResolved ? "#22c55e" : "#ef4444",
                animation: isResolved ? "none" : "pulse-dot 1.5s infinite",
              }}
            />
            {isResolved ? "Resolved" : "Investigating"}
          </span>
        )}

        <div className="flex flex-col leading-none">
          <span
            className="text-xs font-mono"
            style={{ color: "var(--ink-muted)" }}
          >
            {incidentLabel}
          </span>
          <span
            className="text-sm font-semibold mt-0.5"
            style={{ color: "var(--ink)", fontFamily: "var(--font-ui)" }}
          >
            {incidentTitle}
          </span>
        </div>

        {service !== "—" && (
          <>
            <span
              className="w-px h-7 shrink-0"
              style={{ background: "var(--border-subtle)" }}
            />
            <div className="flex flex-col leading-none">
              <span
                className="text-xs font-mono font-bold uppercase tracking-widest"
                style={{ color: "var(--ink-faint)" }}
              >
                Service
              </span>
              <span
                className="text-xs font-mono mt-0.5"
                style={{ color: "var(--ink-soft)" }}
              >
                {service}
              </span>
            </div>
          </>
        )}

        {createdAt && (
          <>
            <span
              className="w-px h-7 shrink-0"
              style={{ background: "var(--border-subtle)" }}
            />
            <div
              className="flex items-center gap-1.5 text-xs"
              style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}
            >
              <Clock size={12} />
              {createdAt}
            </div>
          </>
        )}

        {!incident && (
          <span className="text-sm" style={{ color: "var(--ink-muted)" }}>
            Awaiting incident...
          </span>
        )}
      </div>

      {/* Right — actions + auth */}
      <div className="flex items-center gap-3">
        {incident && isResolved && (
          <div
            className="flex items-center gap-1.5 text-xs"
            style={{ color: "#86efac", fontFamily: "var(--font-mono)" }}
          >
            <CheckCheck size={12} />
            Incident Closed
          </div>
        )}

        <Show when="signed-out">
          <SignInButton mode="modal">
            <button className="btn btn-ghost">Sign In</button>
          </SignInButton>
        </Show>
        <Show when="signed-in">
          <UserButton
            appearance={{
              elements: {
                userButtonAvatarBox:
                  "w-7 h-7 rounded-md border border-white/10",
              },
            }}
          />
        </Show>
      </div>
    </header>
  );
}
