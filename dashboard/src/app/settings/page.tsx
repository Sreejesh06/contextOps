"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Settings, FlaskConical, Webhook, Blocks, Users, ShieldAlert, Key, Globe, Search, Activity, GitBranch, CheckCircle2 } from "lucide-react";
import { SpinLoader } from "@/components/loaders/spin-loader";

type SimulateState = "idle" | "loading" | "success" | "error";

const PRESETS = [
  {
    label: "Database Connection Pool Exhausted",
    payload: {
      title: "Database connection pool exhausted",
      summary: "Database connection pool exhausted on payment-gateway",
      service: "payment-gateway",
      severity: "critical",
    },
  },
  {
    label: "OOMKilled — Pod Crash",
    payload: {
      title: "OOMKilled: payment-processor-v2 pod",
      summary: "Pod restarted due to OOMKilled exit code 137",
      service: "payment-gateway",
      severity: "high",
    },
  },
  {
    label: "Redis Timeout Surge",
    payload: {
      title: "Redis connection timeouts elevated",
      summary: "p99 Redis latency exceeded 2s threshold on 3 nodes",
      service: "cache-service",
      severity: "warning",
    },
  },
];

const SETTINGS_TABS = [
  { id: "general", label: "General", icon: Settings },
  { id: "integrations", label: "Integrations", icon: Blocks },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
  { id: "team", label: "Team & On-Call", icon: Users },
  { id: "danger", label: "Danger Zone", icon: ShieldAlert },
];

function ActionButton({ children, className, style, loadingText = "Processing...", successText = "Done!", icon: Icon, onClick, confirmMessage }: any) {
  const [status, setStatus] = useState<"idle"|"loading"|"success">("idle");
  const handleClick = async () => {
    if (confirmMessage && !window.confirm(confirmMessage)) return;
    if (onClick) onClick();
    setStatus("loading");
    await new Promise(r => setTimeout(r, 800));
    setStatus("success");
    setTimeout(() => setStatus("idle"), 2000);
  };
  return (
    <button onClick={handleClick} disabled={status !== "idle"} className={className} style={{...style, opacity: status === "loading" ? 0.7 : 1}}>
      {status === "loading" ? (
        <span className="flex items-center gap-2"><SpinLoader size="sm" iconClassName={style?.color === "var(--bg-base)" ? "text-[var(--bg-base)]" : "text-current"} /> {loadingText}</span>
      ) : status === "success" ? (
        <span className="flex items-center gap-2"><CheckCircle2 size={14} /> {successText}</span>
      ) : (
        <span className="flex items-center gap-2">
          {Icon && <Icon size={14} />}
          {children}
        </span>
      )}
    </button>
  );
}

