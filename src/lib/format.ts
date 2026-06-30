/** Format milliseconds as a speedrun-style timer string (e.g. "1:02.345"). */
export function formatMs(ms: number): string {
  if (ms <= 0) return "0.000";
  const total = ms / 1000;
  const m = Math.floor(total / 60);
  const s = total % 60;
  const sStr = s.toFixed(3).padStart(6, "0");
  return m > 0 ? `${m}:${sStr}` : s.toFixed(3);
}
