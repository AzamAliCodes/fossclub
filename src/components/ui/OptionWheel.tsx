"use client";

import React, { useRef, useState, useCallback, useEffect, type CSSProperties } from "react";

type Side = "left" | "right";

export interface OptionWheelProps {
  items?: string[];
  defaultSelected?: number;
  onChange?: (index: number, item: string) => void;
  textColor?: string;
  activeColor?: string;
  side?: Side;
  fontSize?: number;
  spacing?: number;
  curve?: number;
  tilt?: number;
  blur?: number;
  fade?: number;
  minOpacity?: number;
  smoothing?: number;
  inset?: number;
  loop?: boolean;
  draggable?: boolean;
  soundUrl?: string;
  soundVolume?: number;
  className?: string;
  activeGlass?: boolean;
}

interface WheelConfig {
  count: number;
  items: string[];
  rowH: number;
  curve: number;
  tilt: number;
  blur: number;
  fade: number;
  minOpacity: number;
  side: Side;
  loop: boolean;
  smoothing: number;
  draggable: boolean;
  soundUrl: string;
  soundVolume: number;
}

const DEFAULT_ITEMS: string[] = [];

export const OptionWheel: React.FC<OptionWheelProps> = ({
  items = DEFAULT_ITEMS,
  defaultSelected = 1,
  onChange,
  textColor = "#71717a",
  activeColor = "#22c55e",
  side = "left",
  fontSize = 2.2,
  spacing = 1.35,
  curve = 1.1,
  tilt = 6,
  blur = 2,
  fade = 0.28,
  minOpacity = 0.08,
  smoothing = 200,
  inset = 40,
  loop = true,
  draggable = true,
  soundUrl = "",
  soundVolume = 0.3,
  className = "",
  activeGlass = true,
}) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLDivElement | null)[]>([]);
  const posRef = useRef(defaultSelected);
  const targetRef = useRef(defaultSelected);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef(0);
  const cfgRef = useRef<WheelConfig>({} as WheelConfig);
  const onChangeRef = useRef(onChange);
  const selectedRef = useRef(defaultSelected);
  const wheelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dragRef = useRef<{ y: number; start: number; id: number } | null>(null);
  const dragMovedRef = useRef(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioUrlRef = useRef("");
  const lastTickRef = useRef(0);
  const [selectedIndex, setSelectedIndex] = useState(defaultSelected);
  const isDraggingRef = useRef(false);

  const remPx =
    typeof window !== "undefined"
      ? parseFloat(getComputedStyle(document.documentElement).fontSize) || 16
      : 16;

  onChangeRef.current = onChange;
  cfgRef.current = {
    count: items.length,
    items,
    rowH: Math.max(fontSize * spacing * remPx, 1),
    curve,
    tilt,
    blur,
    fade,
    minOpacity,
    side,
    loop,
    smoothing,
    draggable,
    soundUrl,
    soundVolume,
  };

  // Optional tick on selection change, throttled so fast scrolling can't spam it
  const playTick = useCallback(() => {
    const { soundUrl, soundVolume } = cfgRef.current;
    if (!soundUrl) return;
    const now = performance.now();
    if (now - lastTickRef.current < 70) return;
    lastTickRef.current = now;
    if (!audioRef.current || audioUrlRef.current !== soundUrl) {
      try {
        audioRef.current = new Audio(soundUrl);
        audioRef.current.preload = "auto";
        audioUrlRef.current = soundUrl;
      } catch {}
    }
    const audio = audioRef.current;
    if (audio) {
      audio.volume = Math.min(Math.max(soundVolume, 0), 1);
      audio.currentTime = 0;
      audio.play()?.catch(() => {});
    }
  }, []);

  // Single rAF loop that eases the wheel position toward its target with
  // frame-rate independent exponential smoothing, then lays every option out
  // along the curve based on its distance from the current position.
  const runFrame = useCallback((now: number) => {
    const dt = Math.min((now - lastRef.current) / 1000, 0.05);
    lastRef.current = now;
    const cfg = cfgRef.current;
    
    // Fast 35ms tau while actively dragging for zero-latency 1:1 tracking,
    // smooth easing on release
    const effectiveSmoothing = isDraggingRef.current ? 35 : cfg.smoothing;
    const tau = Math.max(effectiveSmoothing, 1) / 1000;
    const k = 1 - Math.exp(-dt / tau);

    const target = targetRef.current;
    const cur = posRef.current;
    let next = cur + (target - cur) * k;
    const settled = Math.abs(target - next) < 0.001;
    if (settled) {
      next = target;
      if (!isDraggingRef.current) {
        const idx = ((Math.round(target) % cfg.count) + cfg.count) % cfg.count;
        if (idx !== selectedRef.current) {
          selectedRef.current = idx;
          setSelectedIndex(idx);
          onChangeRef.current?.(idx, cfg.items[idx]);
          playTick();
        }
      }
    }
    posRef.current = next;

    const els = itemRefs.current;
    const n = cfg.count;
    const mirror = cfg.side === "right" ? -1 : 1;
    const tiltRad = (cfg.tilt * Math.PI) / 180;
    const R = tiltRad > 0.0005 ? cfg.rowH / tiltRad : 0;
    for (let i = 0; i < n; i++) {
      const el = els[i];
      if (!el) continue;
      let d = i - next;
      if (cfg.loop && n > 1) {
        d = ((d % n) + n) % n;
        if (d > n / 2) d -= n;
      }
      const dist = Math.abs(d);
      let x = 0;
      let y = d * cfg.rowH;
      let rot = 0;
      if (R > 0) {
        const ang = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, d * tiltRad));
        y = R * Math.sin(ang);
        x = -mirror * R * (1 - Math.cos(ang)) * cfg.curve;
        rot = (mirror * ang * 180) / Math.PI;
      }
      el.style.transform = `translate3d(${x.toFixed(2)}px, calc(${y.toFixed(2)}px - 50%), 0) rotate(${rot.toFixed(3)}deg)`;
      el.style.opacity = String(Math.max(cfg.minOpacity, 1 - dist * cfg.fade));
      if (cfg.blur > 0) {
        el.style.filter = `blur(${(dist * cfg.blur).toFixed(2)}px)`;
      } else if (el.style.filter && el.style.filter !== "none") {
        el.style.filter = "none";
      }
      el.style.setProperty("--ow-p", Math.max(0, 1 - Math.min(dist, 1)).toFixed(4));

      // Highlight bold white ONLY when strictly inside the fixed glass capsule
      const inGlass = dist < 0.28;
      const targetState = inGlass ? "true" : "false";
      if (el.dataset.inGlass !== targetState) {
        el.dataset.inGlass = targetState;
      }
    }

    rafRef.current = (settled && !isDraggingRef.current) ? null : requestAnimationFrame(runFrame);
  }, [playTick]);

  const startLoop = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
    }
    lastRef.current = performance.now();
    rafRef.current = requestAnimationFrame(runFrame);
  }, [runFrame]);

  const applyTarget = useCallback(
    (value: number, snap: boolean) => {
      const cfg = cfgRef.current;
      if (!cfg.count) return;
      let v = value;
      if (!cfg.loop) v = Math.min(Math.max(v, 0), Math.max(cfg.count - 1, 0));
      if (snap) {
        v = Math.round(v);
      }
      targetRef.current = v;
      startLoop();
    },
    [startLoop]
  );

  // Wheel, touchpad and mobile touch scrolling, registered non-passively
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const cfg = cfgRef.current;
      const delta = e.deltaMode === 1 ? e.deltaY * 24 : e.deltaY;
      const step = Math.max(-1, Math.min(1, delta / cfg.rowH));
      applyTarget(targetRef.current + step, false);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
      wheelTimerRef.current = setTimeout(() => applyTarget(targetRef.current, true), 140);
    };

    let touchStartY = 0;
    let touchLastY = 0;
    let touchLastTime = 0;
    let touchVelocity = 0;
    let touchStartTarget = 0;
    let isTouching = false;
    let touchMoved = false;

    const onTouchStart = (e: TouchEvent) => {
      if (!cfgRef.current.draggable || e.touches.length !== 1) return;
      touchStartY = e.touches[0].clientY;
      touchLastY = e.touches[0].clientY;
      touchLastTime = performance.now();
      touchVelocity = 0;
      touchStartTarget = posRef.current;
      targetRef.current = posRef.current;
      isDraggingRef.current = true;
      isTouching = true;
      touchMoved = false;
      startLoop();
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouching || e.touches.length !== 1) return;
      const y = e.touches[0].clientY;
      const now = performance.now();
      const dt = now - touchLastTime;
      if (dt > 8) {
        touchVelocity = (y - touchLastY) / dt;
        touchLastY = y;
        touchLastTime = now;
      }
      const dy = y - touchStartY;
      if (Math.abs(dy) > 2) {
        touchMoved = true;
        dragMovedRef.current = true;
        if (e.cancelable) e.preventDefault();
        const sensitivity = 1.45; // Responsive, sensitive touch scroll
        const cfg = cfgRef.current;
        let nextTarget = touchStartTarget - (dy * sensitivity) / cfg.rowH;
        if (!cfg.loop) {
          nextTarget = Math.min(Math.max(nextTarget, -0.5), cfg.count - 0.5);
        }
        targetRef.current = nextTarget;
        posRef.current = nextTarget;
        startLoop();
      }
    };

    const onTouchEnd = () => {
      if (!isTouching) return;
      isTouching = false;
      isDraggingRef.current = false;
      if (touchMoved) {
        const cfg = cfgRef.current;
        let momentum = 0;
        if (Math.abs(touchVelocity) > 0.2) {
          const flickSteps = (-touchVelocity * 85) / cfg.rowH;
          momentum = Math.max(-4, Math.min(4, flickSteps));
        }
        applyTarget(Math.round(targetRef.current + momentum), true);
        setTimeout(() => {
          dragMovedRef.current = false;
        }, 100);
      }
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      if (wheelTimerRef.current) clearTimeout(wheelTimerRef.current);
    };
  }, [applyTarget, startLoop]);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "touch") return; // Handled natively by touch listeners for mobile
    if (!cfgRef.current.draggable) return;
    isDraggingRef.current = true;
    dragRef.current = { y: e.clientY, start: posRef.current, id: e.pointerId };
    dragMovedRef.current = false;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {}
    startLoop();
  }, [startLoop]);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch") return;
      const drag = dragRef.current;
      if (!drag) return;
      const dy = e.clientY - drag.y;
      if (Math.abs(dy) > 2) {
        dragMovedRef.current = true;
        const cfg = cfgRef.current;
        let nextTarget = drag.start - (dy * 1.25) / cfg.rowH;
        if (!cfg.loop) {
          nextTarget = Math.min(Math.max(nextTarget, -0.5), cfg.count - 0.5);
        }
        targetRef.current = nextTarget;
        posRef.current = nextTarget;
        startLoop();
      }
    },
    [startLoop]
  );

  const handlePointerEnd = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (e.pointerType === "touch") return;
      if (!dragRef.current) return;
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {}
      dragRef.current = null;
      isDraggingRef.current = false;
      if (dragMovedRef.current) {
        applyTarget(Math.round(targetRef.current), true);
        setTimeout(() => {
          dragMovedRef.current = false;
        }, 100);
      }
    },
    [applyTarget]
  );

  const handleItemClick = useCallback(
    (index: number) => {
      if (dragMovedRef.current) return;
      const cfg = cfgRef.current;
      const cur = targetRef.current;
      let d = index - (((cur % cfg.count) + cfg.count) % cfg.count);
      if (cfg.loop && cfg.count > 1) {
        if (d > cfg.count / 2) d -= cfg.count;
        else if (d < -cfg.count / 2) d += cfg.count;
      }
      applyTarget(cur + d, true);
    },
    [applyTarget]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      let delta: number | null = null;
      if (e.key === "ArrowUp" || e.key === "ArrowLeft") delta = -1;
      else if (e.key === "ArrowDown" || e.key === "ArrowRight") delta = 1;
      if (delta == null) return;
      e.preventDefault();
      applyTarget(Math.round(targetRef.current) + delta, true);
    },
    [applyTarget]
  );

  useEffect(() => {
    applyTarget(targetRef.current, false);
  }, [items, fontSize, spacing, curve, tilt, blur, fade, minOpacity, side, loop, smoothing, applyTarget]);

  useEffect(
    () => () => {
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      audioRef.current?.pause();
    },
    []
  );

  return (
    <div
      ref={rootRef}
      role="listbox"
      tabIndex={0}
      aria-label="Option wheel"
      className={`relative h-full w-full select-none overflow-hidden outline-none touch-none cursor-grab active:cursor-grabbing${
        className ? ` ${className}` : ""
      }`}
      style={
        {
          "--ow-text-color": textColor,
          "--ow-active-color": activeColor,
          "--ow-font-size": `${fontSize}rem`,
          "--ow-inset": `${inset}px`,
        } as CSSProperties
      }
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerEnd}
      onPointerCancel={handlePointerEnd}
      onKeyDown={handleKeyDown}
    >
      {/* Fixed Stationary Transparent Glass Capsule for Active Item */}
      {activeGlass && (
        <div
          aria-hidden="true"
          className="absolute top-1/2 -translate-y-1/2 left-2 sm:left-3 right-2 sm:right-3 h-[44px] sm:h-[52px] rounded-xl sm:rounded-2xl liquid-glass-card !border-white/25 !bg-white/[0.08] backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.4),inset_0_1px_1.5px_rgba(255,255,255,0.35)] pointer-events-none z-0"
        >
          {/* Subtle top specular accent highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />
        </div>
      )}

      {items.map((label, index) => {
        const isCurrentActive = index === selectedIndex;
        return (
          <div
            key={`${label}-${index}`}
            ref={(el) => {
              itemRefs.current[index] = el;
            }}
            role="option"
            aria-selected={isCurrentActive}
            title={label}
            data-in-glass={itemRefs.current[index]?.dataset.inGlass ?? (isCurrentActive ? "true" : "false")}
            className={`wheel-item absolute top-1/2 cursor-pointer whitespace-nowrap leading-none [font-size:var(--ow-font-size)] max-w-[88%] truncate z-10 ${
              side === "right" ? "right-[var(--ow-inset)] origin-right" : "left-[var(--ow-inset)] origin-left"
            } font-medium [color:color-mix(in_srgb,var(--ow-active-color)_calc(var(--ow-p,0)*100%),var(--ow-text-color))]`}
            style={{
              willChange: "transform, opacity",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            onClick={() => handleItemClick(index)}
          >
            {label}
          </div>
        );
      })}
    </div>
  );
};

export default OptionWheel;
