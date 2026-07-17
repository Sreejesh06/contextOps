"use client";

import { useState } from "react";
import { Settings, FlaskConical, CheckCircle2, AlertTriangle } from "lucide-react";
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

export default function SettingsPage() {
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

      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 max-w-xl">

        {/* Simulate Incident — OpenSourceUI Contact Form pattern */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <FlaskConical size={14} color="var(--ink-muted)" />
            <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              Simulate Incident
            </h2>
          </div>
          <p className="text-xs mb-4 leading-relaxed" style={{ color: "var(--ink-muted)" }}>
            Fire a test webhook to the ContextOps API. The AI engine will pick it
            up and stream its investigation to the Dashboard in real time.
          </p>

          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            {/* Preset selector */}
            <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <label
                className="block text-xs font-mono font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--ink-muted)" }}
              >
                Incident preset
              </label>
              <div className="flex flex-col gap-2">
                {PRESETS.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => setSelected(i)}
                    className="flex items-center gap-3 p-2.5 rounded-md text-left transition-colors"
                    style={{
                      background:
                        selected === i ? "var(--bg-overlay)" : "transparent",
                      border: `1px solid ${selected === i ? "var(--border-default)" : "var(--border-subtle)"}`,
                      color: selected === i ? "var(--ink)" : "var(--ink-muted)",
                    }}
                  >
                    <span
                      className="w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0"
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
                    <span className="text-xs">{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Payload preview */}
            <div className="p-4 border-b" style={{ borderColor: "var(--border-subtle)" }}>
              <label
                className="block text-xs font-mono font-bold uppercase tracking-widest mb-2"
                style={{ color: "var(--ink-muted)" }}
              >
                Payload
              </label>
              <pre
                className="text-xs leading-relaxed rounded-md p-3 overflow-x-auto"
                style={{
                  background: "var(--bg-sunken)",
                  color: "#86efac",
                  fontFamily: "var(--font-mono)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {JSON.stringify(PRESETS[selected].payload, null, 2)}
              </pre>
            </div>

            {/* Action */}
            <div className="p-4 flex items-center justify-between">
              {state === "success" && (
                <div
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "#86efac", fontFamily: "var(--font-mono)" }}
                >
                  <CheckCircle2 size={12} />
                  {responseMsg}
                </div>
              )}
              {state === "error" && (
                <div
                  className="flex items-center gap-1.5 text-xs"
                  style={{ color: "#fca5a5", fontFamily: "var(--font-mono)" }}
                >
                  <AlertTriangle size={12} />
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
              <button
                onClick={handleSimulate}
                disabled={state === "loading"}
                className="btn btn-primary ml-auto"
              >
                {state === "loading" ? (
                  <SpinLoader size="sm" iconClassName="text-white" />
                ) : (
                  <FlaskConical size={12} />
                )}
                {state === "loading" ? "Sending..." : "Trigger Incident"}
              </button>
            </div>
          </div>
        </section>

        {/* Environment info */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Settings size={14} color="var(--ink-muted)" />
            <h2 className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
              Environment
            </h2>
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            {[
              ["API Endpoint", "http://localhost:8080"],
              ["WebSocket", process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080"],
              ["Auth", "Clerk (configured)"],
              ["AI Model", "Groq — llama-3.1-70b-versatile"],
              ["Vector DB", "PostgreSQL + pgvector"],
            ].map(([k, v], i, arr) => (
              <div
                key={k}
                className="flex items-center justify-between px-4 py-2.5 text-xs"
                style={{
                  background: i % 2 === 0 ? "var(--bg-overlay)" : "transparent",
                  borderBottom: i < arr.length - 1 ? "1px solid var(--border-subtle)" : "none",
                }}
              >
                <span className="font-mono" style={{ color: "var(--ink-muted)" }}>{k}</span>
                <span className="font-mono" style={{ color: "var(--ink-soft)" }}>{v}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
