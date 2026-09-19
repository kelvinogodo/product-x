"use client";

import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, CheckCircle2 } from "lucide-react";

/** Animated inline feedback for forms: errors shake in, notices fade in. */
export function FormMessage({ error, notice }: { error?: string; notice?: string }) {
  return (
    <AnimatePresence mode="wait">
      {error && (
        <motion.p
          key={`e-${error}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          role="alert"
          className="flex animate-shake items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive"
        >
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </motion.p>
      )}
      {notice && (
        <motion.p
          key={`n-${notice}`}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          role="status"
          className="flex items-start gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300"
        >
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          {notice}
        </motion.p>
      )}
    </AnimatePresence>
  );
}
