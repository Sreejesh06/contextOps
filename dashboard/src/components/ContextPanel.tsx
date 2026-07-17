"use client";

import { Bot, BookOpen, GitBranch, Lightbulb, Clock, Activity, ShieldAlert, Zap, Check } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SpinLoader } from "@/components/loaders/spin-loader";

type Props = { incident?: any };

function FormattedText({ text, codeColor = "text-emerald-300", numColor = "text-emerald-500/70" }: { text: string, codeColor?: string, numColor?: string }) {
  return (
    <div className="flex flex-col gap-2">
      {text.split('\n').map((line, idx) => {
        if (!line.trim()) return null;
        
        const listMatch = line.match(/^(\d+\.)\s+(.*)/);
        if (listMatch) {
          const [, number, rest] = listMatch;
          const parts = rest.split(/`([^`]+)`/);
          return (
            <div key={idx} className="flex gap-3">
              <span className={`font-mono ${numColor} select-none shrink-0`}>{number}</span>
              <span>
                {parts.map((part, i) =>
                  i % 2 === 1 ? (
                    <code key={i} className={`px-1.5 py-0.5 rounded-md font-mono text-xs bg-black/40 border border-white/10 mx-1 ${codeColor}`}>
                      {part}
                    </code>
                  ) : (
                    <span key={i}>{part}</span>
                  )
                )}
              </span>
            </div>
          );
        }
        
        const parts = line.split(/`([^`]+)`/);
        return (
          <div key={idx}>
            {parts.map((part, i) =>
              i % 2 === 1 ? (
                <code key={i} className={`px-1.5 py-0.5 rounded-md font-mono text-xs bg-black/40 border border-white/10 mx-1 ${codeColor}`}>
                  {part}
                </code>
              ) : (
                <span key={i}>{part}</span>
              )
            )}
          </div>
        );
      })}
    </div>
  );
}

function Section({ icon: Icon, label, children, action }: { icon: any; label: string; children: React.ReactNode, action?: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div
          className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}
        >
          <Icon size={12} color="var(--ink-faint)" />
          {label}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </div>
  );
}

