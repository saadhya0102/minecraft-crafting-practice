// Keybinds mirror Minecraft Java Edition's default Controls
// (https://minecraft.wiki/w/Controls). The trainer only simulates the
// inventory/crafting GUI, so movement/gameplay binds are listed for parity and
// remapping practice; only "functional" actions drive the engine.

export type ActionId =
  | "attack"
  | "use"
  | "pickItem"
  | "forward"
  | "back"
  | "left"
  | "right"
  | "jump"
  | "sneak"
  | "sprint"
  | "drop"
  | "dropStack"
  | "swapOffhand"
  | "inventory"
  | "hotbar1"
  | "hotbar2"
  | "hotbar3"
  | "hotbar4"
  | "hotbar5"
  | "hotbar6"
  | "hotbar7"
  | "hotbar8"
  | "hotbar9"
  | "advancements"
  | "playerlist"
  | "chat"
  | "command"
  | "screenshot"
  | "togglePerspective"
  | "fullscreen"
  | "resetAttempt"
  | "toggleInstantSmelt"
  | "toggleRecipeBook";

export type ActionGroup = "gameplay" | "movement" | "inventory" | "misc" | "tool";

export interface ActionDef {
  id: ActionId;
  label: string;
  /** Default KeyboardEvent.code, or a "Mouse1/2/3" pseudo-code for fixed buttons. */
  defaultCode: string;
  rebindable: boolean;
  /** Acts on the slot under the cursor. */
  requiresSlot: boolean;
  /** True if the trainer actually performs this action (others are parity-only). */
  functional: boolean;
  group: ActionGroup;
  note?: string;
}

export const ACTIONS: ActionDef[] = [
  // Gameplay (mouse buttons are fixed to match Minecraft).
  { id: "attack", label: "Attack / Destroy", defaultCode: "Mouse1", rebindable: false, requiresSlot: false, functional: false, group: "gameplay", note: "Left click in the GUI: pick up / place / craft." },
  { id: "use", label: "Use Item / Place Block", defaultCode: "Mouse2", rebindable: false, requiresSlot: false, functional: false, group: "gameplay", note: "Right click in the GUI: pick up half / place one." },
  { id: "pickItem", label: "Pick Block", defaultCode: "Mouse3", rebindable: false, requiresSlot: false, functional: false, group: "gameplay", note: "Middle click clones a stack (creative mode)." },

  // Movement (parity only - the trainer has no world movement).
  { id: "forward", label: "Walk Forward", defaultCode: "KeyW", rebindable: true, requiresSlot: false, functional: false, group: "movement" },
  { id: "back", label: "Walk Backward", defaultCode: "KeyS", rebindable: true, requiresSlot: false, functional: false, group: "movement" },
  { id: "left", label: "Strafe Left", defaultCode: "KeyA", rebindable: true, requiresSlot: false, functional: false, group: "movement" },
  { id: "right", label: "Strafe Right", defaultCode: "KeyD", rebindable: true, requiresSlot: false, functional: false, group: "movement" },
  { id: "jump", label: "Jump", defaultCode: "Space", rebindable: true, requiresSlot: false, functional: false, group: "movement" },
  { id: "sneak", label: "Sneak", defaultCode: "ShiftLeft", rebindable: true, requiresSlot: false, functional: false, group: "movement", note: "In the GUI, Shift quick-moves a stack (fixed, like Minecraft)." },
  { id: "sprint", label: "Sprint", defaultCode: "ControlLeft", rebindable: true, requiresSlot: false, functional: false, group: "movement" },

  // Inventory (functional).
  { id: "drop", label: "Drop Selected Item", defaultCode: "KeyQ", rebindable: true, requiresSlot: true, functional: true, group: "inventory", note: "Hold Ctrl to drop the whole stack (Ctrl is fixed, like Minecraft)." },
  { id: "swapOffhand", label: "Swap Item With Off-Hand", defaultCode: "KeyF", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },
  { id: "inventory", label: "Open / Close Inventory", defaultCode: "KeyE", rebindable: true, requiresSlot: false, functional: false, group: "inventory", note: "The trainer GUI is always open." },
  { id: "hotbar1", label: "Hotbar Slot 1", defaultCode: "Digit1", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },
  { id: "hotbar2", label: "Hotbar Slot 2", defaultCode: "Digit2", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },
  { id: "hotbar3", label: "Hotbar Slot 3", defaultCode: "Digit3", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },
  { id: "hotbar4", label: "Hotbar Slot 4", defaultCode: "Digit4", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },
  { id: "hotbar5", label: "Hotbar Slot 5", defaultCode: "Digit5", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },
  { id: "hotbar6", label: "Hotbar Slot 6", defaultCode: "Digit6", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },
  { id: "hotbar7", label: "Hotbar Slot 7", defaultCode: "Digit7", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },
  { id: "hotbar8", label: "Hotbar Slot 8", defaultCode: "Digit8", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },
  { id: "hotbar9", label: "Hotbar Slot 9", defaultCode: "Digit9", rebindable: true, requiresSlot: true, functional: true, group: "inventory" },

  // Miscellaneous (parity only).
  { id: "advancements", label: "Advancements", defaultCode: "KeyL", rebindable: true, requiresSlot: false, functional: false, group: "misc" },
  { id: "playerlist", label: "List Players", defaultCode: "Tab", rebindable: true, requiresSlot: false, functional: false, group: "misc" },
  { id: "chat", label: "Open Chat", defaultCode: "KeyT", rebindable: true, requiresSlot: false, functional: false, group: "misc" },
  { id: "command", label: "Open Command", defaultCode: "Slash", rebindable: true, requiresSlot: false, functional: false, group: "misc" },
  { id: "screenshot", label: "Take Screenshot", defaultCode: "F2", rebindable: true, requiresSlot: false, functional: false, group: "misc" },
  { id: "togglePerspective", label: "Toggle Perspective", defaultCode: "F5", rebindable: true, requiresSlot: false, functional: false, group: "misc" },
  { id: "fullscreen", label: "Toggle Fullscreen", defaultCode: "F11", rebindable: true, requiresSlot: false, functional: false, group: "misc" },

  // Trainer-specific tools.
  { id: "resetAttempt", label: "Reset Attempt", defaultCode: "KeyR", rebindable: true, requiresSlot: false, functional: true, group: "tool" },
  { id: "toggleInstantSmelt", label: "Toggle Instant Smelt", defaultCode: "KeyG", rebindable: true, requiresSlot: false, functional: true, group: "tool" },
  { id: "toggleRecipeBook", label: "Toggle Recipe Book", defaultCode: "KeyB", rebindable: true, requiresSlot: false, functional: true, group: "tool" },
];

