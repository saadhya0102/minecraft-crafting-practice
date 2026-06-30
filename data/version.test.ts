import { describe, it, expect } from "vitest";
import { getRegistry, listVersions } from "./index";
import { matchRecipe } from "../engine/recipes";

const mc = (s: string) => `minecraft:${s}`;

describe("multi-version data", () => {
  it("exposes both 1.16.1 and 1.21", () => {
    const ids = listVersions().map((v) => v.id);
    expect(ids).toContain("1.16.1");
    expect(ids).toContain("1.21");
  });

  it("1.21 keeps the overworld recipes and adds copper/spyglass", () => {
    const reg = getRegistry("1.21");
    // unchanged scenario recipe
    expect(
      matchRecipe(reg.recipes, [
        [mc("iron_ingot"), null, mc("iron_ingot")],
        [null, mc("iron_ingot"), null],
        [null, null, null],
      ]),
    ).toEqual({ id: mc("bucket"), count: 1 });
    // new recipe
    expect(
      matchRecipe(reg.recipes, [[mc("amethyst_shard")], [mc("copper_ingot")], [mc("copper_ingot")]]),
    ).toEqual({ id: mc("spyglass"), count: 1 });
    expect(reg.has(mc("mace"))).toBe(true);
  });

  it("1.16.1 does not include 1.21-only items", () => {
    expect(getRegistry("1.16.1").has(mc("mace"))).toBe(false);
  });
});
