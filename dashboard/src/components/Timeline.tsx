"use client";

import { useEffect, useState, useRef } from "react";
import { cn } from "@/lib/cn";
import { Bot, Wrench, AlertTriangle, Info, CheckCircle2, Radio } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type LogMessage = {
  id: string;
  kind: "ai" | "tool" | "error" | "info" | "success";
  content: string;
  timestamp: string;
};

function classifyMessage(text: string): LogMessage["kind"] {
  if (!text) return "info";
  if (text.startsWith("AI:") || text.startsWith("Investigation complete")) return "ai";
  if (text.startsWith("Calling tool") || text.startsWith("Tool '")) return "tool";
  if (text.toLowerCase().includes("error")) return "error";
  if (text.startsWith("Started")) return "info";
  return "info";
}

function KindIcon({ kind }: { kind: LogMessage["kind"] }) {
  const props = { size: 13, strokeWidth: 2 };
  if (kind === "ai")      return <CheckCircle2 {...props} color="#4ade80" />;
  if (kind === "tool")    return <Wrench {...props} color="#fbbf24" />;
  if (kind === "error")   return <AlertTriangle {...props} color="#f87171" />;
  if (kind === "success") return <CheckCircle2 {...props} color="#4ade80" />;
  return <Info {...props} color="#60a5fa" />;
}

function kindLabel(kind: LogMessage["kind"]) {
  if (kind === "ai")   return { text: "AI",   style: "bg-emerald-950/60 text-emerald-400 border-emerald-900" };
  if (kind === "tool") return { text: "TOOL", style: "bg-amber-950/60 text-amber-400 border-amber-900" };
  if (kind === "error")return { text: "ERR",  style: "bg-red-950/60 text-red-400 border-red-900" };
  return { text: "LOG", style: "bg-blue-950/60 text-blue-400 border-blue-900" };
}

type Props = { incident?: any; onNewLog?: (log: any) => void };

