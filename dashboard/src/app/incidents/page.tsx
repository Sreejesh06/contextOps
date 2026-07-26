"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { RefreshCw, ExternalLink, Siren, Calendar } from "lucide-react";
import { SpinLoader } from "@/components/loaders/spin-loader";
import Link from "next/link";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedToggleButton } from "@/components/ui/SegmentedToggleButton";
import { MonthPickerCalendar } from "@/components/ui/MonthPickerCalendar";
import { SoftPillButton } from "@/components/ui/SoftPillButton";

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
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "investigating" | "resolved">("all");
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const filteredIncidents = incidents.filter(inc => {
    const title = inc.trigger_data?.summary || inc.trigger_data?.title || "Unnamed Incident";
    const service = inc.trigger_data?.service || "—";
    
    const matchesSearch = title.toLowerCase().includes(search.toLowerCase()) || 
                          service.toLowerCase().includes(search.toLowerCase()) ||
                          inc.id.toLowerCase().includes(search.toLowerCase());
                          
    const matchesFilter = filter === "all" || 
                          (filter === "investigating" && inc.status === "INVESTIGATING") || 
                          (filter === "resolved" && inc.status === "RESOLVED");

    const matchesDate = !selectedDate || new Date(inc.created_at).toDateString() === selectedDate.toDateString();
                          
    return matchesSearch && matchesFilter && matchesDate;
  });

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
        <SoftPillButton variant="light" onClick={fetchIncidents}>
          <RefreshCw size={12} />
          Refresh
        </SoftPillButton>
      </div>

      {/* Table — OpenSourceUI Customers Table pattern, dark-adapted */}
      <div className="flex-1 overflow-auto p-6 flex flex-col gap-4">
        
        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 relative">
            <SearchInput 
              value={search} 
              onChange={(val) => setSearch(val)} 
              placeholder="Search incidents..."
              containerClassName="w-64"
            />
            
            {/* Date Filter Button */}
            <button 
              onClick={() => setShowCalendar(!showCalendar)}
              className="flex items-center gap-2 h-9 px-3 rounded-lg transition-colors font-mono text-xs font-bold tracking-widest uppercase"
              style={{ 
                background: selectedDate ? "var(--ink)" : "var(--bg-overlay)", 
                color: selectedDate ? "var(--bg-base)" : "var(--ink-muted)",
                border: "1px solid var(--border-subtle)" 
              }}
            >
              <Calendar size={13} />
              {selectedDate ? selectedDate.toLocaleDateString("en-US", { month: "short", day: "numeric" }) : "Any Date"}
            </button>
            
            {/* Calendar Popover */}
            {showCalendar && (
              <div className="absolute left-64 ml-4 top-11 z-50">
                <MonthPickerCalendar 
                  onSelect={(date) => {
                    // Click same date to deselect, or pick new date
                    setSelectedDate(prev => prev?.toDateString() === date.toDateString() ? null : date);
                    setShowCalendar(false);
                  }}
                />
              </div>
            )}
          </div>

          <SegmentedToggleButton 
            options={["All", "Investigating", "Resolved"]} 
            defaultIndex={0}
            onChange={(idx, val) => setFilter(val.toLowerCase() as "all" | "investigating" | "resolved")}
          />
        </div>

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
          ) : filteredIncidents.length === 0 ? (
            <div
              className="py-16 text-center text-xs font-mono"
              style={{ color: "var(--ink-faint)" }}
            >
              No incidents found. Trigger one via the webhook to get started.
            </div>
          ) : (
            filteredIncidents.map((inc, i) => {
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
                      href={`/dashboard?incident=${inc.id}`}
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
