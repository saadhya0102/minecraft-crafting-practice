import { useEffect, useMemo, useState } from "react";
import { getAllAttempts, deleteAttempt, clearAttempts } from "../lib/idb";
import { playAttempt } from "../recorder/replay";
import { formatMs } from "../lib/format";
import type { Attempt } from "../recorder/types";

export function HistoryPage({ onPlay }: { onPlay?: () => void }) {
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [loaded, setLoaded] = useState(false);

  const refresh = () =>
    getAllAttempts()
      .then((a) => setAttempts(a))
      .catch(() => setAttempts([]))
      .finally(() => setLoaded(true));

  useEffect(() => {
    refresh();
  }, []);

  const stats = useMemo(() => {
    const byChallenge = new Map<string, Attempt[]>();
    for (const a of attempts) {
      if (!byChallenge.has(a.challengeId)) byChallenge.set(a.challengeId, []);
      byChallenge.get(a.challengeId)!.push(a);
    }
    return [...byChallenge.entries()].map(([id, list]) => {
      const times = list.map((a) => a.durationMs);
      const best = Math.min(...times);
      const avg = times.reduce((s, t) => s + t, 0) / times.length;
      return { id, name: list[0].challengeName, count: list.length, best, avg, recent: list[0] };
    });
  }, [attempts]);

  if (loaded && attempts.length === 0) {
    return (
      <div className="placeholder">
        <h2>History</h2>
        <p>No attempts yet. Complete a challenge in Practice and it will be recorded here.</p>
      </div>
    );
  }

  return (
    <div className="history">
      <div className="kb-head">
        <h2>History &amp; Trends</h2>
        <button
          className="btn small"
          onClick={() => {
            if (confirm("Delete all recorded attempts?")) clearAttempts().then(refresh);
          }}
        >
          Clear all
        </button>
      </div>

      <div className="stat-cards">
        {stats.map((s) => (
          <div key={s.id} className="stat-card">
            <div className="stat-name">{s.name}</div>
            <div className="stat-rows">
              <span>Best</span>
              <strong className="accent">{formatMs(s.best)}</strong>
              <span>Average</span>
              <strong>{formatMs(s.avg)}</strong>
              <span>Attempts</span>
              <strong>{s.count}</strong>
            </div>
          </div>
        ))}
      </div>

      <h3>Recent attempts</h3>
      <table className="attempt-table">
        <thead>
          <tr>
            <th>Challenge</th>
            <th>Time</th>
            <th>Actions</th>
            <th>When</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a.id}>
              <td>{a.challengeName}</td>
              <td className="mono">{formatMs(a.durationMs)}</td>
              <td className="mono">{a.actions}</td>
              <td className="muted">{new Date(a.completedAt).toLocaleString()}</td>
              <td className="row-actions">
                <button
                  className="btn small"
                  onClick={() => {
                    playAttempt(a);
                    onPlay?.();
                  }}
                >
                  Replay
                </button>
                <button className="btn small" onClick={() => deleteAttempt(a.id).then(refresh)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
