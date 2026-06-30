// Pure, framework-agnostic types for the inventory/crafting simulation engine.
// No React / Pixi / DOM imports allowed in this folder.

export type ItemId = string; // e.g. "minecraft:iron_ingot"

export interface ItemStack {
  id: ItemId;
  count: number;
  /** Remaining durability for tools (optional). */
  durability?: number;
}

export type SlotKind =
  | "hotbar"
  | "main"
  | "armor"
  | "offhand"
  | "craftIn"
  | "craftOut"
  | "furnaceIn"
  | "furnaceFuel"
  | "furnaceOut"
  | "container"
  | "palette"; // creative-style infinite source slot

export interface SlotDef {
  id: number;
  kind: SlotKind;
  /** Optional grid coordinates used by craft grids / container grids. */
  row?: number;
  col?: number;
}

export interface CraftGridDef {
  rows: number;
  cols: number;
  inputIds: number[]; // length rows*cols, row-major
  outputId: number;
}

export interface SmeltingDef {
  inputId: number;
  fuelId: number;
  outputId: number;
}

/**
 * Describes the set of slots that are currently visible and how they group
 * together. Region ordering matters: Minecraft shift-click and quick-move
 * semantics depend on the precise traversal order.
 */
export interface ContainerLayout {
  id: string; // "inventory" | "crafting_table" | "furnace" | "chest"
  title: string;
  slots: SlotDef[];
  /** 27 main inventory slot ids (top 3 rows of the player inventory). */
  playerMain: number[];
  /** 9 hotbar slot ids. */
  playerHotbar: number[];
  /** External container / table slot ids (excludes player inv + hotbar). */
  containerSlots: number[];
  craftGrid?: CraftGridDef;
  smelting?: SmeltingDef;
}

export interface GameState {
  layout: ContainerLayout;
  /** Flat array; index === slot id. */
  slots: (ItemStack | null)[];
  /** Stack currently held on the cursor. */
  cursor: ItemStack | null;
  drag: DragState | null;
  /** Whether instant-smelt is enabled (drill mode). */
  instantSmelt: boolean;
  /** True for sandbox/creative behavior (middle-click clone, palette). */
  creative: boolean;
}

export type DragButton = "left" | "right" | "middle";

export interface DragState {
  button: DragButton;
  slots: number[];
  /** The stack that was on the cursor when the drag started. */
  startStack: ItemStack;
}

/** Behavior flags so the same engine can model multiple MC versions. */
export interface VersionFlags {
  /** Shift-clicking the craft output crafts the maximum amount (1.16 behavior). */
  shiftCraftMax: boolean;
  /** Off-hand slot exists. */
  hasOffhand: boolean;
}

export const DEFAULT_FLAGS: VersionFlags = {
  shiftCraftMax: true,
  hasOffhand: true,
};
