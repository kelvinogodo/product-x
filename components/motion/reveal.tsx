"use client";

import { motion, type HTMLMotionProps, type Variants } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1] as const;

type Direction = "up" | "down" | "left" | "right" | "none";

function offset(direction: Direction, distance: number) {
  switch (direction) {
    case "up":
      return { y: distance };
    case "down":
      return { y: -distance };
    case "left":
      return { x: distance };
    case "right":
      return { x: -distance };
    default:
      return {};
  }
}

/** Fades + slides an element in the first time it scrolls into view. */
export function Reveal({
  children,
  delay = 0,
  direction = "up",
  distance = 24,
  duration = 0.6,
  className,
  ...rest
}: {
  children: React.ReactNode;
  delay?: number;
  direction?: Direction;
  distance?: number;
  duration?: number;
  className?: string;
} & Omit<HTMLMotionProps<"div">, "initial" | "animate" | "whileInView" | "transition" | "children">) {
  return (
    <motion.div
      initial={{ opacity: 0, ...offset(direction, distance) }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

const container = (stagger: number, delayChildren: number): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
});

const item: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

/** Parent that staggers its <StaggerItem> children as it enters the viewport. */
export function Stagger({
  children,
  stagger = 0.08,
  delay = 0,
  className,
  immediate = false,
}: {
  children: React.ReactNode;
  stagger?: number;
  delay?: number;
  className?: string;
  /** Animate on mount instead of waiting for scroll (use above the fold). */
  immediate?: boolean;
}) {
  return (
    <motion.div
      variants={container(stagger, delay)}
      initial="hidden"
      {...(immediate
        ? { animate: "show" }
        : { whileInView: "show", viewport: { once: true, margin: "-60px" } })}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={item} className={className}>
      {children}
    </motion.div>
  );
}
