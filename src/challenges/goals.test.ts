import { describe, it, expect } from "vitest";
import { Engine } from "../../engine/engine";
import { layoutById } from "../../engine/layouts";
import { applySetup } from "../../engine/setup";
import { getRegistry, getBundle } from "../../data/index";
import { goalMet, countItem } from "./goals";
import { challengeById } from "./builtins";

const registry = getRegistry("1.16.1");
const engine = new Engine(registry, getBundle("1.16.1").flags);

function start(id: string) {
  const c = challengeById(id)!;
  const state = engine.create(layoutById(c.layoutId), { creative: c.creative });
  applySetup(state, c.setup, registry);
  return { c, state };
}

describe("challenge goals", () => {
  it("bt_loot is met once the chest is emptied", () => {
    const { c, state } = start("bt_loot");
    expect(goalMet(state, c.goal)).toBe(false);
    for (const id of state.layout.containerSlots) state.slots[id] = null;
    expect(goalMet(state, c.goal)).toBe(true);
  });

  it("boat_bucket_doors is met after crafting boat, bucket, and 3 doors", () => {
    const { c, state } = start("boat_bucket_doors");
    const h = state.layout.playerHotbar;
    // Simulate having crafted the outputs by placing them in the inventory.
    state.slots[h[2]] = { id: "minecraft:oak_boat", count: 1 };
    state.slots[h[3]] = { id: "minecraft:bucket", count: 1 };
    state.slots[h[4]] = { id: "minecraft:oak_door", count: 3 };
    expect(goalMet(state, c.goal)).toBe(true);
  });

  it("counts items across the player's holdings", () => {
    const { state } = start("iron_tools");
    expect(countItem(state, "minecraft:iron_ingot")).toBe(9);
  });
});
