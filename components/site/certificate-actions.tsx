"use client";

import { useState } from "react";
import { Check, Link2, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CertificateActions({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be blocked; the URL is visible on the certificate anyway.
    }
  }

  return (
    <div className="flex gap-2">
      <Button variant="outline" size="sm" onClick={copy} className="gap-2">
        {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Link2 className="h-4 w-4" />}
        {copied ? "Copied" : "Copy link"}
      </Button>
      <Button size="sm" onClick={() => window.print()} className="gap-2">
        <Printer className="h-4 w-4" /> Print / Save as PDF
      </Button>
    </div>
  );
}
