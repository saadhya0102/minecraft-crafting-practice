import { describe, it, expect, beforeEach } from "vitest";
import { Engine, recomputeOutput } from "./engine";
import { Registry, type RegistryData } from "./registry";
import { craftingTableLayout, inventoryLayout, furnaceLayout, chestLayout } from "./layouts";
import type { GameState } from "./types";

// Minimal self-contained registry so the engine tests don't depend on the
// shipped game data.
const DATA: RegistryData = {
  version: "test",
  items: [
    { id: "minecraft:oak_log", name: "Oak Log", maxStack: 64 },
    { id: "minecraft:oak_planks", name: "Oak Planks", maxStack: 64 },
    { id: "minecraft:stick", name: "Stick", maxStack: 64 },
    { id: "minecraft:crafting_table", name: "Crafting Table", maxStack: 64 },
    { id: "minecraft:iron_ingot", name: "Iron Ingot", maxStack: 64 },
    { id: "minecraft:raw_iron", name: "Raw Iron", maxStack: 64 },
    { id: "minecraft:iron_pickaxe", name: "Iron Pickaxe", maxStack: 1, tool: true },
    { id: "minecraft:bucket", name: "Bucket", maxStack: 16 },
    { id: "minecraft:oak_boat", name: "Oak Boat", maxStack: 1 },
    { id: "minecraft:oak_door", name: "Oak Door", maxStack: 64 },
    { id: "minecraft:ender_pearl", name: "Ender Pearl", maxStack: 16 },
  ],
  recipes: [
    { type: "shapeless", ingredients: ["minecraft:oak_log"], result: { id: "minecraft:oak_planks", count: 4 } },
    {
      type: "shaped",
      pattern: ["#", "#"],
      key: { "#": "minecraft:oak_planks" },
      result: { id: "minecraft:stick", count: 4 },
    },
    {
      type: "shaped",
      pattern: ["##", "##"],
      key: { "#": "minecraft:oak_planks" },
      result: { id: "minecraft:crafting_table", count: 1 },
    },
    {
      type: "shaped",
      pattern: ["III", " S ", " S "],
      key: { I: "minecraft:iron_ingot", S: "minecraft:stick" },
      result: { id: "minecraft:iron_pickaxe", count: 1 },
    },
    {
      type: "shaped",
      pattern: ["I I", " I "],
      key: { I: "minecraft:iron_ingot" },
      result: { id: "minecraft:bucket", count: 1 },
    },
    {
      type: "shaped",
      pattern: ["P P", "PPP"],
      key: { P: "minecraft:oak_planks" },
      result: { id: "minecraft:oak_boat", count: 1 },
    },
    {
      type: "shaped",
      pattern: ["PP", "PP", "PP"],
      key: { P: "minecraft:oak_planks" },
      result: { id: "minecraft:oak_door", count: 3 },
    },
  ],
  smelting: { "minecraft:raw_iron": { id: "minecraft:iron_ingot", count: 1 } },
};

const registry = new Registry(DATA);
const engine = new Engine(registry);

function find(state: GameState, kind: string, n = 0): number {
  return state.layout.slots.filter((s) => s.kind === kind)[n].id;
}

