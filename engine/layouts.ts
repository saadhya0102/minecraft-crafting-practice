import type { ContainerLayout, SlotDef, SlotKind } from "./types";

/**
 * Slot id allocation strategy: a single flat array. We always lay out the
 * player's main inventory (27) + hotbar (9) at the end so ids are stable, and
 * put container-specific slots first.
 */

interface Builder {
  slots: SlotDef[];
  push(kind: SlotKind, row?: number, col?: number): number;
}

function builder(): Builder {
  const slots: SlotDef[] = [];
  return {
    slots,
    push(kind, row, col) {
      const id = slots.length;
      slots.push({ id, kind, row, col });
      return id;
    },
  };
}

function addPlayer(b: Builder): { main: number[]; hotbar: number[] } {
  const main: number[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++) main.push(b.push("main", r, c));
  const hotbar: number[] = [];
  for (let c = 0; c < 9; c++) hotbar.push(b.push("hotbar", 0, c));
  return { main, hotbar };
}

export function inventoryLayout(): ContainerLayout {
  const b = builder();
  const outputId = b.push("craftOut");
  const inputIds: number[] = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) inputIds.push(b.push("craftIn", r, c));
  const armor: number[] = [];
  for (let i = 0; i < 4; i++) armor.push(b.push("armor", i, 0));
  const offhand = b.push("offhand");
  const { main, hotbar } = addPlayer(b);
  void armor;
  void offhand;
  return {
    id: "inventory",
    title: "Inventory",
    slots: b.slots,
    playerMain: main,
    playerHotbar: hotbar,
    containerSlots: [],
    craftGrid: { rows: 2, cols: 2, inputIds, outputId },
  };
}

export function craftingTableLayout(): ContainerLayout {
  const b = builder();
  const outputId = b.push("craftOut");
  const inputIds: number[] = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) inputIds.push(b.push("craftIn", r, c));
  const { main, hotbar } = addPlayer(b);
  return {
    id: "crafting_table",
    title: "Crafting",
    slots: b.slots,
    playerMain: main,
    playerHotbar: hotbar,
    containerSlots: [...inputIds],
    craftGrid: { rows: 3, cols: 3, inputIds, outputId },
  };
}

export function furnaceLayout(): ContainerLayout {
  const b = builder();
  const inputId = b.push("furnaceIn");
  const fuelId = b.push("furnaceFuel");
  const outputId = b.push("furnaceOut");
  const { main, hotbar } = addPlayer(b);
  return {
    id: "furnace",
    title: "Furnace",
    slots: b.slots,
    playerMain: main,
    playerHotbar: hotbar,
    containerSlots: [inputId, fuelId, outputId],
    smelting: { inputId, fuelId, outputId },
  };
}

export function chestLayout(rows = 3): ContainerLayout {
  const b = builder();
  const container: number[] = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < 9; c++) container.push(b.push("container", r, c));
  const { main, hotbar } = addPlayer(b);
  return {
    id: "chest",
    title: "Chest",
    slots: b.slots,
    playerMain: main,
    playerHotbar: hotbar,
    containerSlots: [...container],
  };
}

export function layoutById(id: string): ContainerLayout {
  switch (id) {
    case "crafting_table":
      return craftingTableLayout();
    case "furnace":
      return furnaceLayout();
    case "chest":
      return chestLayout();
    default:
      return inventoryLayout();
  }
}