export default function Timeline({ incident, onNewLog }: Props) {
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [filter, setFilter] = useState<"all" | "ai" | "tool">("all");
  const [connected, setConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Load historical logs from incident
  useEffect(() => {
    if (incident?.logs?.length) {
      const historical: LogMessage[] = incident.logs.map((log: any) => ({
        id: log.id,
        kind: classifyMessage(log.message),
        content: log.message,
        timestamp: log.created_at,
      }));
      setMessages(historical);
    } else {
      setMessages([]);
    }
  }, [incident?.id]);

  // WebSocket live stream
  useEffect(() => {
    if (!isClient) return;
    let ws: WebSocket;
    let timer: NodeJS.Timeout;
    let delay = 1000;

    function connect() {
      const url = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8080";
      ws = new WebSocket(url);
      ws.onopen  = () => { setConnected(true); delay = 1000; };
      ws.onclose = () => {
        setConnected(false);
        timer = setTimeout(connect, delay);
        delay = Math.min(delay * 1.5, 10000);
      };
      ws.onmessage = (e) => {
        try {
          const data = JSON.parse(e.data);
          const text = data.message || data.content || JSON.stringify(data);
          const newMsg = {
            id: data.id || crypto.randomUUID(),
            kind: classifyMessage(text),
            content: text,
            timestamp: data.timestamp || new Date().toISOString(),
          };
          setMessages(prev => [...prev, newMsg]);
          if (onNewLog) onNewLog({ id: newMsg.id, message: text, created_at: newMsg.timestamp });
        } catch {
          const newMsg = {
            id: crypto.randomUUID(), kind: "info" as const,
            content: e.data, timestamp: new Date().toISOString(),
          };
          setMessages(prev => [...prev, newMsg]);
          if (onNewLog) onNewLog({ id: newMsg.id, message: e.data, created_at: newMsg.timestamp });
        }
      };
    }
    connect();
    return () => { clearTimeout(timer); ws?.close(); };
  }, [isClient]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const filteredMessages = messages.filter(msg => filter === "all" || msg.kind === filter || (filter === 'ai' && msg.kind === 'success'));

  return (
    <div
      className="w-full h-full flex flex-col overflow-hidden rounded-xl"
      style={{
        background: "var(--bg-raised)",
        border: "1px solid var(--border-subtle)",
      }}
    >
      {/* Panel header */}
      <div
        className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b"
        style={{ borderColor: "var(--border-subtle)" }}
      >
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Radio size={13} color="var(--ink-muted)" />
            <span
              className="text-xs font-bold uppercase tracking-widest"
              style={{ color: "var(--ink-muted)", fontFamily: "var(--font-mono)" }}
            >
              Investigation Stream
            </span>
            <div className="flex items-center gap-1.5 ml-2">
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background: connected ? "#22c55e" : "#333533",
                  boxShadow: connected ? "0 0 6px rgba(34, 197, 94, 0.4)" : "none",
                  animation: connected ? "pulse-dot 2s infinite" : "none",
                }}
              />
              <span className="text-xs font-mono" style={{ color: "var(--ink-muted)" }}>
                {connected ? "live" : "offline"}
              </span>
            </div>
            {messages.length > 0 && (
              <span
                className="text-xs font-mono px-1.5 py-0.5 rounded ml-2"
                style={{
                  background: "var(--bg-overlay)",
                  color: "var(--ink-muted)",
                  border: "1px solid var(--border-subtle)",
                }}
              >
                {messages.length} entries
              </span>
            )}
          </div>
          
          <span className="w-px h-4 mx-1" style={{ background: "var(--border-subtle)" }} />

          {/* OpenSourceUI Segmented Control */}
          <div className="flex items-center gap-1 p-0.5 rounded-md" style={{ background: "var(--bg-sunken)", border: "1px solid var(--border-subtle)", width: "fit-content" }}>
            {(["all", "ai", "tool"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded transition-colors"
                style={{
                  background: filter === f ? "var(--bg-overlay)" : "transparent",
                  color: filter === f ? "var(--ink)" : "var(--ink-faint)",
                  border: `1px solid ${filter === f ? "var(--border-default)" : "transparent"}`,
                  boxShadow: filter === f ? "0 1px 2px rgba(0,0,0,0.2)" : "none"
                }}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Log body — OpenSourceUI Terminal Log pattern */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-2 flex flex-col gap-0"
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {!isClient || messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
            <div
              className="w-12 h-12 rounded-xl border flex items-center justify-center"
              style={{
                background: "var(--bg-sunken)",
                borderColor: "var(--border-strong)",
              }}
            >
              <Radio size={20} color="var(--ink-muted)" className="animate-pulse-dot" />
            </div>
            <div>
              <p
                className="text-sm font-semibold mb-1"
                style={{ color: "var(--ink)" }}
              >
                No Active Telemetry
              </p>
              <p
                className="text-xs max-w-sm mx-auto"
                style={{ color: "var(--ink-muted)" }}
              >
                The AI engine is idle. When a PagerDuty alert fires, the investigation stream will appear here in real-time.
              </p>
            </div>
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 py-16 px-6 text-center">
             <div className="w-10 h-10 rounded-xl border flex items-center justify-center" style={{ background: "var(--bg-sunken)", borderColor: "var(--border-default)" }}>
               <Info size={16} color="var(--ink-faint)" />
             </div>
             <p className="text-xs" style={{ color: "var(--ink-muted)" }}>No logs match the "{filter}" filter.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {filteredMessages.map((msg, i) => {
              const label = kindLabel(msg.kind);
              const cleanContent = msg.content
                .replace(/^AI:\s*/, "")
                .replace(/^Tool '(.+?)' returned:\s*/, "[$1] → ")
                .replace(/^Calling tool '(.+?)' with args:\s*/, "→ calling $1 ");

              return (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className={cn(
                    "terminal-line",
                    `terminal-line-${msg.kind === "success" ? "ai" : msg.kind}`
                  )}
                >
                  {/* Line number */}
                  <span
                    className="shrink-0 w-7 text-right select-none"
                    style={{ color: "var(--ink-faint)", fontSize: "10px" }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  {/* Icon */}
                  <span className="shrink-0 mt-px">
                    <KindIcon kind={msg.kind} />
                  </span>

                  {/* Content */}
                  <span
                    className="flex-1 text-xs leading-relaxed break-all"
                    style={{ color: "var(--ink-soft)" }}
                  >
                    {cleanContent}
                  </span>

                  {/* Tag + timestamp */}
                  <div className="shrink-0 flex flex-col items-end gap-1 ml-2">
                    <span
                      className={cn(
                        "text-xs font-semibold px-1.5 py-0.5 rounded border tracking-widest uppercase",
                        label.style
                      )}
                    >
                      {label.text}
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "var(--ink-faint)" }}
                    >
                      {new Date(msg.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </span>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
