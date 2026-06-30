import type { SetupSnapshot } from "../../engine/setup";

const mc = (s: string) => `minecraft:${s}`;
const s = (id: string, count = 1) => ({ id: mc(id), count });

export interface NamedSetup {
  id: string;
  name: string;
  description: string;
  setup: SetupSnapshot;
}

/** Reusable starting setups for challenges and the builder. */
export const PRESETS_1_16_1: NamedSetup[] = [
  {
    id: "empty_inventory",
    name: "Empty Inventory",
    description: "A clean player inventory with a 2x2 crafting grid.",
    setup: { layoutId: "inventory" },
  },
  {
    id: "empty_table",
    name: "Empty Crafting Table",
    description: "An open crafting table with an empty inventory.",
    setup: { layoutId: "crafting_table" },
  },
  {
    id: "post_bt_iron",
    name: "Post-BT Iron Craft",
    description: "Typical inventory after looting buried treasure: iron, planks, sticks.",
    setup: {
      layoutId: "crafting_table",
      hotbar: [s("iron_ingot", 9), s("oak_planks", 12), s("stick", 8), s("cobblestone", 16), s("flint", 1), null, null, null, null],
    },
  },
  {
    id: "boat_bucket_doors",
    name: "Boat + Bucket + Doors",
    description: "Materials staged to craft a boat, a bucket, and doors as fast as possible.",
    setup: {
      layoutId: "crafting_table",
      hotbar: [s("oak_planks", 16), s("iron_ingot", 4), null, null, null, null, null, null, null],
    },
  },
  {
    id: "full_iron",
    name: "Full Iron Bench",
    description: "A stockpile of iron and wood for tool-crafting drills.",
    setup: {
      layoutId: "crafting_table",
      hotbar: [s("iron_ingot", 32), s("oak_planks", 32), s("stick", 16), s("cobblestone", 32), null, null, null, null, null],
    },
  },
  {
    id: "smelt_iron",
    name: "Smelt Iron",
    description: "A furnace staged with raw iron and fuel.",
    setup: {
      layoutId: "furnace",
      furnaceIn: s("raw_iron", 8),
      furnaceFuel: s("coal", 4),
    },
  },
  {
    id: "sort_chest",
    name: "Messy Chest (sort drill)",
    description: "A scattered chest to practice inventory sorting and clean-up.",
    setup: {
      layoutId: "chest",
      container: [
        s("oak_planks", 12), null, s("iron_ingot", 3), null, s("oak_planks", 30), null,
        s("cobblestone", 9), null, s("iron_ingot", 5), null, s("cobblestone", 40), null,
        s("stick", 7), null, s("coal", 11), null, s("oak_log", 6), null,
      ],
    },
  },
];
