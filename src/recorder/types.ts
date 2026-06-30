import type { GameEvent } from "../engineEvents";
import type { SetupSnapshot } from "../../engine/setup";

export interface TimelineEntry {
  /** Milliseconds from the start of the attempt. */
  t: number;
  e: GameEvent;
}

export interface Attempt {
  id: string;
  challengeId: string;
  challengeName: string;
  version: string;
  layoutId: string;
  durationMs: number;
  actions: number;
  completed: boolean;
  completedAt: number;
  splits: { id: string; name: string; atMs: number }[];
  /** Full input timeline for replay + anti-cheat validation. */
  timeline: TimelineEntry[];
  /** The starting state, so the attempt can be replayed deterministically. */
  setup: SetupSnapshot;
}
