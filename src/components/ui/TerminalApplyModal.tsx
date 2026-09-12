"use client";

import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { ExternalLink, X, Terminal } from "lucide-react";

const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const line: Variants = {
  hidden: { opacity: 0, y: 6 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function toEmbedUrl(url: string): string {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, "");

    if (host.endsWith("docs.google.com") && u.pathname.includes("/forms/")) {
      u.searchParams.delete("pli");
      u.searchParams.set("embedded", "true");
      return u.toString();
    }

    if (host.endsWith("tally.so")) {
      if (u.pathname.startsWith("/r/")) {
        const token = u.pathname.split("/")[2] || "";
        if (token) return `https://tally.so/embed/${token}`;
      }
      if (u.pathname.startsWith("/w/")) {
        const token = u.pathname.split("/")[2] || "";
        if (token) return `https://tally.so/embed/w/${token}`;
      }
      if (u.pathname.startsWith("/embed/")) {
        return u.toString();
      }
    }
  } catch {}
  return url;
}

interface TerminalApplyModalProps {
  open: boolean;
  onClose: () => void;
  applyUrl: string;
}

export default function TerminalApplyModal({ open, onClose, applyUrl }: TerminalApplyModalProps) {
  const embedUrl = open ? toEmbedUrl(applyUrl) : null;
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const check = () => setIsMobile(window.innerWidth <= 640);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  useEffect(() => {
    if (!open) {
      setProgress(0);
      setLoaded(false);
      return;
    }

    setProgress(0);
    setLoaded(false);

    const startedAt = Date.now();
    const duration = 1800;
    let raf = 0;
    const tick = () => {
      const pct = Math.min(((Date.now() - startedAt) / duration) * 100, 92);
      setProgress((prev) => Math.max(prev, pct));
      if (pct < 92) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    // Google Forms can delay/skip the iframe load event, so always complete
    const fallback = setTimeout(() => {
      setProgress(100);
      setLoaded(true);
    }, 3000);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(fallback);
    };
  }, [open]);

  const handleIframeLoad = () => {
    setProgress(100);
    setLoaded(true);
  };

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-6 pt-14 sm:pt-20 pb-8 bg-black/75 backdrop-blur-sm font-mono"
        >
          <div className="absolute inset-0 cursor-pointer" onClick={onClose} aria-label="Close modal overlay" />

          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.98 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            className="relative z-10 w-full max-w-4xl h-[76vh] max-h-[740px] min-h-[340px] bg-[#0c0d10] border border-[#22c55e]/40 rounded-xl shadow-[0_0_60px_rgba(34,197,94,0.18)] flex flex-col overflow-hidden"
          >
            {/* Form line loader */}
            <div className="absolute top-0 left-0 right-0 z-30 h-[3px] pointer-events-none bg-transparent">
              <div
                className="h-full rounded-r-full bg-gradient-to-r from-[#05C770] via-[#22c55e] to-emerald-300 shadow-[0_0_10px_rgba(34,197,94,0.9)] transition-[width,opacity] duration-200 ease-out"
                style={{ width: `${progress}%`, opacity: loaded || progress === 0 ? 0 : 1 }}
              />
            </div>

            {/* Title bar */}
            <div className="h-10 sm:h-11 bg-[#12141a] border-b border-[#22c55e]/20 px-2.5 sm:px-4 flex items-center justify-between gap-2 select-none shrink-0">
              <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-3 h-3 rounded-full bg-[#ff5f56] hover:opacity-80 transition-opacity shrink-0"
                  title="Close application terminal"
                  aria-label="Close"
                />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e] shrink-0" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f] shrink-0" />
                <span className="ml-2 sm:ml-3 text-[9px] sm:text-xs text-[#22c55e] tracking-wider flex items-center gap-1.5 min-w-0">
                  <Terminal className="w-3 h-3 shrink-0" />
                  <span className="truncate">root@foss-club:~$ ./apply.sh</span>
                </span>
              </div>

              <div className="flex items-center gap-2.5 shrink-0 pl-1">
                <a
                  href={applyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onClose()}
                  className="inline-flex items-center gap-1 text-[9px] sm:text-xs text-[#22c55e]/80 hover:text-[#22c55e] underline underline-offset-2 transition-colors whitespace-nowrap"
                  title="Open form in a new tab"
                >
                  <span>open external</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
                <button
                  type="button"
                  onClick={onClose}
                  className="text-gray-400 hover:text-white px-1.5 py-0.5 rounded text-sm transition-colors"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Info banner */}
            <div className="bg-[#090a0e] border-b border-[#22c55e]/15 px-3 sm:px-4 py-1.5 text-[10px] sm:text-[11px] text-gray-400 flex items-center justify-between gap-2 shrink-0">
              <motion.div variants={stagger} initial="hidden" animate="show" className="flex items-center gap-2 min-w-0">
                <motion.span variants={line} className="text-[#22c55e] font-bold shrink-0">
                  [RECRUIT]
                </motion.span>
                <motion.span variants={line} className="truncate hidden sm:inline">
                  &gt; secure channel to registration form established
                </motion.span>
                <motion.span variants={line} className="truncate sm:hidden">
                  &gt; registration form
                </motion.span>
              </motion.div>
              <span className="text-emerald-400 text-[10px] sm:text-[11px] flex items-center gap-1.5 shrink-0 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                ONLINE
              </span>
            </div>

            {/* Body */}
            <div className="flex-1 min-h-0 w-full bg-white relative overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]">
              <iframe
                src={embedUrl ?? undefined}
                onLoad={handleIframeLoad}
                width="100%"
                frameBorder="0"
                allowFullScreen
                scrolling="yes"
                className={`w-full border-0 block ${isMobile ? "h-[2850px]" : "h-full"}`}
                title="FOSS Club SRM Recruitment Application Form"
              >
                Loading application form…
              </iframe>
            </div>

            {/* Status bar */}
            <div className="h-8 sm:h-9 bg-[#12141a] border-t border-[#22c55e]/20 px-3 sm:px-4 flex items-center justify-between shrink-0">
              <span className="text-[10px] sm:text-[11px] text-[#22c55e] flex items-center gap-2">
                <span className="w-2 h-3.5 bg-[#22c55e]/70 inline-block animate-pulse" />
                root@foss-club:~$
              </span>
              <span className="text-[10px] sm:text-[11px] text-gray-500 truncate">
                waiting for your application…
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}