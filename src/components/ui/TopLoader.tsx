"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

export default function TopLoader() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const [done, setDone] = useState(false);

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pathRef = useRef(pathname);
  const mountedRef = useRef(false);

  const clearTimers = useCallback(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    intervalRef.current = null;
    timeoutRef.current = null;
  }, []);

  const start = useCallback(() => {
    clearTimers();
    setDone(false);
    setVisible(true);
    setProgress(6);
    intervalRef.current = setInterval(() => {
      setProgress((p) => {
        if (p >= 90) return p;
        const step = Math.max(0.4, (90 - p) * 0.13);
        return Math.min(p + step, 90);
      });
    }, 120);
  }, [clearTimers]);

  const stop = useCallback(() => {
    clearTimers();
    setProgress(100);
    setDone(true);
    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 320);
  }, [clearTimers]);

  // Initial full browser load (bar fills until window "load" fires)
  useEffect(() => {
    const onLoad = () => stop();
    if (document.readyState === "complete") {
      stop();
    } else {
      start();
      window.addEventListener("load", onLoad);
    }
    return () => window.removeEventListener("load", onLoad);
  }, [start, stop]);

  // Detect internal-link clicks to start simulating progress (nprogress style)
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const anchor = (e.target as HTMLElement | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank") return;
      const href = anchor.getAttribute("href") || "";
      if (/^(https?:|mailto:|tel:|javascript:)/i.test(href)) return;
      if (href.startsWith("#") || href.startsWith("/api") || href.startsWith("/cms")) return;
      start();
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [start]);

  // Finish the progress when the active route actually changes
  useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      return;
    }
    if (pathname === pathRef.current) {
      const t = setTimeout(stop, 80);
      return () => clearTimeout(t);
    }
    pathRef.current = pathname;
    const t = setTimeout(stop, 120);
    return () => clearTimeout(t);
  }, [pathname, stop]);

  if (!visible) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[200] pointer-events-none" aria-hidden="true">
      <div
        className="h-[3px] rounded-r-full transition-[width,opacity] duration-200 ease-out bg-gradient-to-r from-[#05C770] via-[#22c55e] to-emerald-300 shadow-[0_0_10px_rgba(34,197,94,0.9)]"
        style={{ width: `${progress}%`, opacity: done ? 0 : 1 }}
      />
    </div>
  );
}