import type { ContainerLayout } from "../../engine/types";

export const SLOT = 18; // base slot size in GUI units (1 unit = 1px @ scale 1)
export const PAD = 7;
export const ITEM = 16;

export interface SlotRect {
  id: number;
  x: number;
  y: number;
  kind: string;
}

export interface Decoration {
  type: "arrow" | "flame" | "label";
  x: number;
  y: number;
  text?: string;
}

export interface GuiGeometry {
  width: number;
  height: number;
  slots: SlotRect[];
  decorations: Decoration[];
  title: string;
  titleX: number;
  titleY: number;
}

const WIDTH = PAD * 2 + 9 * SLOT; // 176

function placeGrid(
  out: SlotRect[],
  ids: number[],
  cols: number,
  ox: number,
  oy: number,
  kind: string,
): void {
  for (let i = 0; i < ids.length; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    out.push({ id: ids[i], x: ox + c * SLOT, y: oy + r * SLOT, kind });
  }
}

function bottomBlock(out: SlotRect[], layout: ContainerLayout, oy: number): number {
  placeGrid(out, layout.playerMain, 9, PAD, oy, "main");
  const hotbarY = oy + 3 * SLOT + 4;
  placeGrid(out, layout.playerHotbar, 9, PAD, hotbarY, "hotbar");
  return hotbarY + SLOT + PAD;
}

export function computeGeometry(layout: ContainerLayout): GuiGeometry {
  const slots: SlotRect[] = [];
  const decorations: Decoration[] = [];
  let mainOriginY = PAD;

  switch (layout.id) {
    case "crafting_table": {
      const cg = layout.craftGrid!;
      placeGrid(slots, cg.inputIds, 3, 30, PAD, "craftIn");
      const outX = 30 + 3 * SLOT + 26;
      const outY = PAD + SLOT;
      slots.push({ id: cg.outputId, x: outX, y: outY, kind: "craftOut" });
      decorations.push({ type: "arrow", x: 30 + 3 * SLOT + 4, y: outY });
      mainOriginY = PAD + 3 * SLOT + 14;
      break;
    }
    case "furnace": {
      const sm = layout.smelting!;
      slots.push({ id: sm.inputId, x: 50, y: PAD, kind: "furnaceIn" });
      slots.push({ id: sm.fuelId, x: 50, y: PAD + 2 * SLOT + 4, kind: "furnaceFuel" });
      decorations.push({ type: "flame", x: 50, y: PAD + SLOT + 2 });
      const outX = 50 + 3 * SLOT + 24;
      const outY = PAD + SLOT;
      slots.push({ id: sm.outputId, x: outX, y: outY, kind: "furnaceOut" });
      decorations.push({ type: "arrow", x: 50 + SLOT + 6, y: outY });
      mainOriginY = PAD + 3 * SLOT + 14;
      break;
    }
    case "chest": {
      placeGrid(slots, layout.containerSlots, 9, PAD, PAD, "container");
      const rows = Math.ceil(layout.containerSlots.length / 9);
      mainOriginY = PAD + rows * SLOT + 14;
      break;
    }
    default: {
      // inventory screen
      const cg = layout.craftGrid!;
      const armor = layout.slots.filter((s) => s.kind === "armor").map((s) => s.id);
      placeGrid(slots, armor, 1, PAD, PAD, "armor");
      const offhand = layout.slots.find((s) => s.kind === "offhand");
      if (offhand) slots.push({ id: offhand.id, x: PAD, y: PAD + 4 * SLOT + 6, kind: "offhand" });
      placeGrid(slots, cg.inputIds, 2, 88, PAD + SLOT, "craftIn");
      const outX = 88 + 2 * SLOT + 26;
      const outY = PAD + SLOT + Math.floor(SLOT / 2);
      slots.push({ id: cg.outputId, x: outX, y: outY, kind: "craftOut" });
      decorations.push({ type: "arrow", x: 88 + 2 * SLOT + 4, y: outY });
      mainOriginY = PAD + 5 * SLOT + 8;
      break;
    }
  }

  const height = bottomBlock(slots, layout, mainOriginY);
  return {
    width: WIDTH,
    height,
    slots,
    decorations,
    title: layout.title,
    titleX: PAD,
    titleY: 2,
  };
}

/** Find the slot id at the given GUI-unit coordinate, or null. */
export function slotAt(geo: GuiGeometry, gx: number, gy: number): number | null {
  for (const s of geo.slots) {
    if (gx >= s.x && gx < s.x + SLOT && gy >= s.y && gy < s.y + SLOT) return s.id;
  }
  return null;
}
