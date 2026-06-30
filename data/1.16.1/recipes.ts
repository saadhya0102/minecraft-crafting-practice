import type { Recipe } from "../../engine/registry";
import { WOODS } from "./items";

const mc = (s: string) => `minecraft:${s}`;

// --- Tags (pre-expanded "any-of" ingredient lists) ------------------------
export const TAG_PLANKS = WOODS.map((w) => mc(`${w.key}_planks`));
export const TAG_LOGS = WOODS.flatMap((w) => [mc(`${w.key}_log`), mc(`${w.key}_wood`)]);

const recipes: Recipe[] = [];

// Planks from logs/wood (each wood type, shapeless).
for (const w of WOODS) {
  recipes.push({ type: "shapeless", ingredients: [mc(`${w.key}_log`)], result: { id: mc(`${w.key}_planks`), count: 4 } });
  recipes.push({ type: "shapeless", ingredients: [mc(`${w.key}_wood`)], result: { id: mc(`${w.key}_planks`), count: 4 } });
}

// Sticks (any planks).
recipes.push({
  type: "shaped",
  pattern: ["#", "#"],
  key: { "#": TAG_PLANKS },
  result: { id: mc("stick"), count: 4 },
});

// Crafting table.
recipes.push({
  type: "shaped",
  pattern: ["##", "##"],
  key: { "#": TAG_PLANKS },
  result: { id: mc("crafting_table"), count: 1 },
});

// Chest.
recipes.push({
  type: "shaped",
  pattern: ["###", "# #", "###"],
  key: { "#": TAG_PLANKS },
  result: { id: mc("chest"), count: 1 },
});

// Furnace.
recipes.push({
  type: "shaped",
  pattern: ["###", "# #", "###"],
  key: { "#": mc("cobblestone") },
  result: { id: mc("furnace"), count: 1 },
});

// Per-wood doors and boats.
for (const w of WOODS) {
  recipes.push({
    type: "shaped",
    pattern: ["##", "##", "##"],
    key: { "#": mc(`${w.key}_planks`) },
    result: { id: mc(`${w.key}_door`), count: 3 },
  });
  recipes.push({
    type: "shaped",
    pattern: ["# #", "###"],
    key: { "#": mc(`${w.key}_planks`) },
    result: { id: mc(`${w.key}_boat`), count: 1 },
  });
  recipes.push({
    type: "shaped",
    pattern: ["##", "##"],
    key: { "#": mc(`${w.key}_log`) },
    result: { id: mc(`${w.key}_wood`), count: 3 },
  });
}

// Iron / utility scenario items.
recipes.push({
  type: "shaped",
  pattern: ["# #", " # "],
  key: { "#": mc("iron_ingot") },
  result: { id: mc("bucket"), count: 1 },
});
recipes.push({
  type: "shaped",
  pattern: ["#", "/"],
  key: { "#": mc("iron_ingot"), "/": mc("flint") },
  result: { id: mc("flint_and_steel"), count: 1 },
});
recipes.push({
  type: "shaped",
  pattern: ["#", "#"],
  key: { "#": mc("iron_ingot") },
  result: { id: mc("shears"), count: 1 },
});

// Storage block <-> ingot (one direction to avoid recipe loops in preview).
recipes.push({
  type: "shaped",
  pattern: ["###", "###", "###"],
  key: { "#": mc("iron_ingot") },
  result: { id: mc("iron_block"), count: 1 },
});

// Torches.
recipes.push({
  type: "shaped",
  pattern: ["C", "S"],
  key: { C: [mc("coal"), mc("charcoal")], S: mc("stick") },
  result: { id: mc("torch"), count: 4 },
});

// Bread.
recipes.push({
  type: "shaped",
  pattern: ["###"],
  key: { "#": mc("wheat") },
  result: { id: mc("bread"), count: 1 },
});

// TNT.
recipes.push({
  type: "shaped",
  pattern: ["GSG", "SGS", "GSG"],
  key: { G: mc("gunpowder"), S: mc("sand") },
  result: { id: mc("tnt"), count: 1 },
});

// Bow & arrow.
recipes.push({
  type: "shaped",
  pattern: [" /S", "/ S", " /S"],
  key: { "/": mc("string"), S: mc("stick") },
  result: { id: mc("bow"), count: 1 },
});
recipes.push({
  type: "shaped",
  pattern: ["F", "S", "P"],
  key: { F: mc("flint"), S: mc("stick"), P: mc("feather") },
  result: { id: mc("arrow"), count: 4 },
});

// --- Tools (wooden / stone / iron / golden / diamond) ----------------------
const TOOL_MAT: Record<string, string | string[]> = {
  wooden: TAG_PLANKS,
  stone: mc("cobblestone"),
  iron: mc("iron_ingot"),
  golden: mc("gold_ingot"),
  diamond: mc("diamond"),
};
const STICK = mc("stick");

for (const [mat, ing] of Object.entries(TOOL_MAT)) {
  recipes.push({ type: "shaped", pattern: ["MMM", " S ", " S "], key: { M: ing, S: STICK }, result: { id: mc(`${mat}_pickaxe`), count: 1 } });
  recipes.push({ type: "shaped", pattern: ["MM", "MS", " S"], key: { M: ing, S: STICK }, result: { id: mc(`${mat}_axe`), count: 1 } });
  recipes.push({ type: "shaped", pattern: ["M", "S", "S"], key: { M: ing, S: STICK }, result: { id: mc(`${mat}_shovel`), count: 1 } });
  recipes.push({ type: "shaped", pattern: ["MM", " S", " S"], key: { M: ing, S: STICK }, result: { id: mc(`${mat}_hoe`), count: 1 } });
  recipes.push({ type: "shaped", pattern: ["M", "M", "S"], key: { M: ing, S: STICK }, result: { id: mc(`${mat}_sword`), count: 1 } });
}

export const RECIPES_1_16_1: Recipe[] = recipes;
