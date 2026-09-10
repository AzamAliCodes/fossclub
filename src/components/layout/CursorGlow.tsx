"use client";

import { useEffect, useRef } from "react";

export default function CursorGlow() {
  const elRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    let visible = false;
    let raf = 0;
    let targetX = -1000;
    let targetY = -1000;

    const update = () => {
      el.style.left = `${targetX}px`;
      el.style.top = `${targetY}px`;
      el.style.opacity = visible ? "1" : "0";
    };

    const onMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!visible) {
        visible = true;
        update();
      }
      if (!raf) {
        raf = requestAnimationFrame(() => {
          update();
          raf = 0;
        });
      }
    };
    const onLeave = () => {
      visible = false;
      update();
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    document.addEventListener("mouseenter", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("mouseenter", onLeave);
    };
  }, []);

  return (
    <div
      ref={elRef}
      className="cursor-glow"
      aria-hidden="true"
    />
  );
}
