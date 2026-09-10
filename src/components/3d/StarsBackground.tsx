"use client";

import { useEffect, useRef } from "react";

/**
 * High-performance 2D canvas starfield.
 * Avoids persistent heavy WebGL contexts, drifting slowly in the deep navy background.
 * Respects prefers-reduced-motion and pauses on visibility change.
 */
export default function StarsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let width = 0;
    let height = 0;
    let stars: { x: number; y: number; r: number; a: number; phase: number; speed: number; emerald: boolean }[] = [];

    const countPerArea = 1 / 8500;

    const buildStars = () => {
      const count = Math.min(380, Math.floor(width * height * countPerArea));
      stars = Array.from({ length: count }).map((_, i) => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.2 + 0.3,
        a: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.04,
        emerald: i % 4 === 0,
      }));
    };

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildStars();
    };

    let start = performance.now();

    const draw = (now: number) => {
      ctx.clearRect(0, 0, width, height);
      const t = (now - start) / 1000;

      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        const twinkle = prefersReducedMotion
          ? 1
          : 0.5 + 0.5 * Math.sin(t * s.speed * 2.2 + s.phase);
        ctx.globalAlpha = s.a * (0.35 + 0.65 * twinkle);
        ctx.fillStyle = s.emerald ? "#a7f3d0" : "#d8e3ff";
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      if (!prefersReducedMotion) raf = requestAnimationFrame(draw);
    };

    resize();
    window.addEventListener("resize", resize);

    if (prefersReducedMotion) {
      draw(performance.now());
    } else {
      raf = requestAnimationFrame(draw);
    }

    const onVisibility = () => {
      cancelAnimationFrame(raf);
      if (!document.hidden && !prefersReducedMotion) {
        start = performance.now();
        raf = requestAnimationFrame(draw);
      }
    };
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-20 h-screen w-screen pointer-events-none overflow-hidden">
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="w-full h-full"
        style={{ opacity: 0.75 }}
      />
    </div>
  );
}
