"use client";

import { BookText, FileText, Search, Plus, Clock, X, AlertCircle, CheckCircle2, Copy, Check, Terminal, ExternalLink, ShieldAlert, Sparkles } from "lucide-react";
import { useState } from "react";
import { EvilBarChart } from "@/components/evilcharts/charts/recharts-bar-chart";
import { EvilPieChart } from "@/components/evilcharts/charts/recharts-pie-chart";
import { type ChartConfig } from "@/components/evilcharts/ui/recharts-chart";
import { C } from "@/lib/chart-theme";
import { SearchInput } from "@/components/ui/SearchInput";
import { SegmentedToggleButton } from "@/components/ui/SegmentedToggleButton";
import { SoftPillButton } from "@/components/ui/SoftPillButton";

const INITIAL_RUNBOOKS = [
  { id: "RB-01", title: "OOM Killer Troubleshooting",          filename: "oom_runbook.md",      service: "payment-gateway",  lastUpdated: "2d ago",  author: "sreejesh06", isArchived: false, stepsCount: 4 },
  { id: "RB-02", title: "Database Connection Pool Exhaustion", filename: "db_connections.md",   service: "auth-service",     lastUpdated: "5d ago",  author: "sreejesh06", isArchived: false, stepsCount: 4 },
  { id: "RB-03", title: "High API Latency Mitigation",         filename: "api_latency.md",      service: "payment-gateway",  lastUpdated: "1w ago",  author: "sreejesh06", isArchived: false, stepsCount: 4 },
  { id: "RB-04", title: "Notification Worker Timeout",         filename: "worker_timeout.md",   service: "notification-svc", lastUpdated: "3d ago",  author: "alice_eng",  isArchived: false, stepsCount: 4 },
  { id: "RB-05", title: "Checkout Session Expiry Handling",    filename: "checkout_session.md", service: "checkout-v2",      lastUpdated: "6d ago",  author: "bob_infra",  isArchived: false, stepsCount: 4 },
  { id: "RB-06", title: "Deprecated Legacy Checkout",          filename: "legacy_checkout.md",  service: "checkout-v1",      lastUpdated: "1y ago",  author: "alice_eng",  isArchived: true,  stepsCount: 3 },
];

const COVERAGE_DATA = [
  { service: "payment",   displayName: "payment-gw",  count: 2 },
  { service: "auth",      displayName: "auth-svc",    count: 1 },
  { service: "notif",     displayName: "notif-worker", count: 3 },
  { service: "checkout",  displayName: "checkout-v2", count: 1 },
  { service: "profile",   displayName: "profile-api", count: 0 },
];

const COVERAGE_CONFIG = {
  count: {
    label: "Runbooks",
    colors: { dark: ["#4BCE97"], light: ["#22c55e"] },
  },
} satisfies ChartConfig;

const RUNBOOK_CONTENT: Record<string, string[]> = {
  "RB-01": [
    "Check memory usage with `kubectl top pods -n prod -l app=payment-gateway`",
    "Identify and kill OOM-triggering process using `kill -9 $(pgrep -f memory-hog)`",
    "Scale memory limit via deployment manifest: `kubectl set resources deployment/payment-gateway --limits=memory=2Gi`",
    "Monitor for recurrence over next 2h using `kubectl logs -f deployment/payment-gateway`"
  ],
  "RB-02": [
    "Inspect pg_stat_activity for idle connections: `SELECT count(*), state FROM pg_stat_activity GROUP BY state;`",
    "Kill stuck connections with `SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE state = 'idle in transaction';`",
    "Check connection pool config: `echo $DATABASE_POOL_SIZE`",
    "Scale up replicas to distribute connection load: `kubectl scale deployment/auth-service --replicas=4`"
  ],
  "RB-03": [
    "Check Datadog APM traces: `datadog-cli trace search 'service:payment-gateway latency:>500ms'`",
    "Identify slowest downstream call and enable circuit breaker: `curl -X POST http://localhost:8080/circuit-breaker/trip`",
    "Verify CDN cache hit ratio: `curl -sI https://api.contextops.dev/health | grep X-Cache`",
    "Drain bad canary instances if error rate exceeds 2%"
  ],
  "RB-04": [
    "Check worker queue depth in Redis: `redis-cli LLEN queue:notifications`",
    "Restart worker pod: `kubectl rollout restart deployment/notification-svc -n prod`",
    "Verify consumer heartbeat: `tail -n 100 /var/log/celery/worker.log`",
    "Alert on-call if depth stays above 1000 after 5 minutes"
  ],
  "RB-05": [
    "Check session store for expired tokens: `redis-cli --scan --pattern 'sess:*' | wc -l`",
    "Purge stale sessions with cleanup script: `npm run clean:stale-sessions`",
    "Verify TTL config in Redis session store",
    "Test checkout flow end-to-end: `curl -k -X POST https://checkout.internal/healthcheck`"
  ],
  "RB-06": [
    "Legacy system — do not use for active incidents",
    "Refer to checkout-v2 runbooks instead (`RB-05`)",
    "Contact alice_eng for migration status"
  ],
};

