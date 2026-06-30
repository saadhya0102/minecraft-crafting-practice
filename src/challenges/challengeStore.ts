import { create } from "zustand";
import { useGameStore } from "../store/gameStore";
import type { GameState } from "../../engine/types";
import type { GameEvent } from "../engineEvents";
import type { Challenge } from "./types";
import { goalMet, reqMet } from "./goals";
import type { Attempt, TimelineEntry } from "../recorder/types";
import { putAttempt } from "../lib/idb";

// Module-level recording buffers (kept out of store state to avoid re-renders).
let timeline: TimelineEntry[] = [];
let replaying = false;

/** When true, game events are ignored by the challenge timer/recorder (replay). */
export function setReplaying(on: boolean): void {
  replaying = on;
}

export interface AttemptResult {
  challengeId: string;
  version: string;
  durationMs: number;
  actions: number;
  completedAt: number;
  splits: { id: string; name: string; atMs: number }[];
}

type Status = "idle" | "armed" | "running" | "done";

const ACTION_EVENTS = new Set<GameEvent["t"]>([
  "left",
  "right",
  "shiftLeft",
  "double",
  "number",
  "drop",
  "dropCursor",
  "offhand",
  "pick",
  "dragEnd",
]);

interface ChallengeStore {
  active: Challenge | null;
  status: Status;
  startMs: number | null;
  endMs: number | null;
  actions: number;
  splitTimes: Record<string, number>;
  pb: number | null;
  lastResult: AttemptResult | null;
  resultListeners: Set<(r: AttemptResult) => void>;

  select: (c: Challenge | null) => void;
  arm: () => void;
  reset: () => void;
  elapsed: () => number;
  onResult: (l: (r: AttemptResult) => void) => () => void;
  _handle: (e: GameEvent, state: GameState) => void;
}

function pbKey(c: Challenge): string {
  return `craftpace.pb.${c.version}.${c.id}`;
}
function loadPb(c: Challenge): number | null {
  try {
    const v = localStorage.getItem(pbKey(c));
    return v ? Number(v) : null;
  } catch {
    return null;
  }
}
function savePb(c: Challenge, ms: number): void {
  try {
    localStorage.setItem(pbKey(c), String(Math.round(ms)));
  } catch {
    /* ignore */
  }
}

export const useChallengeStore = create<ChallengeStore>((set, get) => ({
  active: null,
  status: "idle",
  startMs: null,
  endMs: null,
  actions: 0,
  splitTimes: {},
  pb: null,
  lastResult: null,
  resultListeners: new Set(),

  select: (c) => {
    if (!c) {
      set({ active: null, status: "idle", startMs: null, endMs: null, actions: 0, splitTimes: {}, pb: null });
      return;
    }
    const game = useGameStore.getState();
    if (game.version !== c.version) game.setVersion(c.version);
    useGameStore.getState().loadSetup(c.setup, { creative: c.creative });
    set({
      active: c,
      status: "armed",
      startMs: null,
      endMs: null,
      actions: 0,
      splitTimes: {},
      pb: loadPb(c),
      lastResult: null,
    });
  },

  arm: () => {
    const { active } = get();
    if (!active) return;
    const game = useGameStore.getState();
    if (game.version !== active.version) game.setVersion(active.version);
    useGameStore.getState().loadSetup(active.setup, { creative: active.creative });
    set({ status: "armed", startMs: null, endMs: null, actions: 0, splitTimes: {} });
  },

  reset: () => get().arm(),

  elapsed: () => {
    const { status, startMs, endMs } = get();
    if (startMs == null) return 0;
    if (status === "done" && endMs != null) return endMs - startMs;
    return performance.now() - startMs;
  },

  onResult: (l) => {
    get().resultListeners.add(l);
    return () => get().resultListeners.delete(l);
  },

  _handle: (e, state) => {
    if (replaying) return;
    const s = get();
    if (!s.active || s.status === "done") return;

    let { status, startMs } = s;
    if (status === "armed") {
      status = "running";
      startMs = performance.now();
      timeline = [];
    }
    const now = performance.now();
    const t = now - (startMs ?? now);
    timeline.push({ t, e });

    const splitTimes = { ...s.splitTimes };
    if (s.active.splits) {
      for (const sp of s.active.splits) {
        if (splitTimes[sp.id] == null && reqMet(state, sp.req)) splitTimes[sp.id] = t;
      }
    }

    const actions = s.actions + (ACTION_EVENTS.has(e.t) ? 1 : 0);
    const done = goalMet(state, s.active.goal);

    if (done) {
      const duration = now - (startMs ?? now);
      const result: AttemptResult = {
        challengeId: s.active.id,
        version: s.active.version,
        durationMs: duration,
        actions,
        completedAt: Date.now(),
        splits: (s.active.splits ?? []).map((sp) => ({ id: sp.id, name: sp.name, atMs: splitTimes[sp.id] ?? duration })),
      };
      let pb = s.pb;
      if (pb == null || duration < pb) {
        pb = duration;
        savePb(s.active, duration);
      }
      set({ status: "done", startMs, endMs: now, actions, splitTimes, lastResult: result, pb });
      for (const l of s.resultListeners) l(result);

      const attempt: Attempt = {
        id: `att_${s.active.id}_${Date.now()}`,
        challengeId: s.active.id,
        challengeName: s.active.name,
        version: s.active.version,
        layoutId: s.active.layoutId,
        durationMs: duration,
        actions,
        completed: true,
        completedAt: Date.now(),
        splits: result.splits,
        timeline: [...timeline],
        setup: s.active.setup,
      };
      void putAttempt(attempt).catch(() => {});
    } else {
      set({ status, startMs, actions, splitTimes });
    }
  },
}));

// Wire challenge timing to game events (registered once).
useGameStore.getState().addEventListener((e, state) => {
  useChallengeStore.getState()._handle(e, state);
});

// Re-arm on the reset hotkey.
if (typeof window !== "undefined") {
  window.addEventListener("craftpace:action", (ev) => {
    const id = (ev as CustomEvent).detail?.id;
    if (id === "resetAttempt") {
      const cs = useChallengeStore.getState();
      if (cs.active) cs.arm();
    }
  });
}
