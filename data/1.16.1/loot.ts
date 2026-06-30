import type { ItemStack } from "../../engine/types";

const mc = (s: string) => `minecraft:${s}`;

export interface LootTable {
  id: string;
  name: string;
  /** Items placed into the chest, in slot order. */
  items: (ItemStack | null)[];
}

/**
 * Buried-treasure loot presets. RNG is intentionally removed: for practice we
 * want deterministic, repeatable chest contents that mirror common BT drops.
 */
export const LOOT_TABLES: LootTable[] = [
  {
    id: "buried_treasure_standard",
    name: "Buried Treasure (standard)",
    items: [
      { id: mc("heart_of_the_sea"), count: 1 },
      { id: mc("iron_ingot"), count: 4 },
      { id: mc("gold_ingot"), count: 2 },
      { id: mc("tnt"), count: 2 },
      { id: mc("cooked_cod"), count: 3 },
      { id: mc("emerald"), count: 1 },
      { id: mc("prismarine_crystals"), count: 1 },
    ],
  },
  {
    id: "buried_treasure_diamond",
    name: "Buried Treasure (diamond)",
    items: [
      { id: mc("heart_of_the_sea"), count: 1 },
      { id: mc("iron_ingot"), count: 5 },
      { id: mc("gold_ingot"), count: 3 },
      { id: mc("diamond"), count: 1 },
      { id: mc("tnt"), count: 1 },
      { id: mc("cooked_cod"), count: 4 },
      { id: mc("iron_sword"), count: 1, durability: 250 },
    ],
  },
  {
    id: "shipwreck_supply",
    name: "Shipwreck Supply",
    items: [
      { id: mc("bread"), count: 5 },
      { id: mc("carrot"), count: 8 },
      { id: mc("wheat"), count: 12 },
      { id: mc("paper"), count: 6 },
      { id: mc("coal"), count: 4 },
      { id: mc("gunpowder"), count: 3 },
    ],
  },
];
