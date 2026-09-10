"use client";

import React, { useRef, useState } from "react";

interface SpotlightCardProps extends React.PropsWithChildren {
  className?: string;
  spotlightColor?: string;
  style?: React.CSSProperties;
}

const SpotlightCard: React.FC<SpotlightCardProps> = ({
  children,
  className = "",
  spotlightColor = "rgba(34, 197, 94, 0.12)",
  style,
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const [opacity, setOpacity] = useState<number>(0);

  const handleMouseMove: React.MouseEventHandler<HTMLDivElement> = (e) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    divRef.current.style.setProperty("--spotlight-x", `${x}px`);
    divRef.current.style.setProperty("--spotlight-y", `${y}px`);
  };

  const handleMouseEnter = () => setOpacity(0.65);
  const handleMouseLeave = () => setOpacity(0);

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative rounded-2xl border border-white/20 bg-white/[0.06] backdrop-blur-2xl overflow-hidden shadow-[0_20px_45px_-10px_rgba(0,0,0,0.75),inset_0_1px_1px_0_rgba(255,255,255,0.28)] hover:border-white/35 transition-all duration-300 ${className}`}
      style={{
        ...style,
        ["--spotlight-x" as any]: "0px",
        ["--spotlight-y" as any]: "0px",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 ease-out"
        style={{
          opacity,
          background: `radial-gradient(circle 360px at var(--spotlight-x) var(--spotlight-y), ${spotlightColor}, transparent 80%)`,
        }}
      />
      {children}
    </div>
  );
};

export default SpotlightCard;
