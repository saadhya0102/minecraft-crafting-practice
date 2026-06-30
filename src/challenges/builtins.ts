import type { Challenge } from "./types";
import { LOOT_TABLES } from "../../data/1.16.1/loot";

const mc = (s: string) => `minecraft:${s}`;
const stack = (id: string, count = 1) => ({ id: mc(id), count });

const btLoot = LOOT_TABLES.find((l) => l.id === "buried_treasure_standard")!;

export const BUILTIN_CHALLENGES: Challenge[] = [
  {
    id: "bt_loot",
    name: "Buried Treasure Loot",
    description: "Empty the buried-treasure chest into your inventory as fast as possible.",
    version: "1.16.1",
    layoutId: "chest",
    setup: { layoutId: "chest", container: btLoot.items },
    goal: { kind: "emptyContainer" },
    scoring: "time_actions",
  },
  {
    id: "iron_tools",
    name: "Iron Tools",
    description: "Craft an iron pickaxe, sword, and shovel from staged materials.",
    version: "1.16.1",
    layoutId: "crafting_table",
    setup: {
      layoutId: "crafting_table",
      // Needs 6 iron + 5 sticks; staged with a small margin so a misplace is recoverable.
      hotbar: [stack("iron_ingot", 9), stack("stick", 8), null, null, null, null, null, null, null],
    },
    goal: {
      kind: "haveItems",
      items: [{ id: mc("iron_pickaxe") }, { id: mc("iron_sword") }, { id: mc("iron_shovel") }],
    },
    splits: [
      { id: "pick", name: "Pickaxe", req: { id: mc("iron_pickaxe") } },
      { id: "sword", name: "Sword", req: { id: mc("iron_sword") } },
      { id: "shovel", name: "Shovel", req: { id: mc("iron_shovel") } },
    ],
    scoring: "time",
  },
  {
    id: "boat_bucket_doors",
    name: "Boat + Bucket + Doors",
    description: "The canonical overworld craft set: one boat, one bucket, and three doors.",
    version: "1.16.1",
    layoutId: "crafting_table",
    setup: {
      layoutId: "crafting_table",
      // Needs 11 planks + 3 iron; staged with a small margin.
      hotbar: [stack("oak_planks", 16), stack("iron_ingot", 4), null, null, null, null, null, null, null],
    },
    goal: {
      kind: "haveItems",
      items: [
        { id: mc("oak_boat"), count: 1 },
        { id: mc("bucket"), count: 1 },
        { id: mc("oak_door"), count: 3 },
      ],
    },
    splits: [
      { id: "boat", name: "Boat", req: { id: mc("oak_boat") } },
      { id: "bucket", name: "Bucket", req: { id: mc("bucket") } },
      { id: "doors", name: "Doors x3", req: { id: mc("oak_door"), count: 3 } },
    ],
    scoring: "time",
  },
  {
    id: "inventory_sort",
    name: "Inventory Sort",
    description: "Consolidate the messy chest into sorted stacks in the exact target order.",
    version: "1.16.1",
    layoutId: "chest",
    setup: {
      layoutId: "chest",
      container: [
        stack("oak_planks", 12), null, stack("iron_ingot", 3), null, stack("oak_planks", 30), null,
        stack("cobblestone", 9), null, stack("iron_ingot", 5), null, stack("cobblestone", 40), null,
        stack("stick", 7), null, stack("coal", 11), null, stack("oak_log", 6), null,
      ],
    },
    goal: {
      kind: "matchLayout",
      target: {
        layoutId: "chest",
        container: [
          stack("oak_planks", 42), stack("cobblestone", 49), stack("iron_ingot", 8),
          stack("stick", 7), stack("coal", 11), stack("oak_log", 6),
          null, null, null, null, null, null, null, null, null, null, null, null,
        ],
      },
    },
    scoring: "time_actions",
  },
  {
    id: "full_overworld",
    name: "Full Overworld Craft",
    description: "From looted materials, craft tools, a boat, a bucket, doors, and flint & steel.",
    version: "1.16.1",
    layoutId: "crafting_table",
    setup: {
      layoutId: "crafting_table",
      // Needs 9 iron + 11 planks + 3 sticks + 1 flint; staged with a margin.
      hotbar: [stack("iron_ingot", 12), stack("oak_planks", 32), stack("stick", 8), stack("flint", 2), null, null, null, null, null],
    },
    goal: {
      kind: "haveItems",
      items: [
        { id: mc("iron_pickaxe") },
        { id: mc("iron_sword") },
        { id: mc("oak_boat") },
        { id: mc("bucket") },
        { id: mc("oak_door"), count: 3 },
        { id: mc("flint_and_steel") },
      ],
    },
    splits: [
      { id: "pick", name: "Pickaxe", req: { id: mc("iron_pickaxe") } },
      { id: "sword", name: "Sword", req: { id: mc("iron_sword") } },
      { id: "boat", name: "Boat", req: { id: mc("oak_boat") } },
      { id: "bucket", name: "Bucket", req: { id: mc("bucket") } },
      { id: "doors", name: "Doors x3", req: { id: mc("oak_door"), count: 3 } },
      { id: "fs", name: "Flint & Steel", req: { id: mc("flint_and_steel") } },
    ],
    scoring: "time",
  },
];

export function challengeById(id: string): Challenge | undefined {
  return BUILTIN_CHALLENGES.find((c) => c.id === id);
}