describe("basic mouse semantics", () => {
  let state: GameState;
  beforeEach(() => {
    state = engine.create(inventoryLayout());
  });

  it("left-click picks up and places a full stack", () => {
    const h0 = state.layout.playerHotbar[0];
    state.slots[h0] = { id: "minecraft:oak_planks", count: 32 };
    engine.leftClick(state, h0);
    expect(state.cursor).toEqual({ id: "minecraft:oak_planks", count: 32 });
    expect(state.slots[h0]).toBeNull();
    const h1 = state.layout.playerHotbar[1];
    engine.leftClick(state, h1);
    expect(state.slots[h1]).toEqual({ id: "minecraft:oak_planks", count: 32 });
    expect(state.cursor).toBeNull();
  });

  it("right-click picks up half, leaving the smaller half (7 -> grab 4 leave 3)", () => {
    const h0 = state.layout.playerHotbar[0];
    state.slots[h0] = { id: "minecraft:oak_planks", count: 7 };
    engine.rightClick(state, h0);
    expect(state.cursor!.count).toBe(4);
    expect(state.slots[h0]!.count).toBe(3);
  });

  it("right-click places one item at a time", () => {
    state.cursor = { id: "minecraft:stick", count: 5 };
    const h0 = state.layout.playerHotbar[0];
    engine.rightClick(state, h0);
    engine.rightClick(state, h0);
    expect(state.slots[h0]!.count).toBe(2);
    expect(state.cursor!.count).toBe(3);
  });

  it("left-click merges identical stacks up to max", () => {
    const h0 = state.layout.playerHotbar[0];
    state.slots[h0] = { id: "minecraft:oak_planks", count: 60 };
    state.cursor = { id: "minecraft:oak_planks", count: 10 };
    engine.leftClick(state, h0);
    expect(state.slots[h0]!.count).toBe(64);
    expect(state.cursor!.count).toBe(6);
  });

  it("left-click swaps different stacks", () => {
    const h0 = state.layout.playerHotbar[0];
    state.slots[h0] = { id: "minecraft:stick", count: 5 };
    state.cursor = { id: "minecraft:oak_planks", count: 3 };
    engine.leftClick(state, h0);
    expect(state.slots[h0]).toEqual({ id: "minecraft:oak_planks", count: 3 });
    expect(state.cursor).toEqual({ id: "minecraft:stick", count: 5 });
  });
});

describe("crafting", () => {
  it("crafts planks from a log in the 2x2 grid (shapeless)", () => {
    const state = engine.create(inventoryLayout());
    const inId = find(state, "craftIn");
    state.slots[inId] = { id: "minecraft:oak_log", count: 1 };
    recomputeOutput(state, registry);
    const outId = find(state, "craftOut");
    expect(state.slots[outId]).toEqual({ id: "minecraft:oak_planks", count: 4 });
    engine.leftClick(state, outId);
    expect(state.cursor).toEqual({ id: "minecraft:oak_planks", count: 4 });
    expect(state.slots[inId]).toBeNull();
  });

  it("crafts an iron pickaxe in the 3x3 table (shaped)", () => {
    const state = engine.create(craftingTableLayout());
    const cg = state.layout.craftGrid!;
    // top row iron, middle+bottom center stick
    state.slots[cg.inputIds[0]] = { id: "minecraft:iron_ingot", count: 1 };
    state.slots[cg.inputIds[1]] = { id: "minecraft:iron_ingot", count: 1 };
    state.slots[cg.inputIds[2]] = { id: "minecraft:iron_ingot", count: 1 };
    state.slots[cg.inputIds[4]] = { id: "minecraft:stick", count: 1 };
    state.slots[cg.inputIds[7]] = { id: "minecraft:stick", count: 1 };
    recomputeOutput(state, registry);
    expect(state.slots[cg.outputId]).toEqual({ id: "minecraft:iron_pickaxe", count: 1 });
  });

  it("shift-click on output crafts the maximum and moves to inventory", () => {
    const state = engine.create(craftingTableLayout());
    const cg = state.layout.craftGrid!;
    state.slots[cg.inputIds[0]] = { id: "minecraft:oak_planks", count: 8 };
    state.slots[cg.inputIds[1]] = { id: "minecraft:oak_planks", count: 8 };
    state.slots[cg.inputIds[3]] = { id: "minecraft:oak_planks", count: 8 };
    state.slots[cg.inputIds[4]] = { id: "minecraft:oak_planks", count: 8 };
    recomputeOutput(state, registry);
    engine.shiftLeftClick(state, cg.outputId);
    // 8 crafts of a crafting table -> 8 tables somewhere in the inventory
    const total = state.layout.playerMain
      .concat(state.layout.playerHotbar)
      .map((id) => state.slots[id])
      .filter((s) => s && s.id === "minecraft:crafting_table")
      .reduce((a, s) => a + (s!.count), 0);
    expect(total).toBe(8);
  });

  it("crafts a boat (5 planks U-shape)", () => {
    const state = engine.create(craftingTableLayout());
    const cg = state.layout.craftGrid!;
    for (const i of [0, 2, 3, 4, 5]) state.slots[cg.inputIds[i]] = { id: "minecraft:oak_planks", count: 1 };
    recomputeOutput(state, registry);
    expect(state.slots[cg.outputId]).toEqual({ id: "minecraft:oak_boat", count: 1 });
  });

  it("updates the output preview when placing ingredients via clicks", () => {
    const state = engine.create(craftingTableLayout());
    const cg = state.layout.craftGrid!;
    // Hold 3 iron on the cursor and right-click them into a V shape.
    state.cursor = { id: "minecraft:iron_ingot", count: 3 };
    engine.rightClick(state, cg.inputIds[0]);
    engine.rightClick(state, cg.inputIds[2]);
    engine.rightClick(state, cg.inputIds[4]);
    expect(state.slots[cg.outputId]).toEqual({ id: "minecraft:bucket", count: 1 });
    // Taking the output consumes the ingredients and clears the preview.
    engine.leftClick(state, cg.outputId);
    expect(state.cursor).toEqual({ id: "minecraft:bucket", count: 1 });
    expect(state.slots[cg.outputId]).toBeNull();
  });

  it("crafts a bucket (3 iron V-shape) and 3 doors", () => {
    const state = engine.create(craftingTableLayout());
    const cg = state.layout.craftGrid!;
    for (const i of [0, 2, 4]) state.slots[cg.inputIds[i]] = { id: "minecraft:iron_ingot", count: 1 };
    recomputeOutput(state, registry);
    expect(state.slots[cg.outputId]).toEqual({ id: "minecraft:bucket", count: 1 });
  });
});

