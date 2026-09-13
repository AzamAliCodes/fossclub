"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { CMSTeamManager } from "@/components/cms/CMSTeamManager";
import { CMSLogin } from "@/components/cms/CMSLogin";
import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";

import { verifyClientSession, isSessionExpired } from "@/lib/authClient";

export default function CMSTeamRoutePage() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("foss_cms_token");
      if (!token || isSessionExpired()) {
        setSession(null);
        return;
      }

      setLoading(true);
      verifyClientSession()
        .then((u) => setSession(u))
        .finally(() => setLoading(false));
    }

    const onExpired = () => setSession(null);
    window.addEventListener("cms-session-expired", onExpired);
    return () => window.removeEventListener("cms-session-expired", onExpired);
  }, []);

  if (loading) return null;
  if (!session) return <CMSLogin onLoginSuccess={(u) => setSession(u)} />;

  return (
    <div className="pt-28 pb-16 relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <Link
          href="/cms"
          className="text-xs font-mono text-gray-400 hover:text-white flex items-center gap-1.5"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to CMS Dashboard</span>
        </Link>
        <span className="text-xs font-mono text-emerald-400">Team Manager Subroute</span>
      </div>
      <CMSTeamManager />
    </div>
  );
}
