import { Reveal } from "@/components/motion/reveal";
import { cn } from "@/lib/utils";

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  align?: "left" | "center";
}) {
  return (
    <Reveal
      className={cn(
        "mb-10 flex flex-wrap items-end justify-between gap-4",
        align === "center" && "flex-col items-center text-center"
      )}
    >
      <div className={cn("max-w-2xl space-y-2", align === "center" && "mx-auto")}>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-widest text-primary">{eyebrow}</p>}
        <h2 className="text-balance text-3xl font-extrabold tracking-tight sm:text-4xl">{title}</h2>
        {description && <p className="text-muted-foreground">{description}</p>}
      </div>
      {action}
    </Reveal>
  );
}
