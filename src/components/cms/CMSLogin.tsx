"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ShieldCheck, Lock, User, ArrowRight, Terminal, AlertCircle } from "lucide-react";
import { playClickSound, playSuccessSound } from "@/lib/sound";

export function CMSLogin({ onLoginSuccess }: { onLoginSuccess: (user: any) => void }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    playClickSound();

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        if (data.token) {
          localStorage.setItem("foss_cms_token", data.token);
        }
        playSuccessSound();
        onLoginSuccess(data.user);
      } else {
        setError(data.error || "Invalid username or password");
      }
    } catch {
      setError("Network error connecting to auth service");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center p-4 relative z-10">
      <div className="w-full max-w-md liquid-glass-card p-6 sm:p-8 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none" />
        
        {/* Header */}
        <div className="text-center space-y-3 mb-8">
          <div className="flex items-center justify-center mx-auto mb-2">
            <Image
              src="/images/logo-transparent.png"
              alt="FOSS Club SRM"
              width={36}
              height={36}
              className="object-contain foss-png-shiny-border"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-[#fafafa] tracking-tight">FOSS Club SRM CMS</h1>
            <p className="text-xs text-[#22c55e] font-mono">Restricted Root / Maintainer Portal</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-3 rounded-lg bg-[#2a1215] border border-[#7f1d1d] flex items-center space-x-2 text-xs text-[#f87171] font-mono">
            <AlertCircle className="w-4 h-4 text-[#f87171] flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div>
            <label className="block text-[#a1a1aa] mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Admin Username</span>
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black border border-[#222226] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#22c55e] transition-colors"
              placeholder="admin"
            />
          </div>

          <div>
            <label className="block text-[#a1a1aa] mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#22c55e]" />
              <span>Admin Passphrase</span>
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-black border border-[#222226] rounded-lg text-[#fafafa] focus:outline-none focus:border-[#22c55e] transition-colors"
              placeholder="••••••••"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <span>{loading ? "Authenticating..." : "Authenticate Session"}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
