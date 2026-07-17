"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Zap, Bot, Star } from "lucide-react";
import { SignInButton, Show, useUser, useClerk } from "@clerk/nextjs";
import { useState } from "react";
import BentoGridThirdDemo from "@/components/bento-grid-demo-3";

// Palette:
// #242423 — Near Black  (backgrounds)
// #333533 — Dark Grey   (card surfaces)
// #e8eddf — Off White   (primary text)
// #cfdbd5 — Mint Grey   (secondary text, subtle borders)
// #f5cb5c — Mustard     (accent, CTAs)

export default function LandingPage() {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  return (
    <div
      className="min-h-screen flex flex-col relative z-10 w-full max-w-6xl mx-auto px-6"
      style={{ color: "#e8eddf" }}
    >
      {/* Navbar */}
      <nav className="flex items-center justify-between py-8">
        <Link href="/" className="flex items-center">
          <Image
            src="/logo.png"
            alt="ContextOps"
            width={400}
            height={200}
            className="w-48 md:w-64 h-auto object-contain"
            priority
          />
        </Link>
        <div className="flex items-center gap-6 text-sm font-medium">
          <Link
            href="#features"
            className="hidden sm:block transition-colors"
            style={{ color: "#cfdbd5" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e8eddf")}
            onMouseLeave={e => (e.currentTarget.style.color = "#cfdbd5")}
          >
            Features
          </Link>
          <Link
            href="#integrations"
            className="hidden sm:block transition-colors"
            style={{ color: "#cfdbd5" }}
            onMouseEnter={e => (e.currentTarget.style.color = "#e8eddf")}
            onMouseLeave={e => (e.currentTarget.style.color = "#cfdbd5")}
          >
            Integrations
          </Link>
          <Show when="signed-in">
            <Link
              href="/incidents"
              className="px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-all"
              style={{ background: "#f5cb5c", color: "#242423" }}
            >
              Open App <ArrowRight size={14} />
            </Link>
            {user && (
              <div className="relative">
                <img 
                  src={`https://api.dicebear.com/10.x/avataaars/svg?seed=${user.id}`} 
                  alt="User Avatar" 
                  className="w-9 h-9 rounded-md border border-white/10 cursor-pointer object-cover" 
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)} 
                  title="Profile Menu"
                />
                {isDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-50 border"
                    style={{ background: "#333533", borderColor: "var(--border-subtle, rgba(207,219,213,0.2))" }}
                  >
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-sm font-medium truncate" style={{ color: "#e8eddf" }}>
                        {user.fullName || user.primaryEmailAddress?.emailAddress}
                      </p>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5"
                      style={{ color: "#ef4444" }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            )}
          </Show>
          <Show when="signed-out">
            <SignInButton mode="modal">
              <button
                className="px-4 py-2 rounded-md flex items-center gap-2 font-medium transition-all"
                style={{ background: "#f5cb5c", color: "#242423" }}
              >
                Sign In <ArrowRight size={14} />
              </button>
            </SignInButton>
          </Show>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-28 pb-24 flex flex-col items-center text-center">
        {/* Badge */}
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono mb-8"
          style={{ background: "#333533", color: "#cfdbd5", border: "1px solid rgba(207,219,213,0.2)" }}
        >
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "#f5cb5c" }}></span>
          ContextOps AI Engine v1.0 is live
        </div>

        {/* Headline */}
        <h1
          className="text-5xl md:text-7xl font-bold tracking-tighter max-w-4xl mb-6 leading-tight"
          style={{ color: "#e8eddf" }}
        >
          The autonomous incident responder for{" "}
          <span style={{ color: "#f5cb5c" }}>modern SRE</span> teams.
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
          style={{ color: "#cfdbd5" }}
        >
          Don't just route alerts. Resolve them. ContextOps connects your infrastructure telemetry
          directly to your source code, diagnosing root causes in seconds.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-4 flex-wrap justify-center">
          <Link
            href="/incidents"
            className="px-6 py-3 rounded-md font-medium flex items-center gap-2 transition-all shadow-lg"
            style={{ background: "#f5cb5c", color: "#242423" }}
          >
            Start Investigating <ArrowRight size={16} />
          </Link>
          <Link
            href="https://github.com/Sreejesh06/contextOps"
            target="_blank"
            className="px-6 py-3 rounded-md font-medium flex items-center gap-2 transition-all"
            style={{ background: "#333533", color: "#e8eddf", border: "1px solid rgba(207,219,213,0.2)" }}
          >
            <Star size={16} style={{ color: "#f5cb5c", fill: "#f5cb5c" }} /> Star on GitHub
          </Link>
        </div>
      </section>

      {/* Bento Grid */}
      <section
        id="features"
        className="py-24"
        style={{ borderTop: "1px solid rgba(207,219,213,0.15)" }}
      >
        <div className="mb-16 text-center flex flex-col items-center">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#e8eddf" }}>
            The ContextOps Advantage
          </h2>
          <p className="max-w-xl text-lg" style={{ color: "#cfdbd5" }}>
            Stop treating symptoms. We designed this engine to completely eliminate the first 30
            minutes of incident triage for on-call engineers.
          </p>
        </div>
        <BentoGridThirdDemo />
      </section>

      {/* How It Works */}
      <section
        id="how-it-works"
        className="py-24 relative overflow-hidden"
        style={{ borderTop: "1px solid rgba(207,219,213,0.15)" }}
      >
        {/* Ambient Glow */}
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[300px] pointer-events-none"
          style={{ background: "#f5cb5c", opacity: 0.05, filter: "blur(100px)" }}
        />

        <div className="mb-16 text-center relative z-10">
          <h2 className="text-3xl font-bold mb-4" style={{ color: "#e8eddf" }}>
            How ContextOps Works
          </h2>
          <p className="max-w-xl mx-auto" style={{ color: "#cfdbd5" }}>
            The autonomous pipeline from infrastructure failure to code-level fix.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-start justify-between gap-12 max-w-5xl mx-auto relative z-10">
          {/* Connector lines */}
          <div
            className="hidden md:block absolute top-12 left-[16.66%] w-[33.33%] h-[2px] z-0"
            style={{
              background: "linear-gradient(to right, rgba(248,113,104,0.5), rgba(245,203,92,0.5))",
            }}
          />
          <div
            className="hidden md:block absolute top-12 left-[50%] w-[33.33%] h-[2px] z-0"
            style={{
              background: "linear-gradient(to right, rgba(245,203,92,0.5), rgba(75,206,151,0.5))",
            }}
          />

          {/* Step 1 */}
          <div className="flex-1 flex flex-col items-center text-center relative group">
            <div
              className="w-auto px-6 h-24 rounded-3xl flex items-center justify-center mb-6 z-10 relative overflow-hidden shadow-xl transition-transform duration-300 group-hover:-translate-y-2"
              style={{ background: "#333533", border: "1px solid rgba(207,219,213,0.15)" }}
            >
              <div className="flex items-center gap-4">
                <img src="https://cdn.simpleicons.org/datadog/F87168" alt="Datadog" className="w-8 h-8 opacity-90" />
                <div className="w-px h-8" style={{ background: "rgba(207,219,213,0.2)" }} />
                <img src="https://cdn.simpleicons.org/pagerduty/06AC38" alt="PagerDuty" className="w-7 h-7" />
              </div>
            </div>
            <h4 className="text-lg font-semibold mb-2" style={{ color: "#e8eddf" }}>Alert Triggers</h4>
            <p className="text-sm leading-relaxed max-w-[250px]" style={{ color: "#cfdbd5" }}>
              PagerDuty or Datadog fires a webhook containing raw symptom data.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex-1 flex flex-col items-center text-center relative group">
            <div
              className="w-auto px-6 h-24 rounded-3xl flex items-center justify-center mb-6 z-10 relative overflow-hidden shadow-xl transition-transform duration-300 group-hover:-translate-y-2"
              style={{ background: "#333533", border: "1px solid rgba(207,219,213,0.15)" }}
            >
              <div className="flex items-center gap-4">
                <Bot size={30} style={{ color: "#f5cb5c" }} />
                <div className="w-px h-8" style={{ background: "rgba(207,219,213,0.2)" }} />
                <img src="https://cdn.simpleicons.org/github/e8eddf" alt="GitHub" className="w-7 h-7" />
              </div>
            </div>
            <h4 className="text-lg font-semibold mb-2" style={{ color: "#e8eddf" }}>AI Contextualizes</h4>
            <p className="text-sm leading-relaxed max-w-[250px]" style={{ color: "#cfdbd5" }}>
              The agent queries GitHub, tracing the failing service back to recent commits.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex-1 flex flex-col items-center text-center relative group">
            <div
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6 z-10 relative overflow-hidden shadow-xl transition-transform duration-300 group-hover:-translate-y-2"
              style={{ background: "#333533", border: "1px solid rgba(207,219,213,0.15)" }}
            >
              <Zap size={36} style={{ color: "#4BCE97" }} />
            </div>
            <h4 className="text-lg font-semibold mb-2" style={{ color: "#e8eddf" }}>Root Cause Synthesized</h4>
            <p className="text-sm leading-relaxed max-w-[250px]" style={{ color: "#cfdbd5" }}>
              The dashboard streams the exact mitigation steps for the on-call engineer.
            </p>
          </div>
        </div>
      </section>

      {/* Integrations */}
      <section
        id="integrations"
        className="py-24 flex flex-col items-center text-center"
        style={{ borderTop: "1px solid rgba(207,219,213,0.15)" }}
      >
        <h2 className="text-3xl font-bold mb-6" style={{ color: "#e8eddf" }}>
          Powered by the Model Context Protocol
        </h2>
        <p className="max-w-2xl mb-12" style={{ color: "#cfdbd5" }}>
          ContextOps is built on an extensible MCP architecture. It dynamically loads plugins for
          any operational tool you use, adapting to any outage.
        </p>
        <div className="flex flex-wrap justify-center gap-3 max-w-3xl">
          {[
            { name: "GitHub", slug: "github", color: "e8eddf" },
            { name: "Datadog", slug: "datadog", color: "632CA6" },
            { name: "Kubernetes", slug: "kubernetes", color: "326CE5" },
            { name: "Grafana", slug: "grafana", color: "F46800" },
            { name: "PagerDuty", slug: "pagerduty", color: "06AC38" },
            { name: "Opsgenie", slug: "opsgenie", color: "cfdbd5" },
            { name: "Linear", slug: "linear", color: "5E6AD2" },
            { name: "PostgreSQL", slug: "postgresql", color: "4169E1" },
          ].map((tool) => (
            <div
              key={tool.name}
              className="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-3 transition-all cursor-default"
              style={{
                background: "#333533",
                border: "1px solid rgba(207,219,213,0.15)",
                color: "#e8eddf",
              }}
            >
              <img
                src={`https://cdn.simpleicons.org/${tool.slug}/${tool.color}`}
                alt={tool.name}
                className="w-4 h-4"
              />
              {tool.name}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer
        className="flex flex-col items-center justify-center w-full py-16 text-sm mt-4"
        style={{ borderTop: "1px solid rgba(207,219,213,0.15)", color: "#cfdbd5" }}
      >
        <Link href="/" className="flex items-center mb-3">
          <Image
            src="/logo.png"
            alt="ContextOps"
            width={240}
            height={120}
            className="w-32 md:w-48 h-auto object-contain"
          />
        </Link>
        <p className="mt-2 text-center" style={{ color: "#cfdbd5" }}>
          Copyright © 2026{" "}
          <Link href="/" className="hover:underline" style={{ color: "#e8eddf" }}>
            ContextOps
          </Link>
          . All rights reserved.
        </p>
        <div className="flex items-center gap-4 mt-6">
          <Link
            href="https://github.com/Sreejesh06/contextOps"
            target="_blank"
            className="font-medium flex items-center gap-1.5 transition-colors hover:text-[#e8eddf]"
            style={{ color: "#cfdbd5" }}
          >
            <Star size={14} style={{ color: "#f5cb5c", fill: "#f5cb5c" }} /> Star on GitHub
          </Link>
          <div className="h-4 w-px" style={{ background: "rgba(207,219,213,0.2)" }} />
          <Link href="#" className="font-medium transition-colors hover:text-[#e8eddf]" style={{ color: "#cfdbd5" }}>
            Documentation
          </Link>
          <div className="h-4 w-px" style={{ background: "rgba(207,219,213,0.2)" }} />
          <Link href="#" className="font-medium transition-colors hover:text-[#e8eddf]" style={{ color: "#cfdbd5" }}>
            MCP Plugins
          </Link>
        </div>
      </footer>
    </div>
  );
}
