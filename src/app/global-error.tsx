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
    console.error("Root Error:", error);
  }, [error]);

  return (
    <html lang="en" className="dark">
      <body className="bg-black text-[#fafafa] min-h-screen flex flex-col items-center justify-center p-6 font-mono text-center">
        <h1 className="text-8xl sm:text-9xl font-black text-red-500 tracking-tighter mb-2 select-none">
          500
        </h1>
        <p className="text-xs font-mono text-zinc-500 uppercase tracking-widest mb-6">
          Server Error
        </p>
        <button
          onClick={() => reset()}
          className="px-5 py-2 rounded-xl bg-[#22c55e] hover:bg-[#16a34a] text-black font-bold text-xs font-mono transition-colors cursor-pointer"
        >
          Retry
        </button>
      </body>
    </html>
  );
}
