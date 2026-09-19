"use client";

import { useEffect, useRef } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

/** Counts from 0 to `value` when scrolled into view. */
export function CountUp({
  value,
  duration = 1.4,
  suffix = "",
  className,
}: {
  value: number;
  duration?: number;
  suffix?: string;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (reduce) {
      node.textContent = `${value.toLocaleString()}${suffix}`;
      return;
    }
    if (!inView) return;
    const controls = animate(0, value, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (latest) => {
        node.textContent = `${Math.round(latest).toLocaleString()}${suffix}`;
      },
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration, suffix]);

  return (
    <span ref={ref} className={className}>
      0{suffix}
    </span>
  );
}
