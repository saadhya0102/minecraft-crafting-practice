import { useGameStore } from "../store/gameStore";
import { setReplaying } from "../challenges/challengeStore";
import type { Attempt } from "./types";

let timers: number[] = [];
let active = false;

/** Replays a recorded attempt against the live GUI by re-dispatching its timeline. */
export function playAttempt(attempt: Attempt, opts?: { speed?: number; onEnd?: () => void }): void {
  stopReplay();
  const speed = opts?.speed ?? 1;
  active = true;
  setReplaying(true);

  const game = useGameStore.getState();
  if (game.version !== attempt.version) game.setVersion(attempt.version);
  useGameStore.getState().loadSetup(attempt.setup);

  for (const entry of attempt.timeline) {
    const id = window.setTimeout(() => useGameStore.getState().dispatch(entry.e), entry.t / speed);
    timers.push(id);
  }
  const endId = window.setTimeout(() => {
    setReplaying(false);
    active = false;
    opts?.onEnd?.();
  }, attempt.durationMs / speed + 60);
  timers.push(endId);
}

export function stopReplay(): void {
  for (const t of timers) clearTimeout(t);
  timers = [];
  if (active) {
    setReplaying(false);
    active = false;
  }
}

export function isReplaying(): boolean {
  return active;
}
