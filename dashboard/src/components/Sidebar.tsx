import {
  DashboardCircleIcon,
  Alert01Icon,
  Activity01Icon,
  Settings01Icon,
} from "hugeicons-react";
import Link from "next/link";

export default function Sidebar() {
  return (
    <aside className="w-20 lg:w-64 h-full glass-panel flex flex-col justify-between py-6 px-4 shrink-0">
      <div className="flex flex-col items-center lg:items-start gap-12">
        <div className="w-full flex items-center justify-center lg:justify-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center neon-icon border border-white/20">
            <span className="font-bold text-lg leading-none mt-1">C</span>
          </div>
          <span className="hidden lg:block font-bold text-xl tracking-wider chromatic-text">
            ContextOps
          </span>
        </div>

        <nav className="w-full flex flex-col gap-6">
          <Link
            href="/"
            className="flex items-center gap-4 text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 group"
          >
            <DashboardCircleIcon className="w-6 h-6 group-hover:neon-icon transition-all" />
            <span className="hidden lg:block font-medium">Dashboard</span>
          </Link>
          <Link
            href="/incidents"
            className="flex items-center gap-4 text-white p-2 rounded-lg bg-white/10 glass-panel border-white/20"
          >
            <Alert01Icon className="w-6 h-6 neon-icon text-red-400" />
            <span className="hidden lg:block font-medium text-red-50">
              Active Incident
            </span>
          </Link>
          <Link
            href="/services"
            className="flex items-center gap-4 text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 group"
          >
            <Activity01Icon className="w-6 h-6 group-hover:neon-icon transition-all" />
            <span className="hidden lg:block font-medium">Services</span>
          </Link>
        </nav>
      </div>

      <div className="w-full flex flex-col gap-4">
        <Link
          href="/settings"
          className="flex items-center gap-4 text-white/60 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5 group"
        >
          <Settings01Icon className="w-6 h-6 group-hover:neon-icon transition-all" />
          <span className="hidden lg:block font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
