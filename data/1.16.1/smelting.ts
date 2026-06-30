import type { ItemId, ItemStack } from "../../engine/types";

const mc = (s: string) => `minecraft:${s}`;
const one = (id: string): ItemStack => ({ id: mc(id), count: 1 });

export const SMELTING_1_16_1: Record<ItemId, ItemStack> = {
  [mc("raw_iron")]: one("iron_ingot"),
  [mc("iron_ore")]: one("iron_ingot"),
  [mc("raw_gold")]: one("gold_ingot"),
  [mc("gold_ore")]: one("gold_ingot"),
  [mc("sand")]: one("glass"),
  [mc("red_sand")]: one("glass"),
  [mc("cobblestone")]: one("stone"),
  [mc("stone")]: one("smooth_stone"),
  [mc("clay_ball")]: one("brick"),
  [mc("netherrack")]: one("nether_bricks"),
  [mc("cactus")]: { id: mc("green_dye"), count: 1 },
  [mc("beef")]: one("cooked_beef"),
  [mc("porkchop")]: one("cooked_porkchop"),
  [mc("chicken")]: one("cooked_chicken"),
  [mc("cod")]: one("cooked_cod"),
  [mc("salmon")]: { id: mc("cooked_salmon"), count: 1 },
  [mc("potato")]: one("baked_potato"),
  [mc("oak_log")]: one("charcoal"),
  [mc("spruce_log")]: one("charcoal"),
  [mc("birch_log")]: one("charcoal"),
};
