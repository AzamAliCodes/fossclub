"use client";

import React, { useEffect } from "react";
import { CMSEventsManager } from "@/components/cms/CMSEventsManager";
import { CMSLogin } from "@/components/cms/CMSLogin";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function CMSEventsRoutePage() {
  const [session, setSession] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated) setSession(data.user);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-12 text-center text-gray-500 font-mono text-xs">Authenticating...</div>;
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
        <span className="text-xs font-mono text-emerald-400">Events Manager Subroute</span>
      </div>
      <CMSEventsManager />
    </div>
  );
}