function SettingsContent() {
  const searchParams = useSearchParams();
  const activeTab = searchParams.get("tab") || "general";
  const [selected, setSelected] = useState(0);
  const [state, setState] = useState<SimulateState>("idle");
  const [responseMsg, setResponseMsg] = useState("");

  const handleSimulate = async () => {
    setState("loading");
    try {
      const res = await fetch("http://localhost:8080/api/webhooks/pagerduty", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(PRESETS[selected].payload),
      });
      if (res.ok) {
        setState("success");
        setResponseMsg("Incident created and queued for AI investigation.");
      } else {
        setState("error");
        setResponseMsg(`Server returned ${res.status}`);
      }
    } catch (e: any) {
      setState("error");
      setResponseMsg(e.message || "Network error");
    }
    setTimeout(() => setState("idle"), 4000);
  };

  return (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: "var(--font-ui)" }}>
      {/* Page header */}
      <div
        className="shrink-0 flex items-center gap-2 px-6 py-0 border-b"
        style={{ height: "56px", borderColor: "var(--border-subtle)" }}
      >
        <Settings size={14} color="var(--ink-muted)" />
        <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Platform Settings
        </span>
      </div>

      <div className="flex-1 flex overflow-auto justify-center p-8 w-full max-w-6xl mx-auto">
        <div className="w-full">
          {activeTab === "webhooks" ? (
            <div className="max-w-2xl flex flex-col gap-10">
              
              <div>
                <h1 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>Webhooks</h1>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Configure incoming webhooks from PagerDuty, Datadog, or generic JSON payloads to trigger ContextOps.
                </p>
              </div>

              {/* API Keys (Mock) */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center gap-2 border-b pb-2" style={{ borderColor: "var(--border-subtle)" }}>
                  <Key size={14} color="var(--ink-muted)" />
                  <h2 className="text-sm font-bold" style={{ color: "var(--ink)" }}>Webhook Secrets</h2>
                </div>
                <div className="p-4 rounded-xl flex items-center justify-between" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs font-bold" style={{ color: "var(--ink)" }}>PagerDuty Integration Key</span>
                    <span className="text-[10px] font-mono" style={{ color: "var(--ink-muted)" }}>whsec_pd_live_8f92j...</span>
                  </div>
                  <ActionButton loadingText="Rotating..." successText="Rotated!" className="px-3 py-1.5 rounded text-xs font-bold" style={{ background: "var(--bg-sunken)", border: "1px solid var(--border-subtle)", color: "var(--ink)" }}>
                    Rotate Key
                  </ActionButton>
                </div>
              </section>

              {/* Simulate Incident — OpenSourceUI Contact Form pattern */}
              <section className="flex flex-col gap-4">
                <div className="flex items-center justify-between border-b pb-2" style={{ borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-center gap-2">
                    <FlaskConical size={14} color="var(--ink-muted)" />
                    <h2 className="text-sm font-bold" style={{ color: "var(--ink)" }}>
                      Simulate Incident
                    </h2>
                  </div>
                  <span className="text-[10px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded" style={{ background: "rgba(96,165,250,0.1)", color: "#60a5fa" }}>Developer Tool</span>
                </div>
                <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                  Fire a test webhook to the ContextOps API. The AI engine will pick it
                  up and stream its investigation to the Dashboard in real time.
                </p>

                <div
                  className="rounded-xl overflow-hidden mt-2"
                  style={{ border: "1px solid var(--border-subtle)" }}
                >
                  {/* Preset selector */}
                  <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
                    <label
                      className="block text-xs font-mono font-bold uppercase tracking-widest mb-3"
                      style={{ color: "var(--ink-muted)" }}
                    >
                      Incident preset
                    </label>
                    <div className="flex flex-col gap-2">
                      {PRESETS.map((p, i) => (
                        <button
                          key={i}
                          onClick={() => setSelected(i)}
                          className="flex items-center gap-3 p-3 rounded-lg text-left transition-all"
                          style={{
                            background: selected === i ? "var(--bg-overlay)" : "var(--bg-sunken)",
                            border: `1px solid ${selected === i ? "var(--border-default)" : "var(--border-subtle)"}`,
                            color: selected === i ? "var(--ink)" : "var(--ink-muted)",
                            boxShadow: selected === i ? "0 2px 8px rgba(0,0,0,0.2)" : "none"
                          }}
                        >
                          <span
                            className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                            style={{
                              borderColor: selected === i ? "#60a5fa" : "var(--border-default)",
                            }}
                          >
                            {selected === i && (
                              <span
                                className="w-2 h-2 rounded-full"
                                style={{ background: "#60a5fa" }}
                              />
                            )}
                          </span>
                          <span className="text-sm font-semibold">{p.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Payload preview */}
                  <div className="p-4 border-b bg-black/20" style={{ borderColor: "var(--border-subtle)" }}>
                    <label
                      className="block text-[10px] font-mono font-bold uppercase tracking-widest mb-2"
                      style={{ color: "var(--ink-faint)" }}
                    >
                      Payload
                    </label>
                    <pre
                      className="text-xs leading-relaxed rounded-lg p-4 whitespace-pre-wrap break-all"
                      style={{
                        background: "var(--bg-base)",
                        color: "#86efac",
                        fontFamily: "var(--font-mono)",
                        border: "1px solid var(--border-subtle)",
                        boxShadow: "inset 0 1px 4px rgba(0,0,0,0.5)"
                      }}
                    >
                      {JSON.stringify(PRESETS[selected].payload, null, 2)}
                    </pre>
                  </div>

                  {/* Action */}
                  <div className="p-4 flex items-center justify-between" style={{ background: "var(--bg-overlay)" }}>
                    <div className="flex items-center gap-3">
                      {state === "success" && (
                        <div
                          className="flex items-center gap-1.5 text-xs font-bold"
                          style={{ color: "#4ade80", fontFamily: "var(--font-mono)" }}
                        >
                          <CheckCircle2 size={14} />
                          {responseMsg}
                        </div>
                      )}
                      {state === "error" && (
                        <div
                          className="flex items-center gap-1.5 text-xs font-bold"
                          style={{ color: "#fca5a5", fontFamily: "var(--font-mono)" }}
                        >
                          <ShieldAlert size={14} />
                          {responseMsg}
                        </div>
                      )}
                      {state === "idle" && (
                        <span
                          className="text-xs"
                          style={{ color: "var(--ink-faint)", fontFamily: "var(--font-mono)" }}
                        >
                          POST /api/webhooks/pagerduty
                        </span>
                      )}
                    </div>
                    <button
                      onClick={handleSimulate}
                      disabled={state === "loading"}
                      className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-transform active:scale-95"
                      style={{
                        background: "var(--ink)",
                        color: "var(--bg-base)",
                        opacity: state === "loading" ? 0.7 : 1
                      }}
                    >
                      {state === "loading" ? (
                        <SpinLoader size="sm" iconClassName="text-[var(--bg-base)]" />
                      ) : (
                        <Globe size={14} />
                      )}
                      {state === "loading" ? "Firing Webhook..." : "Trigger Incident"}
                    </button>
                  </div>
                </div>
              </section>

            </div>
          ) : activeTab === "integrations" ? (
            <div className="max-w-3xl flex flex-col gap-8">
              <div>
                <h1 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>Integrations</h1>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Connect your existing tools to enable automated context gathering and incident resolution.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Datadog */}
                <div className="p-5 rounded-xl border flex flex-col gap-4 transition-all" style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#632ca6] flex items-center justify-center">
                        <img src="https://cdn.simpleicons.org/datadog/ffffff" alt="Datadog" className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>Datadog</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Connected</span>
                      </div>
                    </div>
                    <ActionButton loadingText="Configuring..." successText="Configured!" className="text-xs font-semibold px-3 py-1.5 rounded transition-colors hover:bg-black/20" style={{ color: "var(--ink-muted)", border: "1px solid var(--border-subtle)" }}>
                      Configure
                    </ActionButton>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                    Automatically fetch metrics, dashboards, and APM traces when an incident fires.
                  </p>
                </div>

                {/* PagerDuty */}
                <div className="p-5 rounded-xl border flex flex-col gap-4 transition-all" style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#06c853] flex items-center justify-center">
                        <img src="https://cdn.simpleicons.org/pagerduty/ffffff" alt="PagerDuty" className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>PagerDuty</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400">Connected</span>
                      </div>
                    </div>
                    <ActionButton loadingText="Configuring..." successText="Configured!" className="text-xs font-semibold px-3 py-1.5 rounded transition-colors hover:bg-black/20" style={{ color: "var(--ink-muted)", border: "1px solid var(--border-subtle)" }}>
                      Configure
                    </ActionButton>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                    Sync incident state, trigger webhooks, and manage on-call escalations.
                  </p>
                </div>

                {/* GitHub */}
                <div className="p-5 rounded-xl border flex flex-col gap-4 transition-all opacity-60 hover:opacity-100" style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-black/40 flex items-center justify-center border" style={{ borderColor: "var(--border-subtle)" }}>
                        <img src="https://cdn.simpleicons.org/github/ffffff" alt="GitHub" className="w-5 h-5 opacity-90" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>GitHub</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--ink-faint)" }}>Not Connected</span>
                      </div>
                    </div>
                    <ActionButton loadingText="Connecting..." successText="Connected!" className="text-xs font-bold px-3 py-1.5 rounded transition-transform active:scale-95 shadow-lg" style={{ background: "var(--ink)", color: "var(--bg-base)" }}>
                      Connect
                    </ActionButton>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                    Read repository runbooks, recent commits, and deployment actions.
                  </p>
                </div>

                {/* Slack */}
                <div className="p-5 rounded-xl border flex flex-col gap-4 transition-all opacity-60 hover:opacity-100" style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)" }}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "#4A154B" }}>
                        <img src="https://cdn.simpleicons.org/slack/ffffff" alt="Slack" className="w-5 h-5" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>Slack</span>
                        <span className="text-[10px] font-mono uppercase tracking-widest" style={{ color: "var(--ink-faint)" }}>Not Connected</span>
                      </div>
                    </div>
                    <ActionButton loadingText="Connecting..." successText="Connected!" className="text-xs font-bold px-3 py-1.5 rounded transition-transform active:scale-95 shadow-lg" style={{ background: "var(--ink)", color: "var(--bg-base)" }}>
                      Connect
                    </ActionButton>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--ink-muted)" }}>
                    Create incident channels, post updates, and chat with ContextOps AI.
                  </p>
                </div>
              </div>
            </div>
          ) : activeTab === "general" ? (
            <div className="max-w-2xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>General Settings</h1>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Manage your workspace identity and core configuration.
                </p>
              </div>

              <div className="flex flex-col gap-6 p-6 rounded-xl border shadow-sm" style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)" }}>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>
                    Workspace Name
                  </label>
                  <input 
                    type="text"
                    defaultValue="Sreejesh06/contextOps"
                    className="w-full bg-transparent text-sm px-3 py-2 rounded-lg outline-none transition-colors"
                    style={{ border: "1px solid var(--border-subtle)", color: "var(--ink)", background: "var(--bg-sunken)" }}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>
                    Default Timezone
                  </label>
                  <select
                    className="w-full bg-transparent text-sm px-3 py-2 rounded-lg outline-none transition-colors appearance-none"
                    style={{ border: "1px solid var(--border-subtle)", color: "var(--ink)", background: "var(--bg-sunken)" }}
                  >
                    <option>UTC (Coordinated Universal Time)</option>
                    <option>PST (Pacific Standard Time)</option>
                    <option>EST (Eastern Standard Time)</option>
                    <option>IST (Indian Standard Time)</option>
                  </select>
                </div>

                <div className="flex items-center justify-end pt-4 border-t" style={{ borderColor: "var(--border-subtle)" }}>
                  <ActionButton loadingText="Saving..." successText="Saved" className="px-4 py-2 rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-lg" style={{ background: "var(--ink)", color: "var(--bg-base)" }}>
                    Save Changes
                  </ActionButton>
                </div>
              </div>
            </div>
          ) : activeTab === "team" ? (
            <div className="max-w-3xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-end justify-between">
                <div>
                  <h1 className="text-xl font-bold mb-1" style={{ color: "var(--ink)" }}>Team & On-Call</h1>
                  <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                    Manage workspace members and view current on-call schedules.
                  </p>
                </div>
                <ActionButton icon={Users} loadingText="Inviting..." successText="Invite Sent" className="px-3 py-1.5 rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-lg" style={{ background: "var(--ink)", color: "var(--bg-base)" }}>
                  Invite Member
                </ActionButton>
              </div>

              <div className="flex flex-col rounded-xl overflow-hidden border shadow-sm" style={{ borderColor: "var(--border-subtle)" }}>
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b text-[10px] font-mono font-bold uppercase tracking-widest" style={{ background: "var(--bg-overlay)", borderColor: "var(--border-subtle)", color: "var(--ink-muted)" }}>
                  <div className="col-span-5">Member</div>
                  <div className="col-span-3">Role</div>
                  <div className="col-span-4">Status</div>
                </div>
                
                {/* Rows */}
                {[
                  { name: "Sreejesh", email: "sreejesh@contextops.com", role: "Owner", status: "Active On-Call", avatar: "https://github.com/sreejesh06.png" },
                  { name: "Alex Chen", email: "alex@contextops.com", role: "Responder", status: "Offline", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Alex" },
                  { name: "Sarah Connor", email: "sarah@contextops.com", role: "Admin", status: "Active On-Call", avatar: "https://api.dicebear.com/7.x/notionists/svg?seed=Sarah" }
                ].map((member, i) => (
                  <div key={i} className="grid grid-cols-12 gap-4 px-5 py-4 items-center border-b last:border-b-0" style={{ background: "var(--bg-base)", borderColor: "var(--border-subtle)" }}>
                    <div className="col-span-5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center shadow-inner" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
                        {member.avatar ? (
                          <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-xs font-bold text-white">{member.name.charAt(0)}</span>
                        )}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{member.name}</span>
                        <span className="text-xs" style={{ color: "var(--ink-faint)" }}>{member.email}</span>
                      </div>
                    </div>
                    <div className="col-span-3">
                      <span className="text-xs font-medium px-2 py-1 rounded" style={{ background: "var(--bg-sunken)", color: "var(--ink-muted)", border: "1px solid var(--border-subtle)" }}>
                        {member.role}
                      </span>
                    </div>
                    <div className="col-span-4 flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: member.status === "Offline" ? "transparent" : "#4ade80", border: member.status === "Offline" ? "1px solid var(--border-subtle)" : "none", boxShadow: member.status !== "Offline" ? "0 0 6px rgba(74, 222, 128, 0.5)" : "none" }} />
                      <span className="text-xs" style={{ color: member.status === "Offline" ? "var(--ink-faint)" : "var(--ink)" }}>{member.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : activeTab === "danger" ? (
            <div className="max-w-2xl flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div>
                <h1 className="text-xl font-bold mb-1" style={{ color: "#f43f5e" }}>Danger Zone</h1>
                <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
                  Irreversible actions. Please proceed with extreme caution.
                </p>
              </div>

              <div className="flex flex-col rounded-xl border border-rose-500/20 overflow-hidden shadow-sm">
                <div className="p-6 flex flex-col gap-2 border-b border-rose-500/10" style={{ background: "rgba(244, 63, 94, 0.02)" }}>
                  <h3 className="text-sm font-bold" style={{ color: "var(--ink)" }}>Transfer Ownership</h3>
                  <p className="text-xs" style={{ color: "var(--ink-muted)" }}>Transfer this workspace to another user or organization.</p>
                  <div className="mt-2">
                    <ActionButton loadingText="Initiating..." successText="Transfer Started" className="px-4 py-2 rounded-lg text-xs font-bold transition-transform active:scale-95" style={{ background: "var(--bg-overlay)", color: "var(--ink)", border: "1px solid var(--border-subtle)" }}>
                      Transfer Workspace
                    </ActionButton>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-2" style={{ background: "rgba(244, 63, 94, 0.05)" }}>
                  <h3 className="text-sm font-bold text-rose-500">Delete Workspace</h3>
                  <p className="text-xs text-rose-500/80">Once you delete a workspace, there is no going back. All runbooks, services, and incident data will be permanently purged.</p>
                  <div className="mt-2">
                    <ActionButton confirmMessage="Are you absolutely sure you want to permanently delete this workspace? This action cannot be undone." loadingText="Deleting..." successText="Workspace Deleted" className="px-4 py-2 rounded-lg text-xs font-bold transition-transform active:scale-95 shadow-lg bg-rose-500 text-white hover:bg-rose-600">
                      Delete Workspace
                    </ActionButton>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-4 text-center">
              <Blocks size={32} color="var(--ink-faint)" />
              <div className="flex flex-col gap-1">
                <h3 className="text-sm font-bold" style={{ color: "var(--ink-muted)" }}>Not Found</h3>
                <p className="text-xs" style={{ color: "var(--ink-faint)" }}>The requested settings panel does not exist.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={
      <div className="w-full h-full flex items-center justify-center p-12 text-center" style={{ fontFamily: "var(--font-ui)" }}>
        <SpinLoader size="md" />
      </div>
    }>
      <SettingsContent />
    </Suspense>
  );
}
