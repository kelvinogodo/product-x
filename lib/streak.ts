/**
 * Learning streak from timestamps of completed lessons. Days are UTC calendar days. The current
 * streak stays alive through "today" if you haven't learned yet but did yesterday.
 */
export function computeStreak(timestamps: string[], now = new Date()) {
  const day = (d: Date) => Math.floor(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()) / 86_400_000);
  const days = [...new Set(timestamps.map((t) => day(new Date(t))))].sort((a, b) => a - b);
  if (days.length === 0) return { current: 0, best: 0, activeDays: 0 };

  let best = 1;
  let run = 1;
  for (let i = 1; i < days.length; i++) {
    run = days[i] === days[i - 1] + 1 ? run + 1 : 1;
    best = Math.max(best, run);
  }

  const today = day(now);
  const last = days[days.length - 1];
  let current = 0;
  if (last === today || last === today - 1) {
    current = 1;
    for (let i = days.length - 1; i > 0 && days[i] === days[i - 1] + 1; i--) current++;
  }
  return { current, best, activeDays: days.length };
}
