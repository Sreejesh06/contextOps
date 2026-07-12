import Timeline from "@/components/Timeline";
import { GravityButton } from "@/components/GravityButton";
import { Activity } from "lucide-react";

export default function Home() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center justify-center min-h-screen">
      <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[minmax(150px,auto)] h-[85vh]">
        
        {/* Header Card */}
        <div className="col-span-1 md:col-span-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-3xl p-6 flex items-center justify-between shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
          <div>
            <p className="text-white/40 text-sm font-medium mb-1 uppercase tracking-widest">Active Incident</p>
            <h1 className="text-3xl md:text-5xl font-bold chromatic-text">INC-8092-SEV1</h1>
          </div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <span className="text-red-500 font-mono text-sm tracking-widest uppercase">Critical</span>
          </div>
        </div>

        {/* Timeline Area (Takes up most space) */}
        <div className="col-span-1 md:col-span-2 row-span-2 h-full">
          <Timeline />
        </div>

        {/* Info Card */}
        <div className="col-span-1 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-2xl p-6 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Activity className="w-24 h-24" />
          </div>
          <div>
            <h3 className="text-white/60 font-medium tracking-tight mb-2">Impact Surface</h3>
            <p className="text-2xl text-white">Payments API / US-East</p>
            <p className="text-white/40 mt-4 text-sm leading-relaxed">
              Anomaly detected in payment gateway latency. Root cause analysis engine is ingesting metrics.
            </p>
          </div>
        </div>

        {/* Remediation Card */}
        <div className="col-span-1 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 border border-white/10 backdrop-blur-2xl p-6 flex flex-col items-center justify-center">
          <h3 className="text-white/80 font-medium mb-6 text-center">Recommended Action Ready</h3>
          <GravityButton />
        </div>
        
      </div>
    </main>
  );
}