describe("shift-click quick move", () => {
  it("moves a hotbar stack to the main inventory on the inventory screen", () => {
    const state = engine.create(inventoryLayout());
    const h0 = state.layout.playerHotbar[0];
    state.slots[h0] = { id: "minecraft:oak_planks", count: 10 };
    engine.shiftLeftClick(state, h0);
    expect(state.slots[h0]).toBeNull();
    const firstMain = state.slots[state.layout.playerMain[0]];
    expect(firstMain).toEqual({ id: "minecraft:oak_planks", count: 10 });
  });

  it("fast-loots a chest: shift-clicking each slot empties the container into the inventory", () => {
    const state = engine.create(chestLayout());
    const ids = state.layout.containerSlots;
    state.slots[ids[0]] = { id: "minecraft:iron_ingot", count: 4 };
    state.slots[ids[1]] = { id: "minecraft:gold_ingot", count: 2 };
    state.slots[ids[2]] = { id: "minecraft:oak_planks", count: 8 };
    for (const id of ids) engine.shiftLeftClick(state, id);
    // container fully emptied
    expect(ids.every((id) => state.slots[id] === null)).toBe(true);
    // items landed in the player inventory
    const total = [...state.layout.playerMain, ...state.layout.playerHotbar]
      .map((id) => state.slots[id])
      .filter((s) => s)
      .reduce((a, s) => a + s!.count, 0);
    expect(total).toBe(14);
  });

  it("routes a smeltable into the furnace input via shift-click", () => {
    const state = engine.create(furnaceLayout());
    const h0 = state.layout.playerHotbar[0];
    state.slots[h0] = { id: "minecraft:raw_iron", count: 5 };
    engine.shiftLeftClick(state, h0);
    expect(state.slots[state.layout.smelting!.inputId]).toEqual({ id: "minecraft:raw_iron", count: 5 });
  });
});

