"use client";

import { ServerCog, GitBranch, BookText, Plus, Search, ShieldAlert, X, AlertCircle, CheckCircle2, Activity, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { EvilAreaChart } from "@/components/evilcharts/charts/recharts-area-chart";
import { EvilPieChart } from "@/components/evilcharts/charts/recharts-pie-chart";
import { type ChartConfig } from "@/components/evilcharts/ui/recharts-chart";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedToggleButton } from "@/components/ui/SegmentedToggleButton";
import { SoftPillButton } from "@/components/ui/SoftPillButton";
import { C } from "@/lib/chart-theme";

const INITIAL_SERVICES = [
  { id: "payment-gateway",  repo: "sreejesh06/orythm",      severity: "P1 Critical", status: "investigating", runbooks: 2, lastIncident: "2 hours ago", uptime: "99.82%" },
  { id: "auth-service",     repo: "sreejesh06/auth",         severity: "P1 Critical", status: "healthy",       runbooks: 1, lastIncident: "5 days ago",  uptime: "99.99%" },
  { id: "user-profile-api", repo: "sreejesh06/profile-api",  severity: "P2 High",     status: "healthy",       runbooks: 0, lastIncident: "3 weeks ago", uptime: "99.95%" },
  { id: "notification-svc", repo: "sreejesh06/notif-worker", severity: "P2 High",     status: "healthy",       runbooks: 3, lastIncident: "1 month ago", uptime: "99.90%" },
  { id: "checkout-v2",      repo: "sreejesh06/checkout",     severity: "P1 Critical", status: "healthy",       runbooks: 1, lastIncident: "10 days ago", uptime: "99.98%" },
];

const TELEMETRY_TREND = [
  { day: "Mon", requests: 120, latencyP99: 42, incidents: 0 },
  { day: "Tue", requests: 145, latencyP99: 48, incidents: 0 },
  { day: "Wed", requests: 138, latencyP99: 55, incidents: 1 },
  { day: "Thu", requests: 190, latencyP99: 78, incidents: 0 },
  { day: "Fri", requests: 210, latencyP99: 62, incidents: 0 },
  { day: "Sat", requests: 180, latencyP99: 45, incidents: 0 },
  { day: "Sun", requests: 165, latencyP99: 50, incidents: 1 },
];

const TELEMETRY_CONFIG = {
  requests: {
    label: "Traffic (k/min)",
    colors: { dark: ["#60a5fa"], light: ["#3b82f6"] },
  },
  latencyP99: {
    label: "P99 Latency (ms)",
    colors: { dark: ["#f5cb5c"], light: ["#eab308"] },
  },
} satisfies ChartConfig;

const HEALTH_CONFIG = {
  Healthy: {
    label: "Healthy",
    colors: { dark: ["#4BCE97"], light: ["#22c55e"] },
  },
  Investigating: {
    label: "Investigating",
    colors: { dark: ["#F87168"], light: ["#ef4444"] },
  },
} satisfies ChartConfig;

