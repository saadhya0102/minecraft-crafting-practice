import type { ItemDef, Recipe, RegistryData } from "../../engine/registry";
import type { ItemId, ItemStack, VersionFlags } from "../../engine/types";
import {
  ITEMS_1_16_1,
  RECIPES_1_16_1,
  SMELTING_1_16_1,
  PRESETS_1_16_1,
  LOOT_TABLES as LOOT_1_16_1,
} from "../1.16.1";

const mc = (s: string) => `minecraft:${s}`;

// Items introduced/relevant since 1.16.1 that we surface in the palette.
const EXTRA_ITEMS: ItemDef[] = [
  { id: mc("raw_copper"), name: "Raw Copper", maxStack: 64, category: "materials", color: "#c46a3a" },
  { id: mc("copper_block"), name: "Block of Copper", maxStack: 64, category: "building", color: "#c46a3a" },
  { id: mc("copper_bulb"), name: "Copper Bulb", maxStack: 64, category: "redstone", color: "#d98a4a", accent: "#e7c46b" },
  { id: mc("amethyst_shard"), name: "Amethyst Shard", maxStack: 64, category: "materials", color: "#9a6ad9" },
  { id: mc("amethyst_block"), name: "Block of Amethyst", maxStack: 64, category: "building", color: "#8a5ac9" },
  { id: mc("spyglass"), name: "Spyglass", maxStack: 1, category: "tools", color: "#c46a3a", accent: "#3a8a8a", tool: true },
  { id: mc("mace"), name: "Mace", maxStack: 1, category: "combat", color: "#4a4248", accent: "#7a5a4a", tool: true },
  { id: mc("breeze_rod"), name: "Breeze Rod", maxStack: 64, category: "materials", color: "#8ad9c9" },
  { id: mc("wind_charge"), name: "Wind Charge", maxStack: 64, category: "combat", color: "#bfe6f0" },
  { id: mc("heavy_core"), name: "Heavy Core", maxStack: 1, category: "materials", color: "#3a3440" },
  { id: mc("tuff"), name: "Tuff", maxStack: 64, category: "building", color: "#6f706a" },
  { id: mc("calcite"), name: "Calcite", maxStack: 64, category: "building", color: "#dcdcd6" },
  { id: mc("trial_key"), name: "Trial Key", maxStack: 64, category: "misc", color: "#c8a84a" },
];

const EXTRA_RECIPES: Recipe[] = [
  { type: "shaped", pattern: ["###", "###", "###"], key: { "#": mc("copper_ingot") }, result: { id: mc("copper_block"), count: 1 } },
  { type: "shaped", pattern: ["##", "##"], key: { "#": mc("amethyst_shard") }, result: { id: mc("amethyst_block"), count: 1 } },
  { type: "shaped", pattern: ["A", "C", "C"], key: { A: mc("amethyst_shard"), C: mc("copper_ingot") }, result: { id: mc("spyglass"), count: 1 } },
  { type: "shaped", pattern: ["B", "H"], key: { B: mc("breeze_rod"), H: mc("heavy_core") }, result: { id: mc("mace"), count: 1 } },
];

const EXTRA_SMELTING: Record<ItemId, ItemStack> = {
  [mc("raw_copper")]: { id: mc("copper_ingot"), count: 1 },
};

export const REGISTRY_DATA_1_21: RegistryData = {
  version: "1.21",
  items: [...ITEMS_1_16_1, ...EXTRA_ITEMS],
  recipes: [...RECIPES_1_16_1, ...EXTRA_RECIPES],
  smelting: { ...SMELTING_1_16_1, ...EXTRA_SMELTING },
};

export const FLAGS_1_21: VersionFlags = {
  shiftCraftMax: true,
  hasOffhand: true,
};

// The overworld craft routes are unchanged for 1.21, so reuse the presets/loot.
export const PRESETS_1_21 = PRESETS_1_16_1;
export const LOOT_1_21 = LOOT_1_16_1;
