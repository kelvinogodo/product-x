import { afterEach, describe, expect, it, vi } from "vitest";
import { certificateEmail, escapeHtml, resourceReceiptEmail, sendEmail } from "@/lib/email";
import { computeStreak } from "@/lib/streak";
import { formatDuration } from "@/lib/utils";

describe("computeStreak", () => {
  const now = new Date("2026-03-10T12:00:00Z");
  const day = (d: string) => `${d}T09:00:00Z`;

  it("is empty with no activity", () => {
    expect(computeStreak([], now)).toEqual({ current: 0, best: 0, activeDays: 0 });
  });
  it("counts consecutive days ending today", () => {
    expect(computeStreak([day("2026-03-08"), day("2026-03-09"), day("2026-03-10")], now)).toEqual({ current: 3, best: 3, activeDays: 3 });
  });
  it("keeps the streak alive through today if you learned yesterday", () => {
    expect(computeStreak([day("2026-03-08"), day("2026-03-09")], now).current).toBe(2);
  });
  it("resets after a missed day but remembers the best run", () => {
    const r = computeStreak([day("2026-03-01"), day("2026-03-02"), day("2026-03-03"), day("2026-03-04"), day("2026-03-09")], now);
    expect(r).toEqual({ current: 1, best: 4, activeDays: 5 });
    expect(computeStreak([day("2026-03-01"), day("2026-03-02")], now).current).toBe(0);
  });
  it("treats several lessons on one day as one active day", () => {
    expect(computeStreak([day("2026-03-10"), "2026-03-10T20:00:00Z"], now)).toEqual({ current: 1, best: 1, activeDays: 1 });
  });
});

describe("formatDuration", () => {
  it.each([
    [45, "45m"],
    [60, "1h"],
    [95, "1h 35m"],
  ])("%i minutes -> %s", (mins, out) => expect(formatDuration(mins)).toBe(out));
});

describe("email", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.restoreAllMocks();
  });

  it("escapes HTML", () => {
    expect(escapeHtml(`<img src=x onerror="a">&'`)).toBe("&lt;img src=x onerror=&quot;a&quot;&gt;&amp;&#39;");
  });

  it("never injects raw user input into templates", () => {
    const evil = "<script>alert(1)</script>";
    const mail = resourceReceiptEmail("a@b.co", evil, evil, "https://x.test/courses");
    expect(mail.html).not.toContain("<script>");
    expect(certificateEmail("a@b.co", evil, evil, "https://x.test/c/1").html).not.toContain("<script>");
  });

  it("skips sending when unconfigured", async () => {
    vi.stubEnv("RESEND_API_KEY", "");
    vi.stubEnv("EMAIL_FROM", "");
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    vi.spyOn(console, "info").mockImplementation(() => {});
    expect(await sendEmail({ to: "a@b.co", subject: "s", html: "h", text: "t" })).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("posts to Resend when configured and swallows provider failures", async () => {
    vi.stubEnv("RESEND_API_KEY", "re_test");
    vi.stubEnv("EMAIL_FROM", "product x <hi@x.test>");
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValueOnce(new Response("{}", { status: 200 }));
    expect(await sendEmail({ to: "a@b.co", subject: "s", html: "h", text: "t" })).toBe(true);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe("https://api.resend.com/emails");
    expect((init as RequestInit).headers).toMatchObject({ Authorization: "Bearer re_test" });

    vi.spyOn(console, "error").mockImplementation(() => {});
    fetchSpy.mockRejectedValueOnce(new Error("network down"));
    expect(await sendEmail({ to: "a@b.co", subject: "s", html: "h", text: "t" })).toBe(false);
    fetchSpy.mockResolvedValueOnce(new Response("nope", { status: 500 }));
    expect(await sendEmail({ to: "a@b.co", subject: "s", html: "h", text: "t" })).toBe(false);
  });
});
