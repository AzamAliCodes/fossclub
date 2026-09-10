"use client";

import React, { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Critical Root Exception:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-black text-[#fafafa] min-h-screen flex flex-col items-center justify-center p-6 font-mono">
        <div className="max-w-md w-full p-8 sm:p-12 rounded-2xl border border-white/20 bg-[#09090b] text-center shadow-2xl">
          <h1 className="text-7xl sm:text-9xl font-black text-red-500 tracking-tighter mb-4">
            500
          </h1>
          <h2 className="text-lg font-bold text-white mb-2 font-sans">
            Something Went Wrong
          </h2>
          <p className="text-xs text-zinc-400 mb-6 font-sans">
            A critical error occurred while rendering the page.
          </p>
          <button
            onClick={() => reset()}
            className="px-6 py-2.5 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs font-mono transition-colors cursor-pointer"
          >
            Try Again
          </button>
        </div>
      </body>
    </html>
  );
}
