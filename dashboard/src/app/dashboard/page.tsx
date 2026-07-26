import { Suspense } from "react";
import IncidentDashboard from "@/components/IncidentDashboard";

export default function Home() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center text-xs font-mono text-white/50">Loading incident context...</div>}>
      <IncidentDashboard />
    </Suspense>
  );
}
