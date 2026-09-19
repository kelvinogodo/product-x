"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";

const COLORS = ["#6366f1", "#8b5cf6", "#d946ef", "#f59e0b", "#10b981", "#38bdf8"];

/** A one-shot burst of confetti pieces radiating from the centre of its (relative) parent. */
export function Confetti({ pieces = 36 }: { pieces?: number }) {
  const particles = useMemo(
    () =>
      Array.from({ length: pieces }, (_, i) => {
        const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.4;
        const distance = 90 + Math.random() * 170;
        return {
          id: i,
          x: Math.cos(angle) * distance,
          y: Math.sin(angle) * distance - 40,
          rotate: Math.random() * 720 - 360,
          size: 6 + Math.random() * 6,
          color: COLORS[i % COLORS.length],
          round: i % 3 === 0,
        };
      }),
    [pieces]
  );

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-visible">
      {particles.map((p) => (
        <motion.span
          key={p.id}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0.4, rotate: 0 }}
          animate={{ x: p.x, y: p.y + 120, opacity: 0, scale: 1, rotate: p.rotate }}
          transition={{ duration: 1.4 + Math.random() * 0.6, ease: [0.16, 1, 0.3, 1] }}
          style={{
            position: "absolute",
            width: p.size,
            height: p.size * (p.round ? 1 : 0.5),
            background: p.color,
            borderRadius: p.round ? "50%" : 2,
          }}
        />
      ))}
    </div>
  );
}
