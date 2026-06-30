import type {
  ContainerLayout,
  DragButton,
  GameState,
  ItemStack,
  SlotDef,
  SlotKind,
  VersionFlags,
} from "./types";
import { DEFAULT_FLAGS } from "./types";
import { Registry } from "./registry";
import { matchRecipe, type Grid } from "./recipes";

// ---------------------------------------------------------------------------
// Stack helpers
// ---------------------------------------------------------------------------

export function cloneStack(s: ItemStack | null): ItemStack | null {
  return s ? { ...s } : null;
}

function stackable(a: ItemStack, b: ItemStack): boolean {
  if (a.id !== b.id) return false;
  // Items with differing durability do not stack.
  return (a.durability ?? undefined) === (b.durability ?? undefined);
}

const OUTPUT_KINDS: SlotKind[] = ["craftOut", "furnaceOut", "palette"];

function canPlaceInto(kind: SlotKind): boolean {
  return !OUTPUT_KINDS.includes(kind);
}

// ---------------------------------------------------------------------------
// Layout helpers
// ---------------------------------------------------------------------------

export function defOf(state: GameState, id: number): SlotDef {
  return state.layout.slots[id];
}

function craftGridOf(state: GameState, registry: Registry): void {
  const cg = state.layout.craftGrid;
  if (!cg) return;
  const grid: Grid = [];
  for (let r = 0; r < cg.rows; r++) {
    const row: (string | null)[] = [];
    for (let c = 0; c < cg.cols; c++) {
      const slot = state.slots[cg.inputIds[r * cg.cols + c]];
      row.push(slot ? slot.id : null);
    }
    grid.push(row);
  }
  state.slots[cg.outputId] = matchRecipe(registry.recipes, grid);
}

/** Recompute craft-output preview from the current craft grid. */
export function recomputeOutput(state: GameState, registry: Registry): void {
  craftGridOf(state, registry);
}

function consumeCraftIngredients(state: GameState): void {
  const cg = state.layout.craftGrid;
  if (!cg) return;
  for (const id of cg.inputIds) {
    const s = state.slots[id];
    if (s) {
      s.count -= 1;
      if (s.count <= 0) state.slots[id] = null;
    }
  }
}

// ---------------------------------------------------------------------------
// Region / quick-move targets
// ---------------------------------------------------------------------------

const FUEL_ITEMS = new Set<string>([
  "minecraft:coal",
  "minecraft:charcoal",
  "minecraft:lava_bucket",
  "minecraft:blaze_rod",
  "minecraft:stick",
]);

function isFuel(id: string): boolean {
  if (FUEL_ITEMS.has(id)) return true;
  return id.endsWith("_planks") || id.endsWith("_log") || id.endsWith("_wood");
}

/** Ordered destination slot ids for a shift-click quick-move from `slotId`. */
function quickMoveTargets(
  state: GameState,
  slotId: number,
  stack: ItemStack,
  registry: Registry,
): number[] {
  const L = state.layout;
  const playerSet = new Set([...L.playerMain, ...L.playerHotbar]);
  const containerSet = new Set(L.containerSlots);
  const isPlayer = playerSet.has(slotId);
  const hasContainer = L.containerSlots.length > 0;

  // Furnace has item-type-specific routing.
  if (L.smelting && isPlayer) {
    if (registry.smeltResultOf(stack.id)) return [L.smelting.inputId];
    if (isFuel(stack.id)) return [L.smelting.fuelId];
    return [L.smelting.inputId];
  }

  if (hasContainer) {
    if (isPlayer) return [...L.containerSlots];
    // Container/craft/armor/offhand -> player area (bottom-to-top, right-to-left).
    return [...L.playerHotbar].reverse().concat([...L.playerMain].reverse());
  }

  // Plain inventory screen.
  if (L.playerHotbar.includes(slotId)) return [...L.playerMain];
  if (L.playerMain.includes(slotId)) return [...L.playerHotbar];
  void containerSet;
  return [...L.playerMain, ...L.playerHotbar];
}

/**
 * Merge `stack` (mutated) into the given destination slots: first into existing
 * matching stacks with space, then into empty slots. Returns the remaining
 * stack or null when fully placed.
 */
function moveStackToRegion(
  state: GameState,
  stack: ItemStack,
  destIds: number[],
  registry: Registry,
): ItemStack | null {
  const max = registry.maxStack(stack.id);
  for (const id of destIds) {
    const slot = state.slots[id];
    if (slot && stackable(slot, stack)) {
      const space = max - slot.count;
      if (space > 0) {
        const move = Math.min(space, stack.count);
        slot.count += move;
        stack.count -= move;
        if (stack.count <= 0) return null;
      }
    }
  }
  for (const id of destIds) {
    if (state.slots[id] === null && canPlaceInto(defOf(state, id).kind)) {
      const move = Math.min(max, stack.count);
      state.slots[id] = { id: stack.id, count: move, durability: stack.durability };
      stack.count -= move;
      if (stack.count <= 0) return null;
    }
  }
  return stack.count > 0 ? stack : null;
}

/** Non-mutating check: can the full stack be placed into destIds? */
function fitsFully(
  state: GameState,
  stack: ItemStack,
  destIds: number[],
  registry: Registry,
): boolean {
  const max = registry.maxStack(stack.id);
  let remaining = stack.count;
  for (const id of destIds) {
    const slot = state.slots[id];
    if (slot && stackable(slot, stack)) remaining -= Math.max(0, max - slot.count);
    else if (slot === null && canPlaceInto(defOf(state, id).kind)) remaining -= max;
    if (remaining <= 0) return true;
  }
  return remaining <= 0;
}

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

export class Engine {
  constructor(
    readonly registry: Registry,
    readonly flags: VersionFlags = DEFAULT_FLAGS,
  ) {}

  /** Build a fresh state for a layout. */
  create(layout: ContainerLayout, opts?: { creative?: boolean; instantSmelt?: boolean }): GameState {
    const state: GameState = {
      layout,
      slots: new Array(layout.slots.length).fill(null),
      cursor: null,
      drag: null,
      instantSmelt: opts?.instantSmelt ?? false,
      creative: opts?.creative ?? false,
    };
    return state;
  }

  private touchedCraft(state: GameState, slotId: number): boolean {
    const cg = state.layout.craftGrid;
    return !!cg && (cg.inputIds.includes(slotId) || cg.outputId === slotId);
  }

  private afterChange(state: GameState, slotId: number): void {
    if (this.touchedCraft(state, slotId)) recomputeOutput(state, this.registry);
    this.maybeSmelt(state, slotId);
  }

  private maybeSmelt(state: GameState, slotId: number): void {
    const sm = state.layout.smelting;
    if (!sm || !state.instantSmelt) return;
    if (slotId !== sm.inputId) return;
    const input = state.slots[sm.inputId];
    if (!input) return;
    const result = this.registry.smeltResultOf(input.id);
    if (!result) return;
    const out = state.slots[sm.outputId];
    const max = this.registry.maxStack(result.id);
    const smeltable = input.count;
    let made = 0;
    if (out && out.id === result.id) {
      made = Math.min(smeltable * result.count, max - out.count);
    } else if (!out) {
      made = Math.min(smeltable * result.count, max);
    }
    if (made <= 0) return;
    const consumed = Math.ceil(made / result.count);
    input.count -= consumed;
    if (input.count <= 0) state.slots[sm.inputId] = null;
    if (out && out.id === result.id) out.count += made;
    else state.slots[sm.outputId] = { id: result.id, count: made };
  }

  // --- left click -----------------------------------------------------------
  leftClick(state: GameState, slotId: number): void {
    const def = defOf(state, slotId);
    if (def.kind === "craftOut") return this.takeCraftOutput(state, false);
    if (def.kind === "furnaceOut") return this.takeOutputSlot(state, slotId);
    if (def.kind === "palette") {
      const slot = state.slots[slotId];
      if (slot) state.cursor = { id: slot.id, count: this.registry.maxStack(slot.id) };
      return;
    }

    const slot = state.slots[slotId];
    const cur = state.cursor;
    if (!cur) {
      // pick up
      state.cursor = slot;
      state.slots[slotId] = null;
    } else if (!slot) {
      state.slots[slotId] = cur;
      state.cursor = null;
    } else if (stackable(slot, cur)) {
      const max = this.registry.maxStack(slot.id);
      const space = max - slot.count;
      const move = Math.min(space, cur.count);
      slot.count += move;
      cur.count -= move;
      if (cur.count <= 0) state.cursor = null;
    } else {
      // swap
      state.slots[slotId] = cur;
      state.cursor = slot;
    }
    this.afterChange(state, slotId);
  }

  private takeOutputSlot(state: GameState, slotId: number): void {
    const slot = state.slots[slotId];
    const cur = state.cursor;
    if (!slot) return;
    if (!cur) {
      state.cursor = slot;
      state.slots[slotId] = null;
    } else if (stackable(slot, cur)) {
      const max = this.registry.maxStack(slot.id);
      const move = Math.min(max - cur.count, slot.count);
      cur.count += move;
      slot.count -= move;
      if (slot.count <= 0) state.slots[slotId] = null;
    }
  }

  // --- right click ----------------------------------------------------------
  rightClick(state: GameState, slotId: number): void {
    const def = defOf(state, slotId);
    if (def.kind === "craftOut") return this.takeCraftOutput(state, false);
    if (def.kind === "furnaceOut") return this.takeOutputSlot(state, slotId);
    if (def.kind === "palette") {
      const slot = state.slots[slotId];
      if (slot && !state.cursor) state.cursor = { id: slot.id, count: 1 };
      return;
    }

    const slot = state.slots[slotId];
    const cur = state.cursor;
    if (!cur) {
      if (!slot) return;
      const grab = Math.ceil(slot.count / 2);
      state.cursor = { id: slot.id, count: grab, durability: slot.durability };
      slot.count -= grab;
      if (slot.count <= 0) state.slots[slotId] = null;
    } else if (!slot) {
      state.slots[slotId] = { id: cur.id, count: 1, durability: cur.durability };
      cur.count -= 1;
      if (cur.count <= 0) state.cursor = null;
    } else if (stackable(slot, cur)) {
      const max = this.registry.maxStack(slot.id);
      if (slot.count < max) {
        slot.count += 1;
        cur.count -= 1;
        if (cur.count <= 0) state.cursor = null;
      }
    } else {
      state.slots[slotId] = cur;
      state.cursor = slot;
    }
    this.afterChange(state, slotId);
  }

  // --- craft output ---------------------------------------------------------
  private takeCraftOutput(state: GameState, _shift: boolean): void {
    const cg = state.layout.craftGrid;
    if (!cg) return;
    const result = state.slots[cg.outputId];
    if (!result) return;
    const max = this.registry.maxStack(result.id);
    const cur = state.cursor;
    if (!cur) {
      state.cursor = { ...result };
      consumeCraftIngredients(state);
    } else if (stackable(cur, result) && cur.count + result.count <= max) {
      cur.count += result.count;
      consumeCraftIngredients(state);
    } else {
      return;
    }
    recomputeOutput(state, this.registry);
  }

  // --- shift + left click ---------------------------------------------------
  shiftLeftClick(state: GameState, slotId: number): void {
    const def = defOf(state, slotId);
    if (def.kind === "craftOut") return this.shiftCraft(state);
    if (def.kind === "palette") {
      const slot = state.slots[slotId];
      if (slot) {
        const stack = { id: slot.id, count: this.registry.maxStack(slot.id) };
        moveStackToRegion(state, stack, [...state.layout.playerMain, ...state.layout.playerHotbar], this.registry);
      }
      return;
    }
    const slot = state.slots[slotId];
    if (!slot) return;
    const dest = quickMoveTargets(state, slotId, slot, this.registry).filter((id) => id !== slotId);
    const stack: ItemStack = { ...slot };
    state.slots[slotId] = null;
    const leftover = moveStackToRegion(state, stack, dest, this.registry);
    state.slots[slotId] = leftover;
    this.afterChange(state, slotId);
    // Quick-moving into the crafting grid must refresh the output preview.
    const cg = state.layout.craftGrid;
    if (cg && dest.some((id) => cg.inputIds.includes(id))) recomputeOutput(state, this.registry);
    for (const id of dest) this.maybeSmelt(state, id);
  }

  private shiftCraft(state: GameState): void {
    const cg = state.layout.craftGrid;
    if (!cg) return;
    const dest = [...state.layout.playerMain, ...state.layout.playerHotbar];
    let guard = 0;
    while (guard++ < 1024) {
      const result = state.slots[cg.outputId];
      if (!result) break;
      if (!fitsFully(state, result, dest, this.registry)) break;
      const leftover = moveStackToRegion(state, { ...result }, dest, this.registry);
      if (leftover) break; // couldn't place the full result; don't consume ingredients
      consumeCraftIngredients(state);
      recomputeOutput(state, this.registry);
      if (!this.flags.shiftCraftMax) break;
    }
  }

  // --- number keys (hotbar swap) -------------------------------------------
  numberKey(state: GameState, slotId: number, hotbarIndex: number): void {
    const hotbarId = state.layout.playerHotbar[hotbarIndex];
    if (hotbarId === undefined) return;
    const def = defOf(state, slotId);
    if (def.kind === "craftOut") {
      // Craft directly into the hotbar slot if it is free / matching.
      const cg = state.layout.craftGrid!;
      const result = state.slots[cg.outputId];
      if (!result) return;
      const target = state.slots[hotbarId];
      const max = this.registry.maxStack(result.id);
      if (target === null) {
        state.slots[hotbarId] = { ...result };
        consumeCraftIngredients(state);
        recomputeOutput(state, this.registry);
      } else if (stackable(target, result) && target.count + result.count <= max) {
        target.count += result.count;
        consumeCraftIngredients(state);
        recomputeOutput(state, this.registry);
      }
      return;
    }
    if (slotId === hotbarId) return;
    const a = state.slots[slotId];
    state.slots[slotId] = state.slots[hotbarId];
    state.slots[hotbarId] = a;
    this.afterChange(state, slotId);
  }

  // --- drop (Q / Ctrl+Q) ----------------------------------------------------
  dropFromSlot(state: GameState, slotId: number, whole: boolean): void {
    const def = defOf(state, slotId);
    // Output/preview slots can't be Q-dropped (matches Minecraft).
    if (def.kind === "palette" || def.kind === "craftOut" || def.kind === "furnaceOut") return;
    const slot = state.slots[slotId];
    if (!slot) return;
    if (whole || slot.count <= 1) {
      state.slots[slotId] = null;
    } else {
      slot.count -= 1;
    }
    this.afterChange(state, slotId);
  }

  /** Drop the held cursor stack into the void (click outside the window). */
  dropCursor(state: GameState, whole: boolean): void {
    if (!state.cursor) return;
    if (whole || state.cursor.count <= 1) state.cursor = null;
    else state.cursor.count -= 1;
  }

  // --- swap off-hand (F) ----------------------------------------------------
  swapOffhand(state: GameState, slotId: number): void {
    if (!this.flags.hasOffhand) return;
    const offId = state.layout.slots.findIndex((s) => s.kind === "offhand");
    if (offId < 0 || offId === slotId) return;
    const a = state.slots[slotId];
    state.slots[slotId] = state.slots[offId];
    state.slots[offId] = a;
    this.afterChange(state, slotId);
  }

  // --- double-click gather --------------------------------------------------
  doubleClick(state: GameState, slotId: number): void {
    if (!state.cursor) {
      this.leftClick(state, slotId);
    }
    const cur = state.cursor;
    if (!cur) return;
    const max = this.registry.maxStack(cur.id);
    if (cur.count >= max) return;
    const order = [
      ...state.layout.containerSlots,
      ...state.layout.playerMain,
      ...state.layout.playerHotbar,
    ];
    // Pull partial stacks first, then full stacks (matches MC gather behavior).
    for (const partialFirst of [true, false]) {
      for (const id of order) {
        const slot = state.slots[id];
        if (!slot || !stackable(slot, cur)) continue;
        const isPartial = slot.count < max;
        if (partialFirst !== isPartial) continue;
        const need = max - cur.count;
        if (need <= 0) return;
        const take = Math.min(need, slot.count);
        cur.count += take;
        slot.count -= take;
        if (slot.count <= 0) state.slots[id] = null;
      }
    }
    recomputeOutput(state, this.registry);
  }

  // --- creative pick-block (middle click) -----------------------------------
  pickBlock(state: GameState, slotId: number): void {
    if (!state.creative) return;
    const slot = state.slots[slotId];
    if (!slot) return;
    state.cursor = { id: slot.id, count: this.registry.maxStack(slot.id) };
  }

  // --- drag -----------------------------------------------------------------
  startDrag(state: GameState, button: DragButton): void {
    if (!state.cursor && button !== "middle") return;
    if (button === "middle" && !state.creative) return;
    const start = state.cursor ?? { id: "", count: 0 };
    state.drag = { button, slots: [], startStack: { ...start } };
  }

  addDragSlot(state: GameState, slotId: number): void {
    const drag = state.drag;
    if (!drag) return;
    if (drag.slots.includes(slotId)) return;
    const def = defOf(state, slotId);
    if (!canPlaceInto(def.kind)) return;
    const slot = state.slots[slotId];
    const cur = state.cursor;
    if (drag.button === "middle") {
      if (slot === null) drag.slots.push(slotId);
      return;
    }
    if (!cur) return;
    if (slot === null || (stackable(slot, cur) && slot.count < this.registry.maxStack(cur.id))) {
      drag.slots.push(slotId);
    }
  }

  endDrag(state: GameState): void {
    const drag = state.drag;
    state.drag = null;
    if (!drag || drag.slots.length === 0) return;

    if (drag.button === "middle") {
      const id = drag.startStack.id || (state.cursor?.id ?? "");
      if (!id) return;
      const max = this.registry.maxStack(id);
      for (const sid of drag.slots) state.slots[sid] = { id, count: max };
      for (const sid of drag.slots) this.afterChange(state, sid);
      return;
    }

    const cur = state.cursor;
    if (!cur) return;
    const max = this.registry.maxStack(cur.id);
    const n = drag.slots.length;
    const perSlot = drag.button === "left" ? Math.floor(cur.count / n) : 1;
    if (perSlot <= 0) return;

    for (const sid of drag.slots) {
      if (cur.count <= 0) break;
      const slot = state.slots[sid];
      if (slot === null) {
        const give = Math.min(perSlot, cur.count, max);
        state.slots[sid] = { id: cur.id, count: give, durability: cur.durability };
        cur.count -= give;
      } else if (stackable(slot, cur)) {
        const give = Math.min(perSlot, cur.count, max - slot.count);
        slot.count += give;
        cur.count -= give;
      }
    }
    if (cur.count <= 0) state.cursor = null;
    for (const sid of drag.slots) this.afterChange(state, sid);
  }
}
