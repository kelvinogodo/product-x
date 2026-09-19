"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Reveal } from "@/components/motion/reveal";
import { SectionHeading } from "@/components/site/section-heading";
import { cn } from "@/lib/utils";

const faqs = [
  {
    q: "Is product x really free?",
    a: "Yes. Every course in the catalog is free to enroll in — create an account, pick a course, and start learning.",
  },
  {
    q: "How does progress tracking work?",
    a: "Inside a course, mark each lesson complete as you finish it. Your dashboard shows completion for every course you've enrolled in and picks up where you left off.",
  },
  {
    q: "Do I need any experience?",
    a: "Each course is labelled beginner, intermediate, or advanced, so you can start at the right level. Tracks are ordered to take you from the basics upward.",
  },
  {
    q: "Can I learn on my phone?",
    a: "Absolutely. The whole platform is responsive, so lessons read comfortably on any screen size.",
  },
  {
    q: "What's the difference between a course and a track?",
    a: "A course teaches one skill through a set of lessons. A track bundles several related courses into a guided path toward a bigger goal.",
  },
];

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="container max-w-3xl py-20">
      <SectionHeading eyebrow="FAQ" title="Questions, answered" align="center" />
      <Reveal className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <div
              key={faq.q}
              className={cn(
                "overflow-hidden rounded-2xl border bg-card transition-colors",
                isOpen ? "border-primary/40 shadow-md" : "border-border"
              )}
            >
              <button
                className="flex w-full items-center justify-between gap-4 p-5 text-left font-medium"
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${i}`}
                id={`faq-button-${i}`}
                onClick={() => setOpen(isOpen ? null : i)}
              >
                {faq.q}
                <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className="h-5 w-5 shrink-0 text-muted-foreground" />
                </motion.span>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-panel-${i}`}
                    role="region"
                    aria-labelledby={`faq-button-${i}`}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </Reveal>
    </section>
  );
}
