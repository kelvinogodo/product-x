"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMounted(true);
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // Storage can be blocked (private mode); the toggle still works for this session.
    }
  }

  return (
    <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme" className="relative overflow-hidden">
      {mounted && (
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={dark ? "moon" : "sun"}
            initial={{ y: -14, opacity: 0, rotate: -60 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 14, opacity: 0, rotate: 60 }}
            transition={{ duration: 0.2 }}
            className="flex"
          >
            {dark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </motion.span>
        </AnimatePresence>
      )}
    </Button>
  );
}
