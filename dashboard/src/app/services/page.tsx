import { ServerCog, GitBranch, Info } from "lucide-react";

const defaultMappings = [
  { service: "payment-gateway", repo: "sreejesh06/orythm", severity: "critical" },
];

export default function ServicesPage() {
  return (
    <div className="w-full h-full flex flex-col" style={{ fontFamily: "var(--font-ui)" }}>
      {/* Page header */}
      <div
        className="shrink-0 flex items-center gap-2 px-6 py-0 border-b"
        style={{ height: "56px", borderColor: "var(--border-subtle)" }}
      >
        <ServerCog size={14} color="var(--ink-muted)" />
        <span className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
          Service Registry
        </span>
      </div>

      <div className="flex-1 overflow-auto p-6 flex flex-col gap-6 max-w-xl">
        {/* Info */}
        <div
          className="flex items-start gap-3 p-3 rounded-lg text-xs"
          style={{
            background: "rgba(96,165,250,0.06)",
            border: "1px solid rgba(96,165,250,0.15)",
            color: "#93c5fd",
            fontFamily: "var(--font-ui)",
            lineHeight: 1.6,
          }}
        >
          <Info size={13} className="shrink-0 mt-0.5" />
          <span>
            Service mappings define which GitHub repository the AI agent investigates
            when a PagerDuty alert fires for a given service. Override via the{" "}
            <code
              className="font-mono text-xs px-1 rounded"
              style={{ background: "rgba(96,165,250,0.1)", color: "#bfdbfe" }}
            >
              SERVICE_REPO_MAP
            </code>{" "}
            environment variable in{" "}
            <code
              className="font-mono text-xs px-1 rounded"
              style={{ background: "rgba(96,165,250,0.1)", color: "#bfdbfe" }}
            >
              core-api/.env
            </code>
            .
          </span>
        </div>

        {/* Table */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <GitBranch size={13} color="var(--ink-muted)" />
            <h2 className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
              Active Mappings
            </h2>
          </div>
          <div
            className="rounded-xl overflow-hidden"
            style={{ border: "1px solid var(--border-subtle)" }}
          >
            <div
              className="grid text-xs font-mono font-bold uppercase tracking-widest px-4 py-2.5 border-b"
              style={{
                gridTemplateColumns: "1fr 1fr 100px",
                background: "var(--bg-overlay)",
                borderColor: "var(--border-subtle)",
                color: "var(--ink-muted)",
              }}
            >
              <span>PagerDuty Service ID</span>
              <span>GitHub Repository</span>
              <span>Severity</span>
            </div>
            {defaultMappings.map((m, i) => (
              <div
                key={m.service}
                className="grid items-center px-4 py-3 text-xs"
                style={{
                  gridTemplateColumns: "1fr 1fr 100px",
                  background: i % 2 === 0 ? "transparent" : "var(--bg-overlay)",
                  borderBottom: "1px solid var(--border-subtle)",
                }}
              >
                <span className="font-mono" style={{ color: "var(--ink-soft)" }}>
                  {m.service}
                </span>
                <a
                  href={`https://github.com/${m.repo}`}
                  target="_blank"
                  rel="noopener"
                  className="font-mono flex items-center gap-1"
                  style={{ color: "#60a5fa", textDecoration: "none" }}
                >
                  <GitBranch size={10} />
                  {m.repo}
                </a>
                <span
                  className="lozenge lozenge-investigating font-bold tracking-widest text-xs"
                >
                  {m.severity}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Environment override */}
        <section>
          <div className="flex items-center gap-2 mb-3">
            <ServerCog size={13} color="var(--ink-muted)" />
            <h2 className="text-xs font-semibold" style={{ color: "var(--ink)" }}>
              Add a Service Mapping
            </h2>
          </div>
          <pre
            className="text-xs leading-relaxed rounded-xl p-4 whitespace-pre-wrap break-all"
            style={{
              background: "var(--bg-sunken)",
              color: "#86efac",
              fontFamily: "var(--font-mono)",
              border: "1px solid var(--border-subtle)",
            }}
          >{`# core-api/.env

# JSON string — maps PagerDuty service IDs → GitHub owner/repo
SERVICE_REPO_MAP='{"payment-gateway":"sreejesh06/orythm","auth-service":"sreejesh06/auth"}'

# Fallback if the service key is not found in SERVICE_REPO_MAP
DEFAULT_GITHUB_REPO="sreejesh06/orythm"`}</pre>
        </section>
      </div>
    </div>
  );
}
