"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { RefreshCw, ExternalLink, Siren } from "lucide-react";
import { SpinLoader } from "@/components/loaders/spin-loader";
import Link from "next/link";

type Incident = {
  id: string;
  status: "INVESTIGATING" | "RESOLVED" | "IGNORED";
  trigger_data: any;
  created_at: string;
};

function StatusLozenge({ status }: { status: string }) {
  const map: Record<string, string> = {
    INVESTIGATING: "lozenge lozenge-investigating",
    RESOLVED:      "lozenge lozenge-resolved",
    IGNORED:       "lozenge lozenge-warning",
  };
  return <span className={map[status] ?? "lozenge lozenge-info"}>{status}</span>;
}

export default function IncidentsPage() {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchIncidents = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8080/api/incidents");
      if (res.ok) setIncidents(await res.json());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchIncidents(); }, []);

  return (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: "var(--font-ui)" }}>
      {/* Page header */}
      <div
        className="shrink-0 flex items-center justify-between px-6 py-0 border-b"
        style={{ height: "56px", borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2">
          <Siren size={14} color="var(--ink-muted)" />
          <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
            Incident History
          </span>
          <span
            className="text-xs font-mono px-1.5 py-0.5 rounded ml-1"
            style={{
              background: "var(--bg-overlay)",
              color: "var(--ink-muted)",
              border: "1px solid var(--border-subtle)",
            }}
          >
            {incidents.length}
          </span>
        </div>
        <button onClick={fetchIncidents} className="btn btn-ghost">
          <RefreshCw size={12} />
          Refresh
        </button>
      </div>

      {/* Table — OpenSourceUI Customers Table pattern, dark-adapted */}
      <div className="flex-1 overflow-auto p-6">
        <div
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border-subtle)" }}
        >
          {/* Table head */}
          <div
            className="grid text-xs font-bold uppercase tracking-widest px-4 py-2.5 border-b"
            style={{
              gridTemplateColumns: "1fr 2fr 1fr 1fr 80px",
              background: "var(--bg-overlay)",
              borderColor: "var(--border-subtle)",
              color: "var(--ink-muted)",
              fontFamily: "var(--font-mono)",
            }}
          >
            <span>ID</span>
            <span>Title / Service</span>
            <span>Status</span>
            <span>Opened</span>
            <span className="text-right">View</span>
          </div>

          {/* Rows */}
          {loading ? (
            <div
              className="py-16 flex flex-col items-center justify-center gap-3 text-xs font-mono"
              style={{ color: "var(--ink-faint)" }}
            >
              <SpinLoader size="sm" iconClassName="text-[var(--ink-muted)]" />
              Loading incidents...
            </div>
          ) : incidents.length === 0 ? (
            <div
              className="py-16 text-center text-xs font-mono"
              style={{ color: "var(--ink-faint)" }}
            >
              No incidents found. Trigger one via the webhook to get started.
            </div>
          ) : (
            incidents.map((inc, i) => {
              const title =
                inc.trigger_data?.summary ||
                inc.trigger_data?.title ||
                "Unnamed Incident";
              const service = inc.trigger_data?.service || "—";
              const opened = new Date(inc.created_at).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={inc.id}
                  className="grid items-center px-4 py-3 border-b transition-colors"
                  style={{
                    gridTemplateColumns: "1fr 2fr 1fr 1fr 80px",
                    borderColor: "var(--border-subtle)",
                    background: i % 2 === 0 ? "transparent" : "var(--bg-overlay)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--bg-overlay)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background =
                      i % 2 === 0 ? "transparent" : "var(--bg-overlay)")
                  }
                >
                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    INC-{inc.id.slice(0, 6).toUpperCase()}
                  </span>

                  <div className="flex flex-col leading-none gap-0.5">
                    <span
                      className="text-xs font-medium"
                      style={{ color: "var(--ink)" }}
                    >
                      {title}
                    </span>
                    <span
                      className="text-xs font-mono"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      {service}
                    </span>
                  </div>

                  <div>
                    <StatusLozenge status={inc.status} />
                  </div>

                  <span
                    className="text-xs font-mono"
                    style={{ color: "var(--ink-muted)" }}
                  >
                    {opened}
                  </span>

                  <div className="flex justify-end">
                    <Link
                      href={`/?incident=${inc.id}`}
                      className="btn btn-ghost btn-sm"
                    >
                      <ExternalLink size={11} />
                      Open
                    </Link>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
