"use client";

import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { LessonContent } from "@/components/site/lesson-content";
import { cn } from "@/lib/utils";

/** Markdown textarea with a Write / Preview toggle. The preview uses the exact learner renderer. */
export function MarkdownEditor({ name, defaultValue = "", maxLength = 50000 }: { name: string; defaultValue?: string; maxLength?: number }) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");

  return (
    <div className="space-y-2">
      <div className="inline-flex rounded-lg border border-border p-1" role="tablist" aria-label="Editor mode">
        {(["write", "preview"] as const).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium capitalize transition-colors",
              tab === t ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Always mounted so the value is submitted from either tab. */}
      <Textarea
        id={name}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={16}
        maxLength={maxLength}
        className={cn("font-mono text-xs", tab === "preview" && "hidden")}
      />
      {tab === "preview" && (
        <div className="min-h-[16rem] rounded-lg border border-border bg-card p-5">
          {value.trim() ? <LessonContent content={value} /> : <p className="text-sm text-muted-foreground">Nothing to preview yet.</p>}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        {value.length.toLocaleString()} / {maxLength.toLocaleString()} characters. Supports headings, lists, tables, links and fenced
        code blocks. Raw HTML is not rendered.
      </p>
    </div>
  );
}
