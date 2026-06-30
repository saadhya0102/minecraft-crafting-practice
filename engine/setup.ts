import type { GameState, ItemStack } from "./types";
import type { Registry } from "./registry";
import { recomputeOutput } from "./engine";

/** A serializable description of an initial inventory/container state. */
export interface SetupSnapshot {
  layoutId: string; // "inventory" | "crafting_table" | "furnace" | "chest"
  hotbar?: (ItemStack | null)[];
  main?: (ItemStack | null)[];
  container?: (ItemStack | null)[];
  craftIn?: (ItemStack | null)[];
  /** Furnace-specific. */
  furnaceIn?: ItemStack | null;
  furnaceFuel?: ItemStack | null;
}

function place(state: GameState, ids: number[], items?: (ItemStack | null)[]): void {
  if (!items) return;
  for (let i = 0; i < items.length && i < ids.length; i++) {
    state.slots[ids[i]] = items[i] ? { ...items[i]! } : null;
  }
}

/** Apply a setup snapshot to an existing state and recompute crafting output. */
export function applySetup(state: GameState, setup: SetupSnapshot, registry: Registry): void {
  place(state, state.layout.playerHotbar, setup.hotbar);
  place(state, state.layout.playerMain, setup.main);

  const cg = state.layout.craftGrid;
  if (cg && setup.craftIn) place(state, cg.inputIds, setup.craftIn);

  if (state.layout.smelting) {
    if (setup.furnaceIn !== undefined)
      state.slots[state.layout.smelting.inputId] = setup.furnaceIn ? { ...setup.furnaceIn } : null;
    if (setup.furnaceFuel !== undefined)
      state.slots[state.layout.smelting.fuelId] = setup.furnaceFuel ? { ...setup.furnaceFuel } : null;
  } else if (setup.container) {
    place(state, state.layout.containerSlots, setup.container);
  }

  recomputeOutput(state, registry);
}
