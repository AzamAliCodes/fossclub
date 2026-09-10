"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { CMSLogin } from "@/components/cms/CMSLogin";
import { CMSTeamManager } from "@/components/cms/CMSTeamManager";
import { CMSEventsManager } from "@/components/cms/CMSEventsManager";
import { CMSRecruitmentManager } from "@/components/cms/CMSRecruitmentManager";
import { 
  ShieldCheck, Users, Calendar, Sparkles, LogOut, ExternalLink, 
  Bell, ArrowLeft, Terminal 
} from "lucide-react";
import { playClickSound } from "@/lib/sound";

export default function CMSPage() {
  const [session, setSession] = useState<{ username: string; role: string } | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"team" | "events" | "recruitment">("team");

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("foss_cms_token") : null;
    const headers: Record<string, string> = {};
    if (token) headers["Authorization"] = `Bearer ${token}`;

    fetch("/api/auth/me", { headers })
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setSession(data.user);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingAuth(false));
  }, []);

  const handleLogout = async () => {
    playClickSound();
    try {
      localStorage.removeItem("foss_cms_token");
      await fetch("/api/auth/logout", { method: "POST" });
      setSession(null);
    } catch {
      setSession(null);
    }
  };

  if (checkingAuth) {
    return (
      <div className="py-28 text-center text-gray-500 font-mono text-xs animate-pulse">
        Verifying CMS security authorization tokens...
      </div>
    );
  }

  if (!session) {
    return <CMSLogin onLoginSuccess={(user) => setSession(user)} />;
  }

  return (
    <div className="pt-28 pb-20 relative z-10 max-w-6xl mx-auto px-4 sm:px-6 min-h-[calc(100vh-80px)] flex flex-col">
      
      {/* Top Admin Control Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-6 border-b border-white/10 gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-[#0c2317] border border-[#14532d] flex items-center justify-center text-[#22c55e]">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-bold text-white tracking-tight font-mono">
                FOSS SRM CMS
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-[#0c2317] text-[#22c55e] border border-[#14532d]">
                Admin
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 font-mono">
              Signed in as <span className="text-zinc-200 font-semibold">{session.username}</span>
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center space-x-2 font-mono text-xs">
          <Link
            href="/"
            onClick={playClickSound}
            className="px-3 py-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-zinc-300 hover:text-white flex items-center space-x-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>View Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 border border-red-500/25 text-red-400 flex items-center space-x-1.5 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {/* CMS Navigation Tabs */}
      <div className="flex space-x-1.5 p-1 bg-white/[0.03] border border-white/10 rounded-xl mb-8 overflow-x-auto">
        {[
          { id: "team", label: "Team", icon: Users },
          { id: "events", label: "Events", icon: Calendar },
          { id: "recruitment", label: "Recruitments", icon: Sparkles },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playClickSound();
                setActiveTab(tab.id as any);
              }}
              className={`flex-1 min-w-[110px] py-2 px-3 text-xs font-mono font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                active
                  ? "bg-white/[0.12] text-white border border-white/20 shadow-sm"
                  : "text-zinc-400 hover:text-white hover:bg-white/[0.04] border border-transparent"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${active ? "text-[#22c55e]" : ""}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === "team" && <CMSTeamManager />}
      {activeTab === "events" && <CMSEventsManager />}
      {activeTab === "recruitment" && <CMSRecruitmentManager />}

    </div>
  );
}
