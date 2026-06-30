import { describe, it, expect } from "vitest";
import { Engine } from "../engine/engine";
import { craftingTableLayout, inventoryLayout } from "../engine/layouts";
import { recomputeOutput } from "../engine/engine";
import { applySetup } from "../engine/setup";
import { getRegistry, getBundle } from "./index";
import { matchRecipe } from "../engine/recipes";

const registry = getRegistry("1.16.1");
const engine = new Engine(registry, getBundle("1.16.1").flags);
const mc = (s: string) => `minecraft:${s}`;

function grid3(map: Record<number, string>) {
  const g: (string | null)[][] = [
    [null, null, null],
    [null, null, null],
    [null, null, null],
  ];
  for (const [k, v] of Object.entries(map)) {
    const i = Number(k);
    g[Math.floor(i / 3)][i % 3] = mc(v);
  }
  return g;
}

describe("1.16.1 scenario recipes", () => {
  it("log -> 4 planks (every wood)", () => {
    for (const wood of ["oak", "spruce", "birch", "jungle", "acacia", "dark_oak"]) {
      const r = matchRecipe(registry.recipes, [[mc(`${wood}_log`)]]);
      expect(r).toEqual({ id: mc(`${wood}_planks`), count: 4 });
    }
  });

  it("2 planks -> 4 sticks", () => {
    const r = matchRecipe(registry.recipes, [[mc("oak_planks")], [mc("oak_planks")]]);
    expect(r).toEqual({ id: mc("stick"), count: 4 });
  });

  it("iron pickaxe", () => {
    const r = matchRecipe(registry.recipes, grid3({ 0: "iron_ingot", 1: "iron_ingot", 2: "iron_ingot", 4: "stick", 7: "stick" }));
    expect(r).toEqual({ id: mc("iron_pickaxe"), count: 1 });
  });

  it("iron sword and shovel", () => {
    expect(matchRecipe(registry.recipes, grid3({ 0: "iron_ingot", 3: "iron_ingot", 6: "stick" }))).toEqual({ id: mc("iron_sword"), count: 1 });
    expect(matchRecipe(registry.recipes, grid3({ 0: "iron_ingot", 3: "stick", 6: "stick" }))).toEqual({ id: mc("iron_shovel"), count: 1 });
  });

  it("bucket (3 iron V)", () => {
    expect(matchRecipe(registry.recipes, grid3({ 0: "iron_ingot", 2: "iron_ingot", 4: "iron_ingot" }))).toEqual({ id: mc("bucket"), count: 1 });
  });

  it("oak boat and 3 oak doors", () => {
    expect(matchRecipe(registry.recipes, grid3({ 0: "oak_planks", 2: "oak_planks", 3: "oak_planks", 4: "oak_planks", 5: "oak_planks" }))).toEqual({ id: mc("oak_boat"), count: 1 });
    expect(matchRecipe(registry.recipes, grid3({ 0: "oak_planks", 1: "oak_planks", 3: "oak_planks", 4: "oak_planks", 6: "oak_planks", 7: "oak_planks" }))).toEqual({ id: mc("oak_door"), count: 3 });
  });

  it("crafting table and furnace", () => {
    expect(matchRecipe(registry.recipes, grid3({ 0: "oak_planks", 1: "oak_planks", 3: "oak_planks", 4: "oak_planks" }))).toEqual({ id: mc("crafting_table"), count: 1 });
    expect(matchRecipe(registry.recipes, grid3({ 0: "cobblestone", 1: "cobblestone", 2: "cobblestone", 3: "cobblestone", 5: "cobblestone", 6: "cobblestone", 7: "cobblestone", 8: "cobblestone" }))).toEqual({ id: mc("furnace"), count: 1 });
  });
});

describe("setup application", () => {
  it("applies the boat+bucket+doors preset and crafts a boat end-to-end", () => {
    const state = engine.create(craftingTableLayout());
    applySetup(state, getBundle("1.16.1").presets.find((p) => p.id === "boat_bucket_doors")!.setup, registry);
    const cg = state.layout.craftGrid!;
    // place 5 planks in a boat shape from the hotbar stack
    const plankSlot = state.layout.playerHotbar[0];
    engine.leftClick(state, plankSlot); // grab planks
    for (const i of [0, 2, 3, 4, 5]) engine.rightClick(state, cg.inputIds[i]);
    expect(state.slots[cg.outputId]).toEqual({ id: mc("oak_boat"), count: 1 });
  });

  it("has a large item palette (>150 items)", () => {
    expect(registry.allItems().length).toBeGreaterThan(150);
  });

  it("inventory layout has a 2x2 grid, table has 3x3", () => {
    expect(inventoryLayout().craftGrid!.inputIds.length).toBe(4);
    expect(craftingTableLayout().craftGrid!.inputIds.length).toBe(9);
    void recomputeOutput;
  });
});
