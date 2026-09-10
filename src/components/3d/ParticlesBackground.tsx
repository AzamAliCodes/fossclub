"use client";

import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  baseAlpha: number;
  alpha: number;
  twinkleSpeed: number;
  twinklePhase: number;
  color: string;
}

interface GalacticNode {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  baseAlpha: number;
}

interface Meteor {
  x: number;
  y: number;
  length: number;
  speed: number;
  angle: number;
  alpha: number;
  active: boolean;
}

interface PixelSnowFlake {
  x: number;
  y: number;
  size: number;
  speedY: number;
  driftX: number;
  driftPhase: number;
  alpha: number;
}

export default function ParticlesBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    let galaxyCore1: CanvasGradient | null = null;
    let galaxyCore2: CanvasGradient | null = null;

    // Handle high DPI and resizing
    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.scale(dpr, dpr);

      // Pre-compute galaxy gradients only once per resize instead of every 16ms frame
      galaxyCore1 = ctx.createRadialGradient(
        width * 0.3, height * 0.35, 10,
        width * 0.3, height * 0.35, width * 0.45
      );
      galaxyCore1.addColorStop(0, "rgba(255, 255, 255, 0.022)");
      galaxyCore1.addColorStop(0.5, "rgba(255, 255, 255, 0.008)");
      galaxyCore1.addColorStop(1, "rgba(0, 0, 0, 0)");

      galaxyCore2 = ctx.createRadialGradient(
        width * 0.7, height * 0.6, 20,
        width * 0.7, height * 0.6, width * 0.5
      );
      galaxyCore2.addColorStop(0, "rgba(255, 255, 255, 0.018)");
      galaxyCore2.addColorStop(1, "rgba(0, 0, 0, 0)");
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Pure White & Silver Celestial Star Shades
    const WHITE_STAR_PALETTE = ["#ffffff", "#fafafa", "#f4f4f5", "#e4e4e7", "#ffffff"];

    // 1. White Twinkling Galaxy Starfield (Optimized count for 120 FPS performance)
    const starCount = Math.min(130, Math.floor((width * height) / 8000));
    const stars: Star[] = Array.from({ length: starCount }, () => {
      const baseAlpha = Math.random() * 0.6 + 0.15;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 1.5 + 0.4,
        baseAlpha,
        alpha: baseAlpha,
        twinkleSpeed: Math.random() * 0.025 + 0.008,
        twinklePhase: Math.random() * Math.PI * 2,
        color: WHITE_STAR_PALETTE[Math.floor(Math.random() * WHITE_STAR_PALETTE.length)],
      };
    });

    // 2. Interactive White Constellation Mesh Nodes (Optimized for minimal pairwise loop)
    const nodeCount = Math.min(26, Math.floor((width * height) / 36000));
    const nodes: GalacticNode[] = Array.from({ length: nodeCount }, () => {
      const baseAlpha = Math.random() * 0.35 + 0.25;
      return {
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 1.8 + 1,
        color: "#ffffff",
        alpha: baseAlpha,
        baseAlpha,
      };
    });

    // 3. Pure Diamond White Meteors (Shooting Stars)
    const meteors: Meteor[] = [];
    const createMeteor = () => {
      if (meteors.length >= 2) return;
      meteors.push({
        x: Math.random() * (width * 0.8) + width * 0.1,
        y: Math.random() * (height * 0.4),
        length: Math.random() * 100 + 70,
        speed: Math.random() * 8 + 10,
        angle: (Math.PI / 4) + (Math.random() - 0.5) * 0.25, // ~45 deg
        alpha: 1,
        active: true,
      });
    };

    const meteorTimer = setInterval(() => {
      if (Math.random() > 0.3) createMeteor();
    }, 4000);

    // 4. Crisp Falling Pixel Snow (React Bits style, instant 0ms native canvas rendering)
    const snowCount = Math.min(80, Math.floor((width * height) / 14000));
    const snowFlakes: PixelSnowFlake[] = Array.from({ length: snowCount }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() < 0.25 ? 3 : Math.random() < 0.6 ? 2 : 1.5,
      speedY: Math.random() * 0.45 + 0.35,
      driftX: (Math.random() - 0.5) * 0.25,
      driftPhase: Math.random() * Math.PI * 2,
      alpha: Math.random() * 0.45 + 0.25,
    }));

    // Mouse tracking for gravitational galaxy reaction
    let mouseX = -9999;
    let mouseY = -9999;
    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };
    const onMouseLeave = () => {
      mouseX = -9999;
      mouseY = -9999;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("mouseleave", onMouseLeave, { passive: true });

    let isTabVisible = true;
    const onVisibilityChange = () => {
      isTabVisible = !document.hidden;
      if (isTabVisible) {
        animId = requestAnimationFrame(render);
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    // Render loop
    const render = () => {
      if (!isTabVisible) return;

      ctx.clearRect(0, 0, width, height);

      // ── A. Deep Cosmic Galaxy Core (Pre-computed cached gradients) ──
      if (galaxyCore1) {
        ctx.fillStyle = galaxyCore1;
        ctx.fillRect(0, 0, width, height);
      }
      if (galaxyCore2) {
        ctx.fillStyle = galaxyCore2;
        ctx.fillRect(0, 0, width, height);
      }

      // ── B. Twinkling White Starfield ──
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.twinklePhase += s.twinkleSpeed;
        const currentAlpha = s.baseAlpha + Math.sin(s.twinklePhase) * 0.28;
        const safeAlpha = Math.max(0.08, Math.min(0.95, currentAlpha));

        ctx.fillStyle = s.color;
        ctx.globalAlpha = safeAlpha;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── C. White Constellation Connection Lines (Batched single path with squared distance) ──
      const connectDist = 115;
      const connectDistSq = connectDist * connectDist;
      ctx.strokeStyle = "rgba(255, 255, 255, 0.09)";
      ctx.lineWidth = 0.65;
      ctx.beginPath();
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distSq = dx * dx + dy * dy;

          if (distSq < connectDistSq) {
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
          }
        }
      }
      ctx.stroke();

      // ── D. Drifting White Galaxy Nodes & Cursor Interaction ──
      for (let i = 0; i < nodes.length; i++) {
        const p = nodes[i];
        p.x += p.vx;
        p.y += p.vy;

        // Screen boundary wrap
        if (p.x < -15) p.x = width + 15;
        else if (p.x > width + 15) p.x = -15;
        if (p.y < -15) p.y = height + 15;
        else if (p.y > height + 15) p.y = -15;

        // Mouse Gravitational Flare
        if (mouseX > 0) {
          const mdx = p.x - mouseX;
          const mdy = p.y - mouseY;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);
          const flareRadius = 120;
          if (mdist < flareRadius && mdist > 0) {
            const force = (1 - mdist / flareRadius) * 0.85;
            p.x += (mdx / mdist) * force;
            p.y += (mdy / mdist) * force;
            p.alpha = Math.min(1.0, p.baseAlpha + 0.5);
          } else {
            p.alpha = p.baseAlpha;
          }
        }

        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // White luminous halo on nodes
        ctx.globalAlpha = p.alpha * 0.3;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * 2.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── E. Pure White Shooting Stars (Meteors) ──
      for (let m = meteors.length - 1; m >= 0; m--) {
        const met = meteors[m];
        if (!met.active) {
          meteors.splice(m, 1);
          continue;
        }

        const vx = Math.cos(met.angle) * met.speed;
        const vy = Math.sin(met.angle) * met.speed;

        met.x += vx;
        met.y += vy;
        met.alpha -= 0.013;

        if (met.alpha <= 0 || met.x > width + 100 || met.y > height + 100) {
          met.active = false;
          meteors.splice(m, 1);
          continue;
        }

        const tailX = met.x - Math.cos(met.angle) * met.length;
        const tailY = met.y - Math.sin(met.angle) * met.length;

        const mGrad = ctx.createLinearGradient(tailX, tailY, met.x, met.y);
        mGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
        mGrad.addColorStop(0.6, `rgba(255, 255, 255, ${met.alpha * 0.4})`);
        mGrad.addColorStop(1, `rgba(255, 255, 255, ${met.alpha})`);

        ctx.strokeStyle = mGrad;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(tailX, tailY);
        ctx.lineTo(met.x, met.y);
        ctx.stroke();

        // Star head sparkle
        ctx.fillStyle = `rgba(255, 255, 255, ${met.alpha})`;
        ctx.beginPath();
        ctx.arc(met.x, met.y, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── F. Crisp Falling Pixel Snow Flakes (Instant, Butter-Smooth 120 FPS) ──
      for (let i = 0; i < snowFlakes.length; i++) {
        const f = snowFlakes[i];
        f.y += f.speedY;
        f.driftPhase += 0.015;
        f.x += Math.sin(f.driftPhase) * 0.35 + f.driftX;

        if (f.y > height + 8) {
          f.y = -8;
          f.x = Math.random() * width;
        }
        if (f.x < -8) f.x = width + 8;
        else if (f.x > width + 8) f.x = -8;

        ctx.fillStyle = "#ffffff";
        ctx.globalAlpha = f.alpha;
        ctx.fillRect(Math.round(f.x), Math.round(f.y), f.size, f.size);
      }

      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      clearInterval(meteorTimer);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full select-none"
      aria-hidden="true"
    />
  );
}
