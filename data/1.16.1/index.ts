import type { RegistryData } from "../../engine/registry";
import type { VersionFlags } from "../../engine/types";
import { ITEMS_1_16_1 } from "./items";
import { RECIPES_1_16_1 } from "./recipes";
import { SMELTING_1_16_1 } from "./smelting";

export const REGISTRY_DATA_1_16_1: RegistryData = {
  version: "1.16.1",
  items: ITEMS_1_16_1,
  recipes: RECIPES_1_16_1,
  smelting: SMELTING_1_16_1,
};

export const FLAGS_1_16_1: VersionFlags = {
  shiftCraftMax: true,
  hasOffhand: true,
};

export { ITEMS_1_16_1, RECIPES_1_16_1, SMELTING_1_16_1 };
export { LOOT_TABLES } from "./loot";
export { PRESETS_1_16_1, type NamedSetup } from "./presets";
export { CATEGORIES, WOODS, TOOL_MATERIALS } from "./items";