export const GROUP_LABELS: Record<ActionGroup, string> = {
  gameplay: "Gameplay (mouse)",
  movement: "Movement",
  inventory: "Inventory",
  misc: "Miscellaneous",
  tool: "Trainer Tools",
};

export const GROUP_ORDER: ActionGroup[] = ["inventory", "gameplay", "movement", "misc", "tool"];

export const ACTION_BY_ID: Record<string, ActionDef> = Object.fromEntries(
  ACTIONS.map((a) => [a.id, a]),
);

export function defaultBinds(): Record<ActionId, string> {
  const out = {} as Record<ActionId, string>;
  for (const a of ACTIONS) out[a.id] = a.defaultCode;
  return out;
}

/** Human-readable label for a KeyboardEvent.code (or Mouse pseudo-code). */
export function codeLabel(code: string): string {
  if (!code) return "Unbound";
  const map: Record<string, string> = {
    Mouse1: "Left Click",
    Mouse2: "Right Click",
    Mouse3: "Middle Click",
    Escape: "Esc",
    Space: "Space",
    Slash: "/",
    Tab: "Tab",
    ShiftLeft: "L-Shift",
    ShiftRight: "R-Shift",
    ControlLeft: "L-Ctrl",
    ControlRight: "R-Ctrl",
    AltLeft: "L-Alt",
    ArrowUp: "↑",
    ArrowDown: "↓",
    ArrowLeft: "←",
    ArrowRight: "→",
  };
  if (map[code]) return map[code];
  if (code.startsWith("Key")) return code.slice(3);
  if (code.startsWith("Digit")) return code.slice(5);
  if (code.startsWith("Numpad")) return "Num " + code.slice(6);
  return code;
}
