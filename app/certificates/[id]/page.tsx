import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { z } from "zod";
import { Award, BadgeCheck } from "lucide-react";
import { CertificateActions } from "@/components/site/certificate-actions";
import { Logo } from "@/components/site/logo";
import { getCertificatePublic } from "@/lib/data/learning";
import { getSiteUrl } from "@/lib/site-url";

// Certificates are verifiable by link, but there's no reason for search engines to list people's names.
export const metadata: Metadata = { title: "Certificate of completion", robots: { index: false, follow: false } };

export default async function CertificatePage({ params }: { params: { id: string } }) {
  if (!z.string().uuid().safeParse(params.id).success) notFound();
  const cert = await getCertificatePublic(params.id);
  if (!cert) notFound();

  const issued = new Date(cert.issued_at).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
  const url = `${getSiteUrl()}/certificates/${params.id}`;

  return (
    <div className="min-h-screen bg-secondary/30 px-4 py-8 print:bg-white print:p-0">
      <div className="mx-auto mb-6 flex max-w-4xl items-center justify-between print:hidden">
        <Logo />
        <CertificateActions url={url} />
      </div>

      <div className="mx-auto max-w-4xl [print-color-adjust:exact]">
        <div className="relative overflow-hidden rounded-3xl border-[10px] border-double border-primary/30 bg-card p-10 text-center shadow-xl sm:p-16 print:shadow-none">
          <div className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />

          <div className="relative space-y-6">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 text-white shadow-lg">
              <Award className="h-8 w-8" />
            </span>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary">Certificate of completion</p>
            <p className="text-muted-foreground">This certifies that</p>
            <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">{cert.holder_name}</h1>
            <p className="text-muted-foreground">has successfully completed every lesson of</p>
            <h2 className="mx-auto max-w-2xl text-balance font-display text-2xl font-bold sm:text-3xl">
              {cert.course_title}
            </h2>

            <div className="mx-auto flex max-w-md items-center justify-between gap-6 border-t border-border pt-6 text-sm">
              <div className="text-left">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Date</p>
                <p className="font-medium">{issued}</p>
              </div>
              <div className="text-right">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Issued by</p>
                <p className="font-medium">product x</p>
              </div>
            </div>

            <p className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
              <BadgeCheck className="h-4 w-4 text-emerald-500" />
              Verify at {url.replace(/^https?:\/\//, "")}
            </p>
          </div>
        </div>
      </div>

      {cert.course_slug && (
        <p className="mt-6 text-center text-sm text-muted-foreground print:hidden">
          <Link href={`/courses/${cert.course_slug}`} className="text-primary hover:underline">
            View the course
          </Link>
        </p>
      )}
    </div>
  );
}
