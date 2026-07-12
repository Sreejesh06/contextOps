import { Notification02Icon } from "hugeicons-react";

export default function Header() {
  return (
    <header className="w-full h-20 glass-panel flex items-center justify-between px-8 shrink-0 mb-6 z-10 relative">
      <div className="flex flex-col">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse neon-icon"></span>
          <span className="text-red-400 font-mono text-sm tracking-widest font-semibold uppercase">
            Incident INC-8092
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white tracking-wide mt-1">
          PaymentGateway Timeout Surge
        </h1>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex flex-col text-right">
          <span className="text-white/50 text-xs font-mono uppercase tracking-widest">
            Failing Service
          </span>
          <span className="text-white font-semibold">
            payment-processor-v2
          </span>
        </div>
        <div className="w-px h-10 bg-white/10 mx-2"></div>
        <button className="relative w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-white/10 transition-colors border border-white/10">
          <Notification02Icon className="w-5 h-5 text-white/80" />
          <span className="absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full bg-red-500 neon-icon"></span>
        </button>
      </div>
    </header>
  );
}
