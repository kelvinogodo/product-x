import { describe, expect, it } from "vitest";
import { isAllowedImageUrl } from "@/lib/image-url";
import { safeRedirectPath, sanitizeSearch } from "@/lib/security";
import { toEmbedUrl } from "@/lib/video";

const BACKSLASH = String.fromCharCode(92);

describe("safeRedirectPath", () => {
  it("keeps same-origin relative paths", () => {
    expect(safeRedirectPath("/dashboard/courses/x/learn")).toBe("/dashboard/courses/x/learn");
    expect(safeRedirectPath("/courses?category=data")).toBe("/courses?category=data");
  });
  it.each([
    ["protocol-relative", "//evil.com"],
    ["absolute", "https://evil.com"],
    ["javascript", "javascript:alert(1)"],
    ["backslash", `/${BACKSLASH}evil.com`],
    ["control chars", "/a\r\nSet-Cookie: x=1"],
    ["not a path", "evil.com"],
  ])("rejects %s", (_name, value) => {
    expect(safeRedirectPath(value)).toBe("/dashboard");
  });
  it("falls back for non-strings", () => {
    expect(safeRedirectPath(null, "/")).toBe("/");
    expect(safeRedirectPath(undefined)).toBe("/dashboard");
  });
});

describe("sanitizeSearch", () => {
  it("strips PostgREST filter and LIKE metacharacters", () => {
    expect(sanitizeSearch("a),published.eq.false,(title.ilike.%")).toBe("a published.eq.false title.ilike.");
    expect(sanitizeSearch("100%_sure")).toBe("100 sure");
  });
  it("keeps letters (incl. unicode), numbers and simple punctuation", () => {
    expect(sanitizeSearch("café résumé o'neil-2")).toBe("café résumé o'neil-2");
  });
  it("handles empty input and caps length", () => {
    expect(sanitizeSearch(undefined)).toBe("");
    expect(sanitizeSearch("x".repeat(500))).toHaveLength(80);
  });
});

describe("toEmbedUrl", () => {
  it("normalises YouTube and Vimeo links to embed URLs", () => {
    expect(toEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(toEmbedUrl("https://youtu.be/dQw4w9WgXcQ")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
    expect(toEmbedUrl("https://vimeo.com/123456789")).toBe("https://player.vimeo.com/video/123456789");
  });
  it.each([
    "https://evil.com/embed/dQw4w9WgXcQ",
    "https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ",
    "http://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "javascript:alert(1)",
    "https://www.youtube.com/watch?v=<script>",
    "not a url",
  ])("rejects %s", (value) => {
    expect(toEmbedUrl(value)).toBeNull();
  });
});

describe("isAllowedImageUrl", () => {
  it("allows this project's public storage and Unsplash over https", () => {
    expect(isAllowedImageUrl("https://project-ref.supabase.co/storage/v1/object/public/covers/a.png")).toBe(true);
    expect(isAllowedImageUrl("https://images.unsplash.com/photo-1")).toBe(true);
  });
  it.each([
    "http://project-ref.supabase.co/storage/v1/object/public/covers/a.png",
    "https://evil.com/a.png",
    "https://other-project.supabase.co/storage/v1/object/public/covers/a.png",
    "https://project-ref.supabase.co/rest/v1/courses",
    "javascript:alert(1)",
    "",
  ])("rejects %s", (value) => {
    expect(isAllowedImageUrl(value)).toBe(false);
  });
});