export default function RunbooksPage() {
  const [runbooks,     setRunbooks]     = useState(INITIAL_RUNBOOKS);
  const [search,       setSearch]       = useState("");
  const [filter,       setFilter]       = useState<"all" | "my drafts" | "archived">("all");
  const [isModalOpen,  setIsModalOpen]  = useState(false);
  const [selectedRunbook, setSelectedRunbook] = useState<any>(null);
  const [copiedIndex,  setCopiedIndex]  = useState<number | null>(null);
  const [newRunbook,   setNewRunbook]   = useState({ title: "", service: "" });

  const filteredRunbooks = runbooks.filter(rb => {
    const matchesSearch = rb.title.toLowerCase().includes(search.toLowerCase()) || rb.service.toLowerCase().includes(search.toLowerCase());
    if (filter === "all")       return matchesSearch && !rb.isArchived;
    if (filter === "my drafts") return matchesSearch && rb.author === "sreejesh06" && !rb.isArchived;
    if (filter === "archived")  return matchesSearch && rb.isArchived;
    return matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRunbook.title || !newRunbook.service) return;
    setRunbooks([{
      id: `RB-0${runbooks.length + 1}`,
      title: newRunbook.title,
      filename: `${newRunbook.title.toLowerCase().replace(/[^a-z0-9]+/g, "_")}.md`,
      service: newRunbook.service.toLowerCase().replace(/\s+/g, "-"),
      lastUpdated: "Just now",
      author: "sreejesh06",
      isArchived: false,
      stepsCount: 3,
    }, ...runbooks]);
    setIsModalOpen(false);
    setNewRunbook({ title: "", service: "" });
  };

  const activeCount    = runbooks.filter(r => !r.isArchived).length;
  const uncoveredCount = COVERAGE_DATA.filter(s => s.count === 0).length;

  const authorCounts = [
    { name: "sreejesh06", count: runbooks.filter(r => !r.isArchived && r.author === "sreejesh06").length },
    { name: "alice_eng",  count: runbooks.filter(r => !r.isArchived && r.author === "alice_eng").length },
    { name: "bob_infra",  count: runbooks.filter(r => !r.isArchived && r.author === "bob_infra").length },
  ].filter(a => a.count > 0);

  const authorConfig = {
    sreejesh06: { label: "sreejesh06", colors: { dark: ["#60a5fa"], light: ["#3b82f6"] } },
    alice_eng:  { label: "alice_eng",  colors: { dark: ["#a78bfa"], light: ["#8b5cf6"] } },
    bob_infra:  { label: "bob_infra",  colors: { dark: ["#f5cb5c"], light: ["#eab308"] } },
  } satisfies ChartConfig;

  const copyToClipboard = (text: string, index: number) => {
    const codeMatch = text.match(/`([^`]+)`/);
    const commandToCopy = codeMatch ? codeMatch[1] : text;
    navigator.clipboard.writeText(commandToCopy);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="w-full h-full flex flex-col relative" style={{ fontFamily: "var(--font-ui)" }}>
      {/* ── Page Header ─────────────────────────────────── */}
      <div className="shrink-0 flex items-center justify-between px-6 border-b" style={{ height: "56px", borderColor: "var(--border-subtle)" }}>
        <div className="flex items-center gap-3">
          <BookText size={15} color="var(--ink-muted)" />
          <span className="text-sm font-semibold tracking-tight" style={{ color: "var(--ink)" }}>Runbook Library</span>
          <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)", border: "1px solid var(--border-subtle)" }}>
            {activeCount} active runbooks • {uncoveredCount > 0 ? `${uncoveredCount} coverage gap` : "100% coverage"}
          </span>
        </div>
        <SoftPillButton onClick={() => setIsModalOpen(true)}>
          <Plus size={14} /> Create Runbook
        </SoftPillButton>
      </div>

      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 max-w-6xl mx-auto w-full">
        {/* ── Hero Operational Coverage Command View ──────── */}
        <div className="grid grid-cols-12 gap-4">
          {/* Service Runbook Coverage Bar Chart (7 cols) */}
          <div className="col-span-7 p-5 rounded-xl flex flex-col justify-between" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>Service Runbook Coverage</span>
                <span className="text-[11px]" style={{ color: "var(--ink-muted)" }}>Mitigation runbook distribution across production services</span>
              </div>
              {uncoveredCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase" style={{ background: "rgba(245,205,71,0.12)", color: C.warning, border: "1px solid rgba(245,205,71,0.25)" }}>
                  <ShieldAlert size={11} /> 1 Uncovered
                </span>
              )}
            </div>

            <div className="h-[180px] w-full mt-2">
              <EvilBarChart
                data={COVERAGE_DATA}
                config={COVERAGE_CONFIG}
                className="h-[180px] w-full !aspect-auto"
                chartProps={{ margin: { top: 10, right: 10, left: -25, bottom: 0 } }}
              >
                <EvilBarChart.Grid strokeDasharray="2 2" stroke="rgba(255,255,255,0.06)" />
                <EvilBarChart.XAxis dataKey="displayName" tick={{ fill: "#8a918e", fontSize: 11 }} />
                <EvilBarChart.YAxis tick={{ fill: "#8a918e", fontSize: 11 }} allowDecimals={false} />
                <EvilBarChart.Tooltip roundness="md" variant="default" />
                <EvilBarChart.Bar dataKey="count" variant="gradient" radius={4} />
              </EvilBarChart>
            </div>

            <div className="flex items-center justify-between pt-2 border-t text-[11px]" style={{ borderColor: "var(--border-subtle)", color: "var(--ink-muted)" }}>
              <span>Target: &ge; 1 runbook per tier-1 microservice</span>
              <span className="font-mono text-emerald-400">80% SRE Covered</span>
            </div>
          </div>

          {/* Authorship & Audit Stats (5 cols) */}
          <div className="col-span-5 p-5 rounded-xl flex flex-col justify-between" style={{ background: "var(--bg-raised)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>Authorship & Audit Split</span>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded" style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)" }}>Active Team</span>
            </div>

            <div className="h-[140px] w-full flex items-center justify-center relative">
              <EvilPieChart
                data={authorCounts}
                dataKey="count"
                nameKey="name"
                config={authorConfig}
                className="h-[140px] w-full !aspect-auto"
              >
                <EvilPieChart.Pie innerRadius={42} outerRadius={60} cornerRadius={3} paddingAngle={4} />
                <EvilPieChart.Tooltip roundness="md" variant="default" />
              </EvilPieChart>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-lg font-bold font-mono" style={{ color: "var(--ink)" }}>{activeCount}</span>
                <span className="text-[9px] uppercase font-mono tracking-wider" style={{ color: "var(--ink-muted)" }}>Docs</span>
              </div>
            </div>

            {/* Quick action for missing coverage */}
            <div className="p-2.5 rounded-lg flex items-center justify-between gap-2" style={{ background: "var(--bg-sunken)", border: "1px solid var(--border-subtle)" }}>
              <div className="flex items-center gap-2">
                <Sparkles size={13} style={{ color: C.accent }} />
                <span className="text-[11px]" style={{ color: "var(--ink)" }}>Missing: <strong className="font-mono text-yellow-400">profile-api</strong></span>
              </div>
              <button 
                onClick={() => {
                  setNewRunbook({ title: "User Profile API Degradation", service: "profile-api" });
                  setIsModalOpen(true);
                }}
                className="text-[11px] font-mono px-2 py-0.5 rounded hover:bg-white/10 transition-colors"
                style={{ color: "#60a5fa", border: "1px solid rgba(96,165,250,0.3)" }}
              >
                + Add
              </button>
            </div>
          </div>
        </div>

        {/* ── Runbook Search & Filtering ──────────────────── */}
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold" style={{ color: "var(--ink)" }}>Runbook Documents</span>
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full" style={{ background: "var(--bg-raised)", color: "var(--ink-muted)", border: "1px solid var(--border-subtle)" }}>
              {filteredRunbooks.length} Available
            </span>
          </div>

          <div className="flex items-center gap-3">
            <SegmentedToggleButton 
              options={["All", "My Drafts", "Archived"]} 
              defaultIndex={0}
              onChange={(idx, val) => setFilter(val.toLowerCase() as "all" | "my drafts" | "archived")}
            />
            <SearchInput 
              value={search} 
              onChange={setSearch} 
              placeholder="Search runbook title or service..."
              className="w-64"
            />
          </div>
        </div>

        {/* ── Document Grid ───────────────────────────────── */}
        {filteredRunbooks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredRunbooks.map(rb => (
              <div 
                key={rb.id} 
                onClick={() => setSelectedRunbook(rb)}
                className="relative overflow-hidden rounded-xl p-5 shadow-sm cursor-pointer transition-all hover:-translate-y-0.5 hover:border-[#60a5fa]/40 flex flex-col justify-between"
                style={{ 
                  background: "var(--bg-raised)", 
                  border: "1px solid var(--border-subtle)",
                  opacity: rb.isArchived ? 0.65 : 1,
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div>
                      <span className="font-mono text-[10px] tracking-widest uppercase font-bold" style={{ color: "var(--ink-muted)" }}>
                        {rb.id}
                      </span>
                      <h3 className="mt-1.5 text-sm font-semibold leading-snug" style={{ color: "var(--ink)" }}>
                        {rb.title}
                      </h3>
                    </div>
                    <div className="size-8 shrink-0 flex items-center justify-center rounded-lg" style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)" }}>
                      <FileText size={15} />
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2 flex-wrap text-xs font-mono">
                    <span className="px-2 py-0.5 rounded text-[10px]" style={{ background: "var(--bg-sunken)", color: "var(--ink-soft)", border: "1px solid var(--border-subtle)" }}>
                      {rb.service}
                    </span>
                    <span className="text-[11px]" style={{ color: "var(--ink-faint)" }}>
                      @{rb.author}
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t flex items-center justify-between text-[11px] font-mono" style={{ borderColor: "var(--border-subtle)", color: "var(--ink-faint)" }}>
                  <span>Updated {rb.lastUpdated}</span>
                  <span className="flex items-center gap-1 font-semibold" style={{ color: rb.isArchived ? C.incident : C.healthy }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ background: rb.isArchived ? C.incident : C.healthy }} />
                    {rb.isArchived ? "ARCHIVED" : "READY"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-xl" style={{ border: "1px dashed var(--border-subtle)", background: "var(--bg-sunken)" }}>
            <BookText size={24} color="var(--ink-faint)" className="mb-2" />
            <h3 className="text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>No runbooks match your search</h3>
            <p className="text-xs mt-1" style={{ color: "var(--ink-faint)" }}>Try adjusting your filters or create a new runbook.</p>
          </div>
        )}
      </div>

      {/* ── Detail & Step Runner Modal ─────────────────── */}
      {selectedRunbook && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6" onClick={() => setSelectedRunbook(null)}>
          <div className="w-full max-w-2xl rounded-xl flex flex-col overflow-hidden shadow-2xl h-[80vh]" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }} onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b shrink-0" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-overlay)" }}>
              <div className="flex items-center gap-3">
                <Terminal size={18} style={{ color: "var(--ink-muted)" }} />
                <div>
                  <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>{selectedRunbook.title}</h3>
                  <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>{selectedRunbook.filename}</span>
                </div>
              </div>
              <button onClick={() => setSelectedRunbook(null)} className="p-1 hover:bg-white/10 rounded" style={{ color: "var(--ink-muted)" }}><X size={16} /></button>
            </div>

            <div className="flex-1 overflow-auto p-6 flex flex-col gap-5" style={{ background: "var(--bg-sunken)" }}>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-mono font-bold uppercase px-2 py-1 rounded" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--ink-muted)" }}>Service: {selectedRunbook.service}</span>
                <span className="text-xs font-mono font-bold uppercase px-2 py-1 rounded" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--ink-muted)" }}>Author: @{selectedRunbook.author}</span>
                <span className="text-xs font-mono font-bold uppercase px-2 py-1 rounded ml-auto" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--ink-faint)" }}>Updated {selectedRunbook.lastUpdated}</span>
              </div>

              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Operational Mitigation Protocol</span>
                  <span className="text-[11px] font-mono" style={{ color: "var(--ink-faint)" }}>Click copy icon to grab commands</span>
                </div>

                {(RUNBOOK_CONTENT[selectedRunbook.id] || ["No steps defined."]).map((step, i) => (
                  <div key={i} className="flex items-start justify-between gap-3 p-3.5 rounded-lg group" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <span className="shrink-0 w-5 h-5 rounded flex items-center justify-center text-[10px] font-mono font-bold" style={{ background: "var(--bg-base)", color: "var(--ink-muted)", border: "1px solid var(--border-subtle)" }}>
                        {i+1}
                      </span>
                      <p 
                        className="text-xs leading-relaxed pt-0.5" 
                        style={{ color: "var(--ink-soft)" }}
                        dangerouslySetInnerHTML={{ __html: step.replace(/`([^`]+)`/g, `<code style="background:#1d1e1c;padding:2px 6px;border-radius:4px;font-family:monospace;font-size:11px;border:1px solid #3e403e;color:#60a5fa">$1</code>`) }}
                      />
                    </div>
                    {step.includes("`") && (
                      <button
                        onClick={() => copyToClipboard(step, i)}
                        className="shrink-0 p-1.5 rounded hover:bg-white/10 transition-colors"
                        style={{ color: copiedIndex === i ? C.healthy : "var(--ink-muted)" }}
                        title="Copy command"
                      >
                        {copiedIndex === i ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="p-4 border-t flex justify-between items-center" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-overlay)" }}>
              <span className="text-xs font-mono" style={{ color: "var(--ink-faint)" }}>Verified for automated agent execution</span>
              <SoftPillButton onClick={() => setSelectedRunbook(null)}>Done</SoftPillButton>
            </div>
          </div>
        </div>
      )}

      {/* ── Create Modal ──────────────────────────────── */}
      {isModalOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-6">
          <div className="w-full max-w-md rounded-xl flex flex-col overflow-hidden shadow-2xl" style={{ background: "var(--bg-base)", border: "1px solid var(--border-subtle)" }}>
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: "var(--border-subtle)", background: "var(--bg-overlay)" }}>
              <div className="flex items-center gap-2">
                <Plus size={16} style={{ color: "var(--ink)" }} />
                <h3 className="font-semibold text-sm" style={{ color: "var(--ink)" }}>Create Runbook</h3>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 hover:bg-white/10 rounded" style={{ color: "var(--ink-muted)" }}><X size={16} /></button>
            </div>
            <form onSubmit={handleCreate} className="flex flex-col p-5 gap-4">
              {[
                { label: "Runbook Title",  placeholder: "e.g. Memory Leak Mitigation", key: "title"   as const },
                { label: "Target Service", placeholder: "e.g. billing-api",            key: "service" as const },
              ].map(({ label, placeholder, key }) => (
                <div key={key} className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>{label}</label>
                  <input type="text" required placeholder={placeholder} value={newRunbook[key]} onChange={e => setNewRunbook({ ...newRunbook, [key]: e.target.value })} className="w-full bg-transparent text-sm px-3 py-2 rounded-lg outline-none font-mono" style={{ border: "1px solid var(--border-subtle)", color: "var(--ink)", background: "var(--bg-sunken)" }} />
                </div>
              ))}
              <div className="flex items-center justify-end gap-3 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-xs font-bold" style={{ color: "var(--ink-muted)" }}>Cancel</button>
                <SoftPillButton type="submit">Create</SoftPillButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
