export * from "./types";
export * from "./registry";
export * from "./recipes";
export * from "./layouts";
export * from "./setup";
export { Engine, cloneStack, recomputeOutput, defOf } from "./engine";

import type { ContainerLayout, GameState, ItemStack } from "./types";

/** Place an item stack into a specific slot id (helper for setups/presets). */
export function setSlot(state: GameState, slotId: number, stack: ItemStack | null): void {
  state.slots[slotId] = stack ? { ...stack } : null;
}

/** Fill consecutive hotbar slots, then main inventory, with the given stacks. */
export function fillInventory(state: GameState, stacks: (ItemStack | null)[]): void {
  const order = [...state.layout.playerHotbar, ...state.layout.playerMain];
  for (let i = 0; i < stacks.length && i < order.length; i++) {
    state.slots[order[i]] = stacks[i] ? { ...stacks[i]! } : null;
  }
}

/** Snapshot just the item contents (id+count) of a layout's slots, by kind. */
export function snapshotByKind(state: GameState, kind: string): (ItemStack | null)[] {
  return state.layout.slots
    .filter((s) => s.kind === kind)
    .map((s) => {
      const v = state.slots[s.id];
      return v ? { id: v.id, count: v.count } : null;
    });
}

export type { ContainerLayout };
