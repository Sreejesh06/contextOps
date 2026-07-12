"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, CheckCircle2, Info, Loader2 } from "lucide-react";

type LogMessage = {
  id: string;
  type?: "info" | "error" | "success" | "warning";
  content: string;
  timestamp: string;
};

export default function Timeline() {
  const [messages, setMessages] = useState<LogMessage[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Connect to ContextOps Core API WebSocket
    const ws = new WebSocket("ws://localhost:8080");

    ws.onopen = () => setIsConnected(true);
    
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // Assuming the payload can be standardized to LogMessage for now
        // Or if it's just raw data, we wrap it in a mock structure
        
        const newMessage: LogMessage = {
          id: data.id || crypto.randomUUID(),
          type: data.type || "info",
          content: data.message || data.content || JSON.stringify(data),
          timestamp: data.timestamp || new Date().toISOString(),
        };

        setMessages((prev) => [...prev, newMessage]);
      } catch (err) {
        // Fallback for non-JSON messages
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

  const getIcon = (type?: string) => {
    switch (type) {
      case "error": return <AlertCircle className="w-5 h-5 text-red-500" />;
      case "success": return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case "warning": return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-blue-400" />;
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl overflow-hidden relative">
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <h2 className="text-xl font-medium tracking-tight chromatic-text">Live Investigation Stream</h2>
        <div className="flex items-center gap-2 text-sm text-white/50">
          {isConnected ? (
            <>
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Connected
            </>
          ) : (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Connecting...
            </>
          )}
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        <AnimatePresence>
          {messages.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-white/30 text-center py-10"
            >
              Waiting for incident signals...
            </motion.div>
          )}
          
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 50, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 20,
              }}
              className="p-4 rounded-xl bg-white/5 border border-white/5 backdrop-blur-md flex items-start gap-4 hover:bg-white/10 transition-colors"
            >
              <div className="mt-1">{getIcon(msg.type)}</div>
              <div className="flex-1">
                <div className="text-sm font-medium text-white/90">
                  {msg.content}
                </div>
                <div className="text-xs text-white/40 mt-1 font-mono">
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
