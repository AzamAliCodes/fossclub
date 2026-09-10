"use client";

import { useEffect, useRef } from "react";

export default function AnimatedGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let animFrame: number;
    let time = 0;
    let started = prefersReducedMotion;
    let io: IntersectionObserver | null = null;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const draw = () => {
      time += 0.003;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const spacing = 80;
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;

      ctx.lineWidth = 0.5;

      for (let i = 0; i <= rows; i++) {
        const y = i * spacing;
        ctx.strokeStyle = "rgba(34, 34, 38, 0.5)";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
      }

      for (let j = 0; j <= cols; j++) {
        const x = j * spacing;
        ctx.strokeStyle = "rgba(34, 34, 38, 0.5)";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      for (let i = 0; i <= rows; i++) {
        for (let j = 0; j <= cols; j++) {
          const x = j * spacing;
          const y = i * spacing;
          const dist = Math.sqrt(
            Math.pow(x - canvas.width / 2, 2) + Math.pow(y - canvas.height / 2, 2)
          );
          const maxDist = Math.sqrt(
            Math.pow(canvas.width / 2, 2) + Math.pow(canvas.height / 2, 2)
          );
          const pulse = Math.sin(time * 2 - dist * 0.003) * 0.5 + 0.5;
          const alpha = pulse * 0.08 * (1 - dist / maxDist);

          if (alpha > 0.01) {
            ctx.fillStyle = `rgba(34, 197, 94, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      animFrame = requestAnimationFrame(draw);
    };

    const start = () => {
      if (started || prefersReducedMotion) return;
      started = true;
      draw();
    };
    const stop = () => {
      started = false;
      cancelAnimationFrame(animFrame);
    };

    if (prefersReducedMotion) {
      animFrame = requestAnimationFrame(draw);
      cancelAnimationFrame(animFrame);
    } else {
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) start();
          else stop();
        },
        { rootMargin: "100px" }
      );
      io.observe(canvas);
      start();
    }

    return () => {
      cancelAnimationFrame(animFrame);
      window.removeEventListener("resize", resize);
      io?.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      aria-hidden="true"
    />
  );
}
