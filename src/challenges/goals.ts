import type { GameState } from "../../engine/types";
import type { Goal, ItemReq } from "./types";

const COUNTED_KINDS = new Set(["hotbar", "main", "armor", "offhand", "container", "furnaceOut"]);

/** Total count of an item id across the player's holdings (not staged craft inputs). */
export function countItem(state: GameState, id: string): number {
  let total = 0;
  for (const def of state.layout.slots) {
    if (!COUNTED_KINDS.has(def.kind)) continue;
    const s = state.slots[def.id];
    if (s && s.id === id) total += s.count;
  }
  if (state.cursor && state.cursor.id === id) total += state.cursor.count;
  return total;
}

export function reqMet(state: GameState, req: ItemReq): boolean {
  return countItem(state, req.id) >= (req.count ?? 1);
}

export function goalMet(state: GameState, goal: Goal): boolean {
  switch (goal.kind) {
    case "haveItems":
      return Array.isArray(goal.items) && goal.items.every((r) => reqMet(state, r));
    case "emptyContainer":
      return state.layout.containerSlots.every((id) => state.slots[id] === null);
    case "matchLayout":
      return matchLayout(state, goal.target);
  }
}

function compareRegion(state: GameState, ids: number[], target?: (null | { id: string; count: number })[]): boolean {
  if (!target) return true;
  for (let i = 0; i < ids.length; i++) {
    const have = state.slots[ids[i]];
    const want = target[i] ?? null;
    if (want === null) {
      if (have !== null) return false;
    } else {
      if (!have || have.id !== want.id || have.count !== want.count) return false;
    }
  }
  return true;
}

function matchLayout(state: GameState, target: import("../../engine/setup").SetupSnapshot): boolean {
  return (
    compareRegion(state, state.layout.playerHotbar, target.hotbar as never) &&
    compareRegion(state, state.layout.playerMain, target.main as never) &&
    compareRegion(state, state.layout.containerSlots, target.container as never)
  );
}

/** 0..1 completion estimate, for a progress bar. */
export function goalProgress(state: GameState, goal: Goal): number {
  if (goal.kind === "haveItems") {
    if (!Array.isArray(goal.items)) return 0;
    const done = goal.items.filter((r) => reqMet(state, r)).length;
    return goal.items.length ? done / goal.items.length : 1;
  }
  if (goal.kind === "emptyContainer") {
    const total = state.layout.containerSlots.length || 1;
    const filled = state.layout.containerSlots.filter((id) => state.slots[id] !== null).length;
    return 1 - filled / total;
  }
  return goalMet(state, goal) ? 1 : 0;
}
