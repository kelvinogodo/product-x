"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function ProgressBar({ percent, className }: { percent: number; className?: string }) {
  const value = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <motion.div
        className={cn(
          "h-full rounded-full bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500",
          value === 100 && "from-emerald-500 via-emerald-500 to-teal-400"
        )}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ type: "spring", stiffness: 90, damping: 20 }}
      />
    </div>
  );
}

/** Circular progress indicator for stat tiles. */
export function ProgressRing({ percent, size = 56, stroke = 6 }: { percent: number; size?: number; stroke?: number }) {
  const value = Math.min(100, Math.max(0, percent));
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="stroke-muted" />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        strokeWidth={stroke}
        strokeLinecap="round"
        className={value === 100 ? "stroke-emerald-500" : "stroke-primary"}
        strokeDasharray={circumference}
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: circumference * (1 - value / 100) }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      />
    </svg>
  );
}
