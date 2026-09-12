"use client";

import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const FOSSTechnologyWheel = dynamic(() => import("@/components/home/FOSSTechnologyWheel"), {
  ssr: false,
});

export default function WheelLazy() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => requestAnimationFrame(() => setReady(true)));
    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div className="w-full">
      <div style={{ opacity: ready ? 1 : 0, transition: "opacity 0.5s ease" }}>
        <FOSSTechnologyWheel />
      </div>
    </div>
  );
}