import type { Engine } from "../engine/engine";
import type { GameState, DragButton } from "../engine/types";

/** Serializable description of a single inventory interaction. */
export type GameEvent =
  | { t: "left"; slot: number }
  | { t: "right"; slot: number }
  | { t: "shiftLeft"; slot: number }
  | { t: "double"; slot: number }
  | { t: "number"; slot: number; hotbar: number }
  | { t: "drop"; slot: number; whole: boolean }
  | { t: "dropCursor"; whole: boolean }
  | { t: "offhand"; slot: number }
  | { t: "pick"; slot: number }
  | { t: "dragStart"; button: DragButton }
  | { t: "dragAdd"; slot: number }
  | { t: "dragEnd" };

export function applyGameEvent(engine: Engine, state: GameState, e: GameEvent): void {
  // Guard against out-of-range slot ids (corrupt replay/share payloads).
  if ("slot" in e) {
    if (e.slot < 0 || e.slot >= state.layout.slots.length || !state.layout.slots[e.slot]) return;
  }
  switch (e.t) {
    case "left":
      return engine.leftClick(state, e.slot);
    case "right":
      return engine.rightClick(state, e.slot);
    case "shiftLeft":
      return engine.shiftLeftClick(state, e.slot);
    case "double":
      return engine.doubleClick(state, e.slot);
    case "number":
      return engine.numberKey(state, e.slot, e.hotbar);
    case "drop":
      return engine.dropFromSlot(state, e.slot, e.whole);
    case "dropCursor":
      return engine.dropCursor(state, e.whole);
    case "offhand":
      return engine.swapOffhand(state, e.slot);
    case "pick":
      return engine.pickBlock(state, e.slot);
    case "dragStart":
      return engine.startDrag(state, e.button);
    case "dragAdd":
      return engine.addDragSlot(state, e.slot);
    case "dragEnd":
      return engine.endDrag(state);
  }
}
