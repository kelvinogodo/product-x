import { ImageResponse } from "next/og";
import { createPublicClient } from "@/lib/supabase/public";

export const alt = "Course on product x";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const runtime = "edge";
export const revalidate = 3600;

function hue(slug: string) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) >>> 0;
  return h % 360;
}

/** Satori's gradient parser only understands hex/rgb, so convert HSL ourselves. */
function hsl(h: number, s: number, l: number) {
  const sat = s / 100;
  const light = l / 100;
  const a = sat * Math.min(light, 1 - light);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const c = light - a * Math.max(-1, Math.min(k - 3, Math.min(9 - k, 1)));
    return Math.round(255 * c).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export default async function CourseOpengraphImage({ params }: { params: { slug: string } }) {
  const supabase = createPublicClient();
  const { data: course } = await supabase
    .from("courses")
    .select("title, description, level, slug, category:categories(name)")
    .eq("slug", params.slug)
    .eq("published", true)
    .maybeSingle();

  const title = course?.title ?? "product x";
  const description = course?.description ?? "Interactive e-learning";
  const level = course?.level ?? "";
  const category = (course?.category as unknown as { name: string } | null)?.name ?? "";
  const h = hue(params.slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          color: "white",
          background: `linear-gradient(135deg, ${hsl(h, 80, 52)} 0%, ${hsl((h + 55) % 360, 85, 40)} 100%)`,
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 30, fontWeight: 700 }}>
          <div style={{ display: "flex" }}>product x</div>
          <div style={{ display: "flex", gap: 14 }}>
            {category && <div style={{ display: "flex", padding: "8px 20px", borderRadius: 999, background: "rgba(255,255,255,0.2)" }}>{category}</div>}
            {level && <div style={{ display: "flex", padding: "8px 20px", borderRadius: 999, background: "rgba(255,255,255,0.2)", textTransform: "capitalize" }}>{level}</div>}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: title.length > 40 ? 68 : 84, fontWeight: 800, lineHeight: 1.05, letterSpacing: -2 }}>{title}</div>
          <div style={{ fontSize: 32, opacity: 0.88, maxWidth: 950 }}>
            {description.length > 130 ? `${description.slice(0, 127)}...` : description}
          </div>
        </div>
      </div>
    ),
    size
  );
}
