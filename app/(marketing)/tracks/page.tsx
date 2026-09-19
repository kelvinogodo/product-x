import type { Metadata } from "next";
import { Stagger, StaggerItem } from "@/components/motion/reveal";
import { TrackCard } from "@/components/site/home-sections";
import { getTracks } from "@/lib/data/catalog";

export const metadata: Metadata = {
  title: "Learning tracks",
  description: "Guided paths that group courses in the right order toward a bigger goal.",
};

export default async function TracksPage() {
  const tracks = await getTracks();

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-64 bg-gradient-to-b from-accent/60 to-transparent" />
      <div className="container py-12">
        <div className="mb-10 max-w-2xl space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Learning tracks</h1>
          <p className="text-muted-foreground">
            Guided paths that group courses in the right order, so you always know what to learn next.
          </p>
        </div>
        {tracks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border p-12 text-center text-muted-foreground">
            No tracks yet — check back soon.
          </div>
        ) : (
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" immediate>
            {tracks.map((track) => (
              <StaggerItem key={track.slug}>
                <TrackCard track={track} />
              </StaggerItem>
            ))}
          </Stagger>
        )}
      </div>
    </div>
  );
}
