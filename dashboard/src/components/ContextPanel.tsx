import { 
  AiBrain02Icon, 
  Settings02Icon, 
  DocumentValidationIcon 
} from "hugeicons-react";

export default function ContextPanel() {
  return (
    <div className="w-full h-full glass-panel flex flex-col p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-8">
        <AiBrain02Icon className="w-6 h-6 text-purple-400 neon-icon" />
        <h2 className="text-xl font-bold tracking-wider">AI Context</h2>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest flex items-center gap-2">
            <DocumentValidationIcon className="w-4 h-4" /> Root Cause Analysis
          </h3>
          <div className="p-4 rounded-xl bg-white/5 border border-white/5">
            <p className="text-sm text-white/80 leading-relaxed">
              Detected a sudden spike in Redis connection timeouts originating from 
              <code className="mx-1 px-1.5 py-0.5 rounded bg-black/50 text-emerald-300 font-mono text-xs">payment-processor-v2</code>.
              This correlates with the recent deployment 20 minutes ago.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-white/60 uppercase tracking-widest flex items-center gap-2">
            <Settings02Icon className="w-4 h-4" /> Suggested Remediation
          </h3>
          <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 glass-panel">
            <p className="text-sm text-purple-100 leading-relaxed mb-4">
              Rollback to the previous stable release or scale up the Redis cluster.
            </p>
            <button className="w-full py-2.5 rounded-lg bg-purple-500 hover:bg-purple-600 transition-colors font-medium text-sm shadow-[0_0_15px_rgba(168,85,247,0.4)]">
              Initiate Rollback Action
            </button>
          </div>
        </div>

        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col items-center justify-center text-center">
          {/* Placeholder for 3D Fluent Emoji / Shapefest PNGs */}
          <div className="w-32 h-32 mb-4 bg-white/5 rounded-full flex items-center justify-center border border-white/10 border-dashed relative">
            <span className="text-white/30 text-xs absolute w-full text-center p-4">
              Place 3D Emoji PNG here (e.g., from Microsoft Fluent Emoji or Shapefest)
            </span>
          </div>
          <p className="text-xs text-white/40 max-w-[200px]">
            The AI engine is continuously monitoring this incident.
          </p>
        </div>
      </div>
    </div>
  );
}
