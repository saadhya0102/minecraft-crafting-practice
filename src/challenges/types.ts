import type { SetupSnapshot } from "../../engine/setup";

export interface ItemReq {
  id: string;
  count?: number;
}

export type Goal =
  | { kind: "haveItems"; items: ItemReq[] }
  | { kind: "emptyContainer" }
  | { kind: "matchLayout"; target: SetupSnapshot };

export interface Split {
  id: string;
  name: string;
  /** When this requirement is met, the split is recorded. */
  req: ItemReq;
}

export type Scoring = "time" | "time_actions";

export interface Challenge {
  id: string;
  name: string;
  description: string;
  version: string;
  layoutId: string;
  setup: SetupSnapshot;
  goal: Goal;
  splits?: Split[];
  scoring: Scoring;
  /** Optional creative palette / sandbox. */
  creative?: boolean;
}
