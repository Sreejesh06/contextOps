"use client";

import { useEffect, useState } from "react";
import Timeline from "./Timeline";
import ContextPanel from "./ContextPanel";
import Header from "./Header";

export type Incident = {
  id: string;
  status: string;
  trigger_data: any;
  created_at: string;
  logs: any[];
};

export default function IncidentDashboard() {
  const [incident, setIncident] = useState<Incident | null>(null);

  const fetchLatestIncident = async () => {
    try {
      const res = await fetch("http://localhost:8080/api/incidents");
      if (res.ok) {
        const list = await res.json();
        if (list.length > 0) {
          const detailRes = await fetch(
            `http://localhost:8080/api/incidents/${list[0].id}`
          );
          if (detailRes.ok) setIncident(await detailRes.json());
        }
      }
    } catch (e) {
      console.error("Failed to fetch incident", e);
    }
  };

  useEffect(() => {
    fetchLatestIncident();
  }, []);

  return (
    <div className="flex flex-col" style={{ height: "100vh", overflow: "hidden" }}>
      <Header incident={incident} onResolve={fetchLatestIncident} />
      
      {/* 
        ENHANCEMENT: Moving from a constrained fixed-width sidebar to a robust CSS Grid. 
        This prevents massive empty space on large screens and allocates proportional 
        weight to the Investigation (left) vs Analysis (right).
      */}
      <div
        className="flex-1 overflow-hidden p-4 grid gap-4"
        style={{ 
          minHeight: 0,
          gridTemplateColumns: "minmax(0, 5fr) minmax(0, 4fr)", // Proportional split
          alignItems: "stretch"
        }}
      >
        <div className="h-full overflow-hidden flex flex-col">
          <Timeline 
            incident={incident} 
            onNewLog={(log) => {
              setIncident(prev => prev ? { ...prev, logs: [...(prev.logs || []), log] } : prev);
            }}
          />
        </div>
        <div className="h-full overflow-hidden flex flex-col">
          <ContextPanel incident={incident} />
        </div>
      </div>
    </div>
  );
}
