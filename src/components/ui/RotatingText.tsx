"use client";

import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface RotatingTextRef {
  next: () => void;
  previous: () => void;
  jumpTo: (index: number) => void;
  reset: () => void;
}

interface RotatingTextProps {
  texts: string[];
  interval?: number;
  className?: string;
  mainClassName?: string;
}

const RotatingText = forwardRef<RotatingTextRef, RotatingTextProps>(
  ({ texts, interval = 2500, className = "", mainClassName = "" }, ref) => {
    const [index, setIndex] = useState(0);

    const next = useCallback(() => setIndex((i) => (i + 1) % texts.length), [texts.length]);
    const previous = useCallback(() => setIndex((i) => (i - 1 + texts.length) % texts.length), [texts.length]);
    const jumpTo = useCallback((i: number) => setIndex(i), []);
    const reset = useCallback(() => setIndex(0), []);

    useImperativeHandle(ref, () => ({ next, previous, jumpTo, reset }));

    useEffect(() => {
      const timer = setInterval(next, interval);
      return () => clearInterval(timer);
    }, [next, interval]);

    return (
      <span className={`inline-flex overflow-hidden ${mainClassName}`}>
        <AnimatePresence mode="wait">
          <motion.span
            key={index}
            initial={{ y: "60%", opacity: 0, filter: "blur(8px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            exit={{ y: "-60%", opacity: 0, filter: "blur(6px)" }}
            transition={{ type: "spring", damping: 24, stiffness: 200, mass: 0.9 }}
            className={`inline-block ${className}`}
          >
            {texts[index]}
          </motion.span>
        </AnimatePresence>
      </span>
    );
  }
);

RotatingText.displayName = "RotatingText";
export default RotatingText;
