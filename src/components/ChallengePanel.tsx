import { useEffect, useRef, useState } from "react";
import { useChallengeStore } from "../challenges/challengeStore";
import { formatMs } from "../lib/format";

export function ChallengePanel() {
  const active = useChallengeStore((s) => s.active);
  const status = useChallengeStore((s) => s.status);
  const splitTimes = useChallengeStore((s) => s.splitTimes);
  const actions = useChallengeStore((s) => s.actions);
  const pb = useChallengeStore((s) => s.pb);
  const lastResult = useChallengeStore((s) => s.lastResult);
  const arm = useChallengeStore((s) => s.arm);
  const [, force] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    if (status !== "running") return;
    const loop = () => {
      force((n) => n + 1);
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [status]);

  if (!active) return null;
  const elapsed = useChallengeStore.getState().elapsed();
  const isPb = lastResult && pb != null && Math.round(lastResult.durationMs) <= pb;

  return (
    <div className="challenge-panel">
      <div className="timer-row">
        <div className={`timer ${status}`}>{formatMs(elapsed)}</div>
        <div className="timer-meta">
          <div>
            PB <strong>{pb != null ? formatMs(pb) : "--"}</strong>
          </div>
          <div>
            Actions <strong>{actions}</strong>
          </div>
        </div>
      </div>

      {status === "armed" && <p className="challenge-status">Make your first move to start the timer.</p>}
      {status === "done" && (
        <p className={`challenge-status ${isPb ? "pb" : "done"}`}>
          {isPb ? "New personal best!" : "Complete!"} {formatMs(lastResult!.durationMs)} · {actions} actions
        </p>
      )}

      {active.splits && (
        <ul className="splits">
          {active.splits.map((sp) => (
            <li key={sp.id} className={splitTimes[sp.id] != null ? "split done" : "split"}>
              <span>{sp.name}</span>
              <span className="split-time">{splitTimes[sp.id] != null ? formatMs(splitTimes[sp.id]) : "--"}</span>
            </li>
          ))}
        </ul>
      )}

      <button className="btn" onClick={arm}>
        Restart (R)
      </button>
    </div>
  );
}
