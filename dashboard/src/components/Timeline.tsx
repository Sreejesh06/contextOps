"use client";

import { useEffect, useState, useRef } from "react";
import { quantum } from "ldrs";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Alert01Icon, 
  Tick02Icon, 
  InformationCircleIcon 
} from "hugeicons-react";

type LogMessage = {
  id: string;
  type?: "info" | "error" | "success" | "warning";
  content: string;
  timestamp: string;
};

export default function Timeline() {
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsClient(true);
    quantum.register();
    
    const ws = new WebSocket("ws://localhost:8080");
    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const newMessage: LogMessage = {
          id: data.id || crypto.randomUUID(),
          type: data.type || "info",
          content: data.message || data.content || JSON.stringify(data),
          timestamp: data.timestamp || new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      } catch (e) {
        const newMessage: LogMessage = {
          id: crypto.randomUUID(),
          type: "info",
          content: event.data,
          timestamp: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, newMessage]);
      }
    };
    
    return () => {
      ws.close();
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const getIcon = (type?: string) => {
    switch (type) {
      case "error": return <Alert01Icon className="w-5 h-5 text-red-500 neon-icon" />;
      case "success": return <Tick02Icon className="w-5 h-5 text-emerald-400 neon-icon" />;
      case "warning": return <Alert01Icon className="w-5 h-5 text-amber-400 neon-icon" />;
      default: return <InformationCircleIcon className="w-5 h-5 text-blue-400 neon-icon" />;
    }
  };

  if (!isClient) return null;

  return (
    <div className="w-full h-full glass-panel flex flex-col p-6 rounded-2xl relative overflow-hidden">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 shrink-0">
        <h2 className="text-xl font-bold tracking-wider chromatic-text">Incident Stream</h2>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${isConnected ? "bg-emerald-400 neon-icon" : "bg-red-500 animate-pulse neon-icon"}`}></span>
          <span className="text-xs font-mono uppercase tracking-widest text-white/60">
            {isConnected ? "Connected" : "Disconnected"}
          </span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-4" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-white/40 gap-6">
            <l-quantum size="45" speed="1.75" color="rgba(255, 255, 255, 0.4)"></l-quantum>
            <p className="font-mono text-sm tracking-widest animate-pulse mt-4">AWAITING TELEMETRY...</p>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full glass-panel p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 transition-colors flex items-start gap-4"
              >
                <div className="mt-1 shrink-0">{getIcon(msg.type)}</div>
                <div className="flex-1 flex flex-col gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono text-white/40">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </span>
                    {msg.type && (
                      <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-black/40 border border-white/10 ${
                        msg.type === 'error' ? 'text-red-400' : 
                        msg.type === 'success' ? 'text-emerald-400' :
                        msg.type === 'warning' ? 'text-amber-400' : 'text-blue-400'
                      }`}>
                        {msg.type}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-white/90 leading-relaxed font-light">
                    {msg.content}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
