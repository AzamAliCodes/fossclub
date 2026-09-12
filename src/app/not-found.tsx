"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";
import { playClickSound } from "@/lib/sound";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16 text-center font-mono">
      <h1 className="text-8xl sm:text-9xl font-black text-white tracking-tighter mb-2 select-none">
        404
      </h1>
      <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6">
        Not Found
      </p>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          onClick={() => { try { playClickSound(); } catch {} }}
          className="px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs font-mono transition-all flex items-center gap-2 shadow-lg shadow-[#22c55e]/20"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
        <button
          onClick={() => {
            try { playClickSound(); } catch {}
            if (typeof window !== "undefined") window.history.back();
          }}
          className="px-4 py-2 rounded-xl bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 text-zinc-300 hover:text-white text-xs font-mono transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back</span>
        </button>
      </div>
    </div>
  );
}