export default function ServicesPage() {
  const [services, setServices] = useState(INITIAL_SERVICES);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "healthy" | "incident">("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<any>(null);
  const [newService, setNewService] = useState({ id: "", repo: "", severity: "P2 High" });

  const filteredServices = services.filter(s => {
    const matchesSearch = s.id.toLowerCase().includes(search.toLowerCase()) || s.repo.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || (filter === "incident" ? s.status === "investigating" : s.status === "healthy");
    return matchesSearch && matchesFilter;
  });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.id || !newService.repo) return;
    setServices([{ 
      id: newService.id.toLowerCase().replace(/\s+/g, "-"), 
      repo: newService.repo, 
      severity: newService.severity, 
      status: "healthy", 
      runbooks: 0, 
      lastIncident: "Just registered",
      uptime: "100%" 
    }, ...services]);
    setIsModalOpen(false);
    setNewService({ id: "", repo: "", severity: "P2 High" });
  };

  const healthyCount = services.filter(s => s.status === "healthy").length;
  const incidentCount = services.filter(s => s.status === "investigating").length;
  const missingRunbooks = services.filter(s => s.runbooks === 0).length;

  const healthPieData = [
    { status: "Healthy", count: healthyCount },
    { status: "Investigating", count: incidentCount || 0.001 },
  ];

  return (
    <div className="w-full h-full flex flex-col relative" style={{ fontFamily: "var(--font-ui)" }}>
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-6 border-b" style={{ height: "56px", borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-3">
          <ServerCog size={15} color="var(--ink-muted)" />
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--ink)" }}>Service Registry</span>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium" style={{ background: incidentCount > 0 ? "rgba(248,113,104,0.15)" : "rgba(75,206,151,0.15)", color: incidentCount > 0 ? C.incident : C.healthy, border: `1px solid ${incidentCount > 0 ? "rgba(248,113,104,0.3)" : "rgba(75,206,151,0.3)"}` }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: incidentCount > 0 ? C.incident : C.healthy }} />
            {incidentCount > 0 ? `${incidentCount} Active Incident` : "All Services Healthy"}
          </span>
        </div>
        <SoftPillButton onClick={() => setIsModalOpen(true)}>
          <Plus size={14} /> Register Service
        </SoftPillButton>
      </div>

      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* ── KPI Metrics Row ─────────────────────────────── */}
        <div className="grid grid-cols-4 gap-4">
          <div className="p-4 rounded-xl flex flex-col justify-between" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Total Monitored</span>
              <ServerCog size={14} color="var(--ink-muted)" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono" style={{ color: "var(--ink)" }}>{services.length}</span>
              <span className="text-xs" style={{ color: "var(--ink-faint)" }}>services</span>
            </div>
            <span className="text-[11px] mt-1" style={{ color: C.healthy }}>100% telemetry active</span>
          </div>

          <div className="p-4 rounded-xl flex flex-col justify-between" style={{ background: "var(--bg-raised)", border: `1px solid ${incidentCount > 0 ? "rgba(248,113,104,0.4)" : "var(--border-subtle)"}` }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Active Incidents</span>
              <AlertCircle size={14} color={incidentCount > 0 ? C.incident : "var(--ink-muted)"} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono" style={{ color: incidentCount > 0 ? C.incident : C.healthy }}>{incidentCount}</span>
              <span className="text-xs" style={{ color: "var(--ink-faint)" }}>requiring triage</span>
            </div>
            <span className="text-[11px] mt-1" style={{ color: incidentCount > 0 ? C.incident : "var(--ink-muted)" }}>
              {incidentCount > 0 ? "P1 payment-gateway" : "Zero open incidents"}
            </span>
          </div>

          <div className="p-4 rounded-xl flex flex-col justify-between" style={{ background: "var(--bg-raised)", border: `1px solid ${missingRunbooks > 0 ? "rgba(245,205,71,0.3)" : "var(--border-subtle)"}` }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Runbook Coverage</span>
              <ShieldAlert size={14} color={missingRunbooks > 0 ? C.warning : C.healthy} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono" style={{ color: "var(--ink)" }}>
                {Math.round(((services.length - missingRunbooks) / services.length) * 100)}%
              </span>
              <span className="text-xs" style={{ color: "var(--ink-faint)" }}>documented</span>
            </div>
            <span className="text-[11px] mt-1" style={{ color: missingRunbooks > 0 ? C.warning : C.healthy }}>
              {missingRunbooks > 0 ? `${missingRunbooks} service missing runbook` : "Full runbook coverage"}
            </span>
          </div>

          <div className="p-4 rounded-xl flex flex-col justify-between" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>System Health</span>
              <Activity size={14} color={C.healthy} />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono" style={{ color: C.healthy }}>99.94%</span>
              <span className="text-xs" style={{ color: "var(--ink-faint)" }}>uptime 30d</span>
            </div>
            <span className="text-[11px] mt-1" style={{ color: "var(--ink-muted)" }}>SLA target 99.90%</span>
          </div>
        </div>

        {/* ── Main Analytical Charts Section ───────────────── */}
        <div className="grid grid-cols-12 gap-4">
          {/* Hero Telemetry Trend (8 cols) */}
          <div className="col-span-8 p-5 rounded-xl flex flex-col gap-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>Cross-Service Traffic & Latency Pulse</span>
                <span className="text-[11px]" style={{ color: "var(--ink-muted)" }}>7-day rolling request throughput and P99 latency response</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#60a5fa" }} /> Traffic</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#f5cb5c" }} /> Latency</span>
              </div>
            </div>

            <div className="h-[210px] w-full">
              <EvilAreaChart
                data={TELEMETRY_TREND}
                config={TELEMETRY_CONFIG}
                animationType="none"
                curveType="monotone"
                chartProps={{ margin: { top: 10, right: 10, left: -20, bottom: 0 } }}
                className="h-[210px] w-full !aspect-auto"
              >
                <EvilAreaChart.Grid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
                <EvilAreaChart.XAxis dataKey="day" tick={{ fill: "#8a918e", fontSize: 11 }} />
                <EvilAreaChart.YAxis tick={{ fill: "#8a918e", fontSize: 11 }} />
                <EvilAreaChart.Tooltip roundness="md" variant="default" />
                <EvilAreaChart.Area dataKey="requests" strokeVariant="solid" strokeWidth={2} variant="gradient" />
                <EvilAreaChart.Area dataKey="latencyP99" strokeVariant="solid" strokeWidth={2} variant="gradient" />
              </EvilAreaChart>
            </div>
          </div>

          {/* Health Donut Split (4 cols) */}
          <div className="col-span-4 p-5 rounded-xl flex flex-col justify-between" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>Service Health Distribution</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded" style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)" }}>Live</span>
            </div>

            <div className="h-[170px] w-full flex items-center justify-center relative">
              <EvilPieChart
                data={healthPieData}
                dataKey="count"
                nameKey="status"
                config={HEALTH_CONFIG}
                className="h-[170px] w-full !aspect-auto"
              >
                <EvilPieChart.Pie innerRadius={55} outerRadius={75} cornerRadius={4} paddingAngle={4} />
                <EvilPieChart.Tooltip roundness="md" variant="default" />
              </EvilPieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-bold font-mono" style={{ color: "var(--ink)" }}>{healthyCount}/{services.length}</span>
                <span className="text-[10px] uppercase font-mono tracking-wider" style={{ color: "var(--ink-muted)" }}>Healthy</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2 pt-2 border-t" style={{ borderColor: "var(--border-subtle)" }}>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--bg-sunken)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: C.healthy }} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase" style={{ color: "var(--ink-muted)" }}>Healthy</span>
                  <span className="text-xs font-bold font-mono" style={{ color: "var(--ink)" }}>{healthyCount}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ background: "var(--bg-sunken)" }}>
                <span className="w-2 h-2 rounded-full" style={{ background: C.incident }} />
                <div className="flex flex-col">
                  <span className="text-[10px] font-mono uppercase" style={{ color: "var(--ink-muted)" }}>Incident</span>
                  <span className="text-xs font-bold font-mono" style={{ color: incidentCount > 0 ? C.incident : "var(--ink)" }}>{incidentCount}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Service Registry Explorer ───────────────────── */}
        <div className="p-5 rounded-xl flex flex-col gap-4" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)" }}>
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>Registered Microservices</span>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)" }}>
                {filteredServices.length} {filteredServices.length === 1 ? "service" : "services"}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <SegmentedToggleButton
                options={["All", `Healthy (${healthyCount})`, `Incident (${incidentCount})`]}
                defaultIndex={0}
                onChange={(idx) => {
                  if (idx === 0) setFilter("all");
                  else if (idx === 1) setFilter("healthy");
                  else setFilter("incident");
                }}
              />
              <SearchInput
                placeholder="Search service ID or repo..."
                value={search}
                onChange={setSearch}
                containerClassName="w-64"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border" style={{ borderColor: "var(--border-subtle)" }}>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b text-[10px] font-mono font-bold uppercase tracking-wider" style={{ background: "var(--bg-sunken)", borderColor: "var(--border-subtle)", color: "var(--ink-muted)" }}>
                  <th className="py-2.5 px-4">Service</th>
                  <th className="py-2.5 px-4">Repository</th>
                  <th className="py-2.5 px-4">Severity Tier</th>
                  <th className="py-2.5 px-4">Runbooks</th>
                  <th className="py-2.5 px-4">Status</th>
                  <th className="py-2.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y" style={{ borderColor: "var(--border-subtle)" }}>
                {filteredServices.map(service => (
                  <tr 
                    key={service.id} 
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors"
                    onClick={() => setSelectedService(service)}
                  >
                    <td className="py-3 px-4 font-mono font-semibold" style={{ color: "var(--ink)" }}>
                      <div className="flex items-center gap-2">
                        <ServerCog size={13} color="var(--ink-muted)" />
                        <span>{service.id}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono" style={{ color: "var(--ink-soft)" }}>
                      <div className="flex items-center gap-1.5">
                        <GitBranch size={12} color="var(--ink-faint)" />
                        <span>{service.repo}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase" style={{
                        background: service.severity.includes("P1") ? "rgba(248,113,104,0.12)" : "rgba(245,205,71,0.12)",
                        color: service.severity.includes("P1") ? C.incident : C.warning,
                        border: `1px solid ${service.severity.includes("P1") ? "rgba(248,113,104,0.25)" : "rgba(245,205,71,0.25)"}`
                      }}>
                        {service.severity}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      {service.runbooks > 0 ? (
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: "var(--ink-soft)" }}>
                          <BookText size={12} color={C.healthy} /> {service.runbooks} linked
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px]" style={{ color: C.warning }}>
                          <ShieldAlert size={12} /> 0 (Missing)
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase" style={{
                        background: service.status === "healthy" ? "rgba(75,206,151,0.1)" : "rgba(248,113,104,0.1)",
                        color: service.status === "healthy" ? C.healthy : C.incident,
                        border: `1px solid ${service.status === "healthy" ? "rgba(75,206,151,0.2)" : "rgba(248,113,104,0.2)"}`
                      }}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: service.status === "healthy" ? C.healthy : C.incident }} />
                        {service.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-[11px] font-mono font-medium hover:underline" style={{ color: "#60a5fa" }}>
                        View <ArrowUpRight size={12} />
                      </span>
                    </td>
                  </tr>
                ))}
                {filteredServices.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center">
                      <ServerCog size={24} color="var(--ink-faint)" className="mx-auto mb-2" />
                      <h3 className="text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>No services found</h3>
                      <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>Try adjusting your search or filter.</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Detail Modal ──────────────────────────────── */}
      {selectedService && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setSelectedService(null)}>
          <div className="w-full max-w-lg rounded-xl flex flex-col overflow-hidden shadow-2xl" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-overlay)" }}>
              <div className="flex items-center gap-3">
                <ServerCog size={18} style={{ color: "var(--ink-muted)" }} />
                <div>
                  <h3 className="font-semibold text-sm font-mono" style={{ color: "var(--ink)" }}>{selectedService.id}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-widest flex items-center gap-1.5" style={{ color: "var(--ink-muted)" }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: selectedService.status === "healthy" ? C.healthy : C.incident }} />
                    {selectedService.status}
                  </span>
                </div>
              </div>
              <button onClick={() => setSelectedService(null)} className="p-1 hover:bg-white/10 rounded" style={{ color: "var(--ink-muted)" }}><X size={16} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4" style={{ background: "var(--bg-sunken)" }}>
              <div>
                <span className="text-xs font-bold font-mono uppercase tracking-wider" style={{ color: "var(--ink-muted)" }}>GitHub Repository</span>
                <a href={`https://github.com/${selectedService.repo}`} target="_blank" rel="noopener" className="flex items-center gap-2 text-sm font-mono w-fit hover:underline mt-1" style={{ color: "#60a5fa" }}>
                  <GitBranch size={14} /> {selectedService.repo}
                </a>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Runbooks",      value: `${selectedService.runbooks} Linked`, color: selectedService.runbooks > 0 ? C.healthy : C.warning },
                  { label: "Severity Tier", value: selectedService.severity,             color: "var(--ink)" },
                  { label: "Last Incident", value: selectedService.lastIncident,         color: "var(--ink)" },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex flex-col gap-1 p-3 rounded-lg" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
                    <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-faint)" }}>{label}</span>
                    <span className="text-xs font-semibold font-mono" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 border-t flex justify-end" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-overlay)" }}>
              <SoftPillButton onClick={() => setSelectedService(null)}>Close</SoftPillButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Register Modal ─────────────────────────────── */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-xl flex flex-col overflow-hidden shadow-2xl" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-overlay)" }}>
              <div className="flex items-center gap-2">
                <Plus size={16} style={{ color: "var(--ink)" }} />
                <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>Register Service</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/10 rounded" style={{ color: "var(--ink-muted)" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleRegister} className="flex flex-col p-5 gap-4">
              {[
                { label: "Service ID",    placeholder: "e.g. billing-api",   key: "id"   as const },
                { label: "GitHub Repo",   placeholder: "owner/repository",   key: "repo" as const },
              ].map(({ label, placeholder, key }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>{label}</label>
                  <input type="text" required placeholder={placeholder} value={newService[key]} onChange={e => setNewService({ ...newService, [key]: e.target.value })} className="w-full bg-transparent text-sm px-3 py-2 rounded-lg outline-none font-mono" style={{ border: "1px solid var(--border-subtle)", color: "var(--ink)", background: "var(--bg-sunken)" }} />
                </div>
              ))}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Severity</label>
                <select value={newService.severity} onChange={e => setNewService({ ...newService, severity: e.target.value })} className="w-full bg-transparent text-sm px-3 py-2 rounded-lg outline-none font-mono" style={{ border: "1px solid var(--border-subtle)", color: "var(--ink)", background: "var(--bg-sunken)" }}>
                  <option value="P1 Critical" className="bg-[#242423]">P1 Critical</option>
                  <option value="P2 High" className="bg-[#242423]">P2 High</option>
                  <option value="P3 Medium" className="bg-[#242423]">P3 Medium</option>
                </select>
              </div>
              <div className="flex items-center justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ color: "var(--ink-muted)" }}>Cancel</button>
                <SoftPillButton type="submit">Register</SoftPillButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