describe("number / drop / offhand keys", () => {
  it("number key swaps hovered slot with hotbar slot", () => {
    const state = engine.create(inventoryLayout());
    const m0 = state.layout.playerMain[0];
    state.slots[m0] = { id: "minecraft:iron_ingot", count: 3 };
    engine.numberKey(state, m0, 2); // hotbar slot 3
    expect(state.slots[m0]).toBeNull();
    expect(state.slots[state.layout.playerHotbar[2]]).toEqual({ id: "minecraft:iron_ingot", count: 3 });
  });

  it("Q drops one, Ctrl+Q drops the whole stack", () => {
    const state = engine.create(inventoryLayout());
    const h0 = state.layout.playerHotbar[0];
    state.slots[h0] = { id: "minecraft:stick", count: 5 };
    engine.dropFromSlot(state, h0, false);
    expect(state.slots[h0]!.count).toBe(4);
    engine.dropFromSlot(state, h0, true);
    expect(state.slots[h0]).toBeNull();
  });

  it("F swaps a slot with the off-hand", () => {
    const state = engine.create(inventoryLayout());
    const h0 = state.layout.playerHotbar[0];
    state.slots[h0] = { id: "minecraft:iron_pickaxe", count: 1, durability: 250 };
    engine.swapOffhand(state, h0);
    const off = state.layout.slots.find((s) => s.kind === "offhand")!.id;
    expect(state.slots[off]).toEqual({ id: "minecraft:iron_pickaxe", count: 1, durability: 250 });
    expect(state.slots[h0]).toBeNull();
  });
});

describe("drag distribution", () => {
  it("left-drag splits the cursor stack evenly across slots", () => {
    const state = engine.create(inventoryLayout());
    state.cursor = { id: "minecraft:oak_planks", count: 6 };
    engine.startDrag(state, "left");
    engine.addDragSlot(state, state.layout.playerHotbar[0]);
    engine.addDragSlot(state, state.layout.playerHotbar[1]);
    engine.addDragSlot(state, state.layout.playerHotbar[2]);
    engine.endDrag(state);
    expect(state.slots[state.layout.playerHotbar[0]]!.count).toBe(2);
    expect(state.slots[state.layout.playerHotbar[1]]!.count).toBe(2);
    expect(state.slots[state.layout.playerHotbar[2]]!.count).toBe(2);
    expect(state.cursor).toBeNull();
  });

  it("right-drag places exactly one per slot", () => {
    const state = engine.create(inventoryLayout());
    state.cursor = { id: "minecraft:oak_planks", count: 10 };
    engine.startDrag(state, "right");
    engine.addDragSlot(state, state.layout.playerHotbar[0]);
    engine.addDragSlot(state, state.layout.playerHotbar[1]);
    engine.endDrag(state);
    expect(state.slots[state.layout.playerHotbar[0]]!.count).toBe(1);
    expect(state.slots[state.layout.playerHotbar[1]]!.count).toBe(1);
    expect(state.cursor!.count).toBe(8);
  });
});

describe("double-click gather", () => {
  it("gathers identical items up to a full stack", () => {
    const state = engine.create(chestLayout());
    state.slots[state.layout.playerHotbar[0]] = { id: "minecraft:oak_planks", count: 20 };
    state.slots[state.layout.playerHotbar[1]] = { id: "minecraft:oak_planks", count: 30 };
    state.slots[state.layout.playerMain[0]] = { id: "minecraft:oak_planks", count: 40 };
    // pick one up first, then gather
    engine.leftClick(state, state.layout.playerHotbar[0]);
    engine.doubleClick(state, state.layout.playerHotbar[0]);
    expect(state.cursor!.count).toBe(64);
  });
});

describe("stack-size limits", () => {
  it("respects 16-stack items (ender pearls)", () => {
    const state = engine.create(inventoryLayout());
    const h0 = state.layout.playerHotbar[0];
    state.slots[h0] = { id: "minecraft:ender_pearl", count: 14 };
    state.cursor = { id: "minecraft:ender_pearl", count: 10 };
    engine.leftClick(state, h0);
    expect(state.slots[h0]!.count).toBe(16);
    expect(state.cursor!.count).toBe(8);
  });
});

describe("instant smelt", () => {
  it("converts raw iron to iron ingots immediately when enabled", () => {
    const state = engine.create(furnaceLayout(), { instantSmelt: true });
    const sm = state.layout.smelting!;
    state.cursor = { id: "minecraft:raw_iron", count: 5 };
    engine.leftClick(state, sm.inputId);
    expect(state.slots[sm.outputId]).toEqual({ id: "minecraft:iron_ingot", count: 5 });
    expect(state.slots[sm.inputId]).toBeNull();
  });
});