function EmptyState({ label, description, icon: Icon = Activity }: { label: string, description?: string, icon?: any }) {
  return (
    <div
      className="flex flex-col items-center justify-center gap-3 p-8 rounded-lg text-center"
      style={{
        background: "var(--bg-overlay)",
        border: "1px dashed var(--border-subtle)",
      }}
    >
      <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "var(--bg-sunken)", border: "1px solid var(--border-default)" }}>
        <Icon size={16} color="var(--ink-faint)" />
      </div>
      <div>
        <p className="text-sm font-medium mb-1" style={{ color: "var(--ink-soft)" }}>{label}</p>
        {description && (
          <p className="text-xs max-w-[200px]" style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ContextPanel({ incident }: Props) {
  const router = useRouter();
  const [resolving, setResolving] = useState(false);
  
  const markResolved = async () => {
    if (!incident) return;
    setResolving(true);
    await fetch(`/api/incidents/${incident.id}/resolve`, { method: "POST" });
    router.refresh();
    setResolving(false);
  };
  
  const aiMessages: string[] = [];
  if (incident?.logs) {
    incident.logs.forEach((log: any) => {
      if (log.message.startsWith("AI:")) {
        aiMessages.push(log.message.replace(/^AI:\s*/, "").trim());
      }
    });
  }

  const rootCause = aiMessages.length > 0 ? aiMessages[0] : null;
  const mitigation = aiMessages.length > 1 ? aiMessages[aiMessages.length - 1] : null;
  
  const toolCalls: string[] = [];
  if (incident?.logs) {
    incident.logs.forEach((log: any) => {
      if (log.message.startsWith("Calling tool")) {
        const match = log.message.match(/Calling tool '(.+?)'/);
        if (match && !toolCalls.includes(match[1])) toolCalls.push(match[1]);
      }
    });
  }

  const githubRepo = incident?.trigger_data?.github_repo || incident?.trigger_data?.repository || null;

  return (
    <div
      className="w-full h-full flex flex-col rounded-xl overflow-hidden"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      <div
        className="shrink-0 flex items-center gap-2 px-5 py-4 border-b"
        style={{ borderColor: "var(--border-subtle)", background: "var(--bg-sunken)" }}
      >
        <Bot size={14} color="var(--ink-muted)" />
        <span
          className="text-xs font-bold uppercase tracking-widest"
          style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}
        >
          Investigation Context
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-8">
        
        {/* Atlassian Progress Tracker Pattern */}
        {incident && (
          <div className="flex flex-col gap-5 mb-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Incident Lifecycle</span>
            <div className="flex w-full items-start justify-between relative px-2">
              {/* Background inactive track line */}
              <div className="absolute left-[24px] right-[24px] top-[7px] h-px z-0" style={{ background: "var(--border-subtle)" }} />
              
              {/* Active track line overlay */}
              {(() => {
                const activeIndex = (incident.status === "RESOLVED") ? 3 :
                                    (mitigation && incident.status !== "RESOLVED") ? 2 :
                                    (incident.status === "INVESTIGATING") ? 1 :
                                    0;
                
                return (
                  <div 
                    className="absolute left-[24px] top-[7px] h-px z-0 transition-all duration-300 ease-out" 
                    style={{ 
                      background: "#4BCE97", 
                      width: `calc(${(activeIndex / 3) * 100}% - ${activeIndex === 0 ? 0 : 48}px)` 
                    }} 
                  />
                );
              })()}

              {['Triggered', 'Investigating', 'Mitigated', 'Resolved'].map((step, idx) => {
                const isActive = incident.status === "RESOLVED" || 
                                 (incident.status === "INVESTIGATING" && idx <= 1) ||
                                 (incident.status === "IGNORED" && idx === 0) ||
                                 (mitigation && idx <= 2);
                                 
                const isCurrent = (incident.status === "RESOLVED" && step === "Resolved") ||
                                  (mitigation && incident.status !== "RESOLVED" && step === "Mitigated") ||
                                  (!mitigation && incident.status === "INVESTIGATING" && step === "Investigating");

                return (
                  <div key={step} className="flex flex-col items-center relative z-10 w-16">
                    <div 
                      className="w-3.5 h-3.5 rounded-full border-[1.5px] transition-colors duration-300 bg-black"
                      style={{
                        background: isCurrent ? "var(--bg-base)" : isActive ? "#4BCE97" : "var(--bg-sunken)",
                        borderColor: isCurrent ? "#f5cb5c" : isActive ? "#4BCE97" : "var(--border-strong)",
                        boxShadow: isCurrent ? "0 0 0 2px rgba(87,157,255,0.2)" : "none"
                      }}
                    />
                    <span 
                      className="text-xs font-mono whitespace-nowrap transition-colors duration-300 mt-2 text-center"
                      style={{ color: isCurrent ? "#f5cb5c" : isActive ? "var(--ink-soft)" : "var(--ink-faint)" }}
                    >
                      {step}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Atlassian-style structured layout: Split critical meta info into a grid */}
        {incident && (
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="p-4 rounded-lg flex flex-col gap-1 w-full sm:w-1/3 shrink-0" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
              <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Incident ID</span>
              <span className="font-mono text-sm" style={{ color: "var(--ink)" }}>INC-{incident.id.slice(0, 6).toUpperCase()}</span>
            </div>
            <div className="p-4 rounded-lg flex flex-col gap-1 flex-1" style={{ background: "var(--bg-overlay)", border: "1px solid var(--border-subtle)" }}>
              <span className="text-xs font-mono font-bold uppercase tracking-widest" style={{ color: "var(--ink-muted)" }}>Status</span>
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold tracking-widest uppercase ${incident.status === 'RESOLVED' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {incident.status}
                </span>
                {incident.status !== "RESOLVED" && (
                  <button
                    onClick={markResolved}
                    disabled={resolving}
                    className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold transition-transform"
                    style={{
                      background: "rgba(34,197,94,0.1)",
                      color: "#4BCE97",
                      border: "1px solid rgba(34,197,94,0.2)",
                    }}
                  >
                    {resolving ? (
                      <SpinLoader size="sm" iconClassName="text-[#4BCE97]" />
                    ) : (
                      <Check size={14} />
                    )}
                    {resolving ? "Resolving..." : "Resolve"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Root Cause - Uses full width now */}
        <Section icon={BookOpen} label="Root Cause Synthesis">
          {rootCause ? (
            <div
              className="p-5 rounded-lg text-sm leading-relaxed"
              style={{
                background: "var(--bg-sunken)",
                border: "1px solid var(--border-default)",
                color: "var(--ink)",
                fontFamily: "var(--font-ui)",
                lineHeight: 1.6,
              }}
            >
              <FormattedText text={rootCause} codeColor="text-rose-300" numColor="text-rose-500/70" />
            </div>
          ) : (
            <EmptyState 
              icon={ShieldAlert}
              label="Awaiting Analysis" 
              description="The AI is currently investigating telemetry to determine the root cause." 
            />
          )}
        </Section>

        {/* Dynamic Tools Grid */}
        {toolCalls.length > 0 && (
          <Section icon={Zap} label="Tools Executed">
            <div className="flex flex-wrap gap-2">
              {toolCalls.map((tool) => (
                <div
                  key={tool}
                  className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-md"
                  style={{
                    background: "var(--bg-sunken)",
                    color: "var(--ink)",
                    border: "1px solid var(--border-default)",
                    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  }}
                >
                  <Zap size={10} />
                  {tool}
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Repository Integration */}
        {githubRepo && (
          <Section icon={GitBranch} label="Affected Repository">
            <a
              href={`https://github.com/${githubRepo}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-lg group"
              style={{
                background: "var(--bg-overlay)",
                border: "1px solid var(--border-default)",
                textDecoration: "none",
                transition: "border-color 120ms ease",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-black border flex items-center justify-center shrink-0" style={{ borderColor: "var(--border-strong)" }}>
                  <GitBranch size={14} color="var(--ink)" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>{githubRepo.split('/')[1] || githubRepo}</span>
                  <span className="text-xs font-mono" style={{ color: "var(--ink-muted)" }}>{githubRepo.split('/')[0] || ''}</span>
                </div>
              </div>
              <span className="text-xs" style={{ color: "var(--ink-muted)" }}>View ↗</span>
            </a>
          </Section>
        )}

        {/* Mitigation - ADS Success Flag pattern */}
        <Section icon={Lightbulb} label="Suggested Mitigation">
          {mitigation ? (
            <div
              className="p-5 rounded-lg text-sm leading-relaxed relative overflow-hidden"
              style={{
                background: "rgba(34,197,94,0.03)",
                border: "1px solid rgba(34,197,94,0.15)",
                color: "#a7f3d0",
                fontFamily: "var(--font-ui)",
              }}
            >
              <div className="absolute top-0 left-0 bottom-0 w-1 bg-emerald-500/50" />
              <FormattedText text={mitigation} />
            </div>
          ) : (
            <EmptyState 
              icon={Activity}
              label="No Mitigation Yet" 
              description="A resolution strategy will be formulated once the root cause is confirmed." 
            />
          )}
        </Section>
      </div>
    </div>
  );
}
