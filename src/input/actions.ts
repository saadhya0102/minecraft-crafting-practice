// All bindable actions. "MC parity" actions mirror real Minecraft controls;
// "tool" actions are trainer-specific conveniences.

export type ActionId =
  | "drop"
  | "swapOffhand"
  | "hotbar1"
  | "hotbar2"
  | "hotbar3"
  | "hotbar4"
  | "hotbar5"
  | "hotbar6"
  | "hotbar7"
  | "hotbar8"
  | "hotbar9"
  | "closeGui"
  | "resetAttempt"
  | "toggleInstantSmelt"
  | "toggleRecipeBook";

export interface ActionDef {
  id: ActionId;
  label: string;
  /** Default KeyboardEvent.code. */
  defaultCode: string;
  rebindable: boolean;
  /** Acts on the slot under the cursor. */
  requiresSlot: boolean;
  group: "mc" | "tool";
  note?: string;
}

export const ACTIONS: ActionDef[] = [
  { id: "drop", label: "Drop Item", defaultCode: "KeyQ", rebindable: true, requiresSlot: true, group: "mc", note: "Hold Ctrl to drop the whole stack (Ctrl is not rebindable, matching Minecraft)." },
  { id: "swapOffhand", label: "Swap Off-Hand", defaultCode: "KeyF", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "hotbar1", label: "Hotbar Slot 1", defaultCode: "Digit1", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "hotbar2", label: "Hotbar Slot 2", defaultCode: "Digit2", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "hotbar3", label: "Hotbar Slot 3", defaultCode: "Digit3", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "hotbar4", label: "Hotbar Slot 4", defaultCode: "Digit4", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "hotbar5", label: "Hotbar Slot 5", defaultCode: "Digit5", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "hotbar6", label: "Hotbar Slot 6", defaultCode: "Digit6", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "hotbar7", label: "Hotbar Slot 7", defaultCode: "Digit7", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "hotbar8", label: "Hotbar Slot 8", defaultCode: "Digit8", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "hotbar9", label: "Hotbar Slot 9", defaultCode: "Digit9", rebindable: true, requiresSlot: true, group: "mc" },
  { id: "closeGui", label: "Close / Pause", defaultCode: "Escape", rebindable: false, requiresSlot: false, group: "mc" },
  { id: "resetAttempt", label: "Reset Attempt", defaultCode: "KeyR", rebindable: true, requiresSlot: false, group: "tool" },
  { id: "toggleInstantSmelt", label: "Toggle Instant Smelt", defaultCode: "KeyG", rebindable: true, requiresSlot: false, group: "tool" },
  { id: "toggleRecipeBook", label: "Toggle Recipe Book", defaultCode: "KeyB", rebindable: true, requiresSlot: false, group: "tool" },
];

export const ACTION_BY_ID: Record<string, ActionDef> = Object.fromEntries(
  ACTIONS.map((a) => [a.id, a]),
);

export function defaultBinds(): Record<ActionId, string> {
  const out = {} as Record<ActionId, string>;
  for (const a of ACTIONS) out[a.id] = a.defaultCode;
  return out;
}

/** Human-readable label for a KeyboardEvent.code. */
export function codeLabel(code: string): string {
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return "Num " + code.slice(6);
  const map: Record<string, string> = {
    Escape: "Esc",
    Space: "Space",
    ShiftLeft: "L-Shift",
    ShiftRight: "R-Shift",
    ControlLeft: "L-Ctrl",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
  };
  return map[code] ?? code;
}
