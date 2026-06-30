import { useEffect, useState } from "react";
import { fetchTop, type LeaderboardEntry } from "../firebase/leaderboard";
import { useAuthStore } from "../firebase/authStore";
import { BUILTIN_CHALLENGES } from "../challenges/builtins";
import { listVersions } from "../../data/index";
import { formatMs } from "../lib/format";

export function LeaderboardPage() {
  const configured = useAuthStore((s) => s.configured);
  const [challengeId, setChallengeId] = useState(BUILTIN_CHALLENGES[0].id);
  const [version, setVersion] = useState(listVersions()[0].id);
  const [rows, setRows] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!configured) return;
    setLoading(true);
    fetchTop(challengeId, version)
      .then((r) => setRows(r))
      .catch(() => setRows([]))
      .finally(() => setLoading(false));
  }, [challengeId, version, configured]);

  if (!configured) {
    return (
      <div className="placeholder">
        <h2>Leaderboards</h2>
        <p>
          Cloud leaderboards are an optional feature. Add your Firebase config to a <code>.env.local</code> file
          (see <code>.env.example</code>) to enable global rankings, accounts, and history sync.
        </p>
      </div>
    );
  }

  return (
    <div className="history">
      <h2>Leaderboards</h2>
      <div className="lb-controls">
        <label className="field inline">
          <span>Challenge</span>
          <select value={challengeId} onChange={(e) => setChallengeId(e.target.value)}>
            {BUILTIN_CHALLENGES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field inline">
          <span>Version</span>
          <select value={version} onChange={(e) => setVersion(e.target.value)}>
            {listVersions().map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {loading ? (
        <p className="muted">Loading...</p>
      ) : rows.length === 0 ? (
        <p className="muted">No times submitted yet. Be the first!</p>
      ) : (
        <table className="attempt-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Player</th>
              <th>Time</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.uid}>
                <td>{i + 1}</td>
                <td>{r.name}</td>
                <td className="mono">{formatMs(r.durationMs)}</td>
                <td className="mono">{r.actions}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
