"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { playClickSound } from "@/lib/sound";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-4 py-20 relative z-10 text-center font-mono">
      <div className="w-full max-w-md mx-auto liquid-glass-card p-8 sm:p-12 rounded-2xl border border-white/15 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

        {/* Error Number */}
        <h1 className="text-7xl sm:text-9xl font-black text-white tracking-tighter mb-4 select-none">
          404
        </h1>

        {/* Short & Clean Message */}
        <h2 className="text-lg sm:text-xl font-bold text-white mb-2 tracking-tight font-sans">
          Page Not Found
        </h2>
        <p className="text-xs sm:text-sm text-zinc-400 max-w-xs mx-auto mb-8 font-sans">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>

        {/* Clean Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            onClick={() => {
              try { playClickSound(); } catch {}
            }}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs font-mono transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#22c55e]/20"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Go Home</span>
          </Link>
          <button
            onClick={() => {
              try { playClickSound(); } catch {}
              if (typeof window !== "undefined") window.history.back();
            }}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-white font-semibold text-xs font-mono transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </div>
    </div>
  );
}
