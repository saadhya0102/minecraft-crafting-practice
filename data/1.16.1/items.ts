import type { ItemDef } from "../../engine/registry";

// Colors are used for placeholder sprite rendering until an open-license
// (Faithful-style) texture atlas is dropped into /assets.
const C = {
  wood: "#9c7a4d",
  woodDark: "#7a5e38",
  leaf: "#4a7a32",
  stone: "#8a8a8a",
  dirt: "#7a5a3a",
  grass: "#6aa84f",
  iron: "#d8d8d8",
  gold: "#f1d33a",
  diamond: "#3fd6c8",
  netherite: "#4a4248",
  redstone: "#c0322b",
  water: "#3a6ff0",
  lava: "#e2640f",
  cloth: "#dddddd",
  glass: "#bfe6f0",
  obsidian: "#1c1330",
  ender: "#147a6c",
  flesh: "#c97c5a",
  bone: "#e9e4cf",
};

export const WOODS = [
  { key: "oak", color: "#b08a52" },
  { key: "spruce", color: "#6e5331" },
  { key: "birch", color: "#d8c79a" },
  { key: "jungle", color: "#a87b53" },
  { key: "acacia", color: "#b5621f" },
  { key: "dark_oak", color: "#4a341d" },
] as const;

export const TOOL_MATERIALS = [
  { key: "wooden", color: C.wood, dura: 59 },
  { key: "stone", color: C.stone, dura: 131 },
  { key: "iron", color: C.iron, dura: 250 },
  { key: "golden", color: C.gold, dura: 32 },
  { key: "diamond", color: C.diamond, dura: 1561 },
  { key: "netherite", color: C.netherite, dura: 2031 },
] as const;

const TOOL_TYPES = ["pickaxe", "axe", "shovel", "hoe", "sword"] as const;

function item(
  id: string,
  name: string,
  maxStack: number,
  category: string,
  color: string,
  accent?: string,
  tool = false,
): ItemDef {
  return { id: `minecraft:${id}`, name, maxStack, category, color, accent, tool };
}

const items: ItemDef[] = [];

// --- Wood sets -------------------------------------------------------------
for (const w of WOODS) {
  const name = (s: string) => `${cap(w.key)} ${s}`.replace(/_/g, " ");
  items.push(item(`${w.key}_log`, name("Log"), 64, "building", w.color, C.woodDark));
  items.push(item(`${w.key}_wood`, name("Wood"), 64, "building", w.color, C.woodDark));
  items.push(item(`${w.key}_planks`, name("Planks"), 64, "building", w.color));
  items.push(item(`${w.key}_slab`, name("Slab"), 64, "building", w.color));
  items.push(item(`${w.key}_stairs`, name("Stairs"), 64, "building", w.color));
  items.push(item(`${w.key}_fence`, name("Fence"), 64, "decoration", w.color));
  items.push(item(`${w.key}_door`, name("Door"), 64, "redstone", w.color, C.woodDark));
  items.push(item(`${w.key}_trapdoor`, name("Trapdoor"), 64, "redstone", w.color, C.woodDark));
  items.push(item(`${w.key}_boat`, name("Boat"), 1, "transportation", w.color, C.water));
  items.push(item(`${w.key}_sapling`, name("Sapling"), 64, "decoration", C.leaf, w.color));
  items.push(item(`${w.key}_leaves`, name("Leaves"), 64, "decoration", C.leaf));
  items.push(item(`${w.key}_button`, name("Button"), 64, "redstone", w.color));
  items.push(item(`${w.key}_pressure_plate`, name("Pressure Plate"), 64, "redstone", w.color));
  items.push(item(`${w.key}_sign`, name("Sign"), 16, "decoration", w.color, C.woodDark));
}

// --- Tools & weapons -------------------------------------------------------
for (const m of TOOL_MATERIALS) {
  for (const t of TOOL_TYPES) {
    items.push({
      id: `minecraft:${m.key}_${t}`,
      name: `${cap(m.key)} ${cap(t)}`,
      maxStack: 1,
      category: t === "sword" ? "combat" : "tools",
      color: m.color,
      accent: t === "sword" ? "#c8c8c8" : C.wood,
      tool: true,
    });
  }
}
// Armor
for (const m of [
  { key: "leather", color: C.flesh },
  { key: "iron", color: C.iron },
  { key: "golden", color: C.gold },
  { key: "diamond", color: C.diamond },
  { key: "netherite", color: C.netherite },
]) {
  for (const piece of ["helmet", "chestplate", "leggings", "boots"]) {
    items.push({
      id: `minecraft:${m.key}_${piece}`,
      name: `${cap(m.key)} ${cap(piece)}`,
      maxStack: 1,
      category: "combat",
      color: m.color,
      tool: true,
    });
  }
}

// --- Stones / building blocks ---------------------------------------------
const buildings: [string, string, string][] = [
  ["stone", "Stone", C.stone],
  ["cobblestone", "Cobblestone", "#7f7f7f"],
  ["smooth_stone", "Smooth Stone", "#9a9a9a"],
  ["stone_bricks", "Stone Bricks", "#828282"],
  ["granite", "Granite", "#9b6a55"],
  ["diorite", "Diorite", "#cfcfcf"],
  ["andesite", "Andesite", "#8d8f8d"],
  ["deepslate", "Deepslate", "#4b4b50"],
  ["dirt", "Dirt", C.dirt],
  ["grass_block", "Grass Block", C.grass],
  ["sand", "Sand", "#dbcd8f"],
  ["red_sand", "Red Sand", "#bd6a2e"],
  ["gravel", "Gravel", "#8a827d"],
  ["sandstone", "Sandstone", "#d8cd9a"],
  ["netherrack", "Netherrack", "#702f2f"],
  ["soul_sand", "Soul Sand", "#564433"],
  ["obsidian", "Obsidian", C.obsidian],
  ["glass", "Glass", C.glass],
  ["bricks", "Bricks", "#9a4f3f"],
  ["bookshelf", "Bookshelf", C.wood],
  ["crafting_table", "Crafting Table", "#8a623b"],
  ["furnace", "Furnace", "#6f6f6f"],
  ["chest", "Chest", "#8a623b"],
  ["ender_chest", "Ender Chest", C.obsidian],
  ["tnt", "TNT", C.redstone],
  ["glowstone", "Glowstone", "#e7c46b"],
  ["pumpkin", "Pumpkin", "#cf7518"],
  ["hay_block", "Hay Block", "#c2a32a"],
  ["clay", "Clay", "#a3a8b8"],
  ["bedrock", "Bedrock", "#555555"],
  ["cobweb", "Cobweb", "#e7eef2"],
  ["ice", "Ice", "#9ac3f0"],
  ["snow_block", "Snow Block", "#f5fbff"],
  ["nether_bricks", "Nether Bricks", "#34191c"],
  ["end_stone", "End Stone", "#e0e6a6"],
  ["lapis_block", "Lapis Block", "#1f4ca5"],
  ["iron_block", "Block of Iron", C.iron],
  ["gold_block", "Block of Gold", C.gold],
  ["diamond_block", "Block of Diamond", C.diamond],
  ["emerald_block", "Block of Emerald", "#2ec27e"],
  ["redstone_block", "Block of Redstone", C.redstone],
];
for (const [id, name, color] of buildings) items.push(item(id, name, 64, "building", color));

// Wool (16 colors)
const WOOL_COLORS: [string, string][] = [
  ["white", "#eaeaea"], ["orange", "#e3711f"], ["magenta", "#bf4cc7"], ["light_blue", "#3aafd9"],
  ["yellow", "#f1c52c"], ["lime", "#6bc62a"], ["pink", "#ee8dac"], ["gray", "#3e4347"],
  ["light_gray", "#8e8e86"], ["cyan", "#158a98"], ["purple", "#7d29b3"], ["blue", "#2d36a6"],
  ["brown", "#6a4327"], ["green", "#4f6a1f"], ["red", "#a32c28"], ["black", "#1d1d20"],
];
for (const [c, color] of WOOL_COLORS) items.push(item(`${c}_wool`, `${cap(c)} Wool`, 64, "decoration", color));
for (const [c, color] of WOOL_COLORS) items.push(item(`${c}_concrete`, `${cap(c)} Concrete`, 64, "building", color));
for (const [c, color] of WOOL_COLORS) items.push(item(`${c}_dye`, `${cap(c)} Dye`, 64, "materials", color));

// --- Ores / raw materials --------------------------------------------------
const materials: [string, string, number, string, string?][] = [
  ["iron_ore", "Iron Ore", 64, "#b7866b"],
  ["gold_ore", "Gold Ore", 64, "#c9a34a"],
  ["diamond_ore", "Diamond Ore", 64, "#5fb0a8"],
  ["coal_ore", "Coal Ore", 64, "#3a3a3a"],
  ["redstone_ore", "Redstone Ore", 64, "#9a4040"],
  ["lapis_ore", "Lapis Ore", 64, "#4a6a9a"],
  ["emerald_ore", "Emerald Ore", 64, "#3a8a5a"],
  ["nether_quartz_ore", "Nether Quartz Ore", 64, "#7a4a4a"],
  ["ancient_debris", "Ancient Debris", 64, "#6a4a3a"],
  ["raw_iron", "Raw Iron", 64, "#c98f6b"],
  ["raw_gold", "Raw Gold", 64, "#d9b24a"],
  ["iron_ingot", "Iron Ingot", 64, C.iron],
  ["gold_ingot", "Gold Ingot", 64, C.gold],
  ["netherite_ingot", "Netherite Ingot", 64, C.netherite],
  ["netherite_scrap", "Netherite Scrap", 64, "#7a5a4a"],
  ["copper_ingot", "Copper Ingot", 64, "#c46a3a"],
  ["diamond", "Diamond", 64, C.diamond],
  ["emerald", "Emerald", 64, "#2ec27e"],
  ["coal", "Coal", 64, "#2a2a2a"],
  ["charcoal", "Charcoal", 64, "#3a342f"],
  ["lapis_lazuli", "Lapis Lazuli", 64, "#1f4ca5"],
  ["redstone", "Redstone Dust", 64, C.redstone],
  ["quartz", "Nether Quartz", 64, "#e7e0d4"],
  ["stick", "Stick", 64, C.wood],
  ["flint", "Flint", 64, "#3a3a40"],
  ["string", "String", 64, "#e7e7e7"],
  ["leather", "Leather", 64, "#9a6a3a"],
  ["feather", "Feather", 64, "#f0f0f0"],
  ["gunpowder", "Gunpowder", 64, "#5a5a5a"],
  ["paper", "Paper", 64, "#f4f4ee"],
  ["book", "Book", 64, "#8a5a3a", C.cloth],
  ["bone", "Bone", 64, C.bone],
  ["bone_meal", "Bone Meal", 64, "#e9e4cf"],
  ["slime_ball", "Slimeball", 64, "#7ac46a"],
  ["blaze_rod", "Blaze Rod", 64, "#e2a020"],
  ["blaze_powder", "Blaze Powder", 64, "#e2820f"],
  ["ender_pearl", "Ender Pearl", 16, C.ender],
  ["ender_eye", "Eye of Ender", 64, "#3ab09a"],
  ["ghast_tear", "Ghast Tear", 64, "#d8eef0"],
  ["magma_cream", "Magma Cream", 64, "#b5631f"],
  ["nether_wart", "Nether Wart", 64, "#7a1f2a"],
  ["glowstone_dust", "Glowstone Dust", 64, "#e7c46b"],
  ["clay_ball", "Clay Ball", 64, "#a3a8b8"],
  ["brick", "Brick", 64, "#9a4f3f"],
  ["sugar", "Sugar", 64, "#f6f6f6"],
  ["egg", "Egg", 16, "#efe6c8"],
  ["snowball", "Snowball", 16, "#f5fbff"],
];
for (const [id, name, max, color, accent] of materials) items.push(item(id, name, max, "materials", color, accent));

// --- Transportation / utility --------------------------------------------
const utility: [string, string, number, string, string, string?][] = [
  ["bucket", "Bucket", 16, "transportation", C.iron],
  ["water_bucket", "Water Bucket", 1, "transportation", C.iron, C.water],
  ["lava_bucket", "Lava Bucket", 1, "transportation", C.iron, C.lava],
  ["milk_bucket", "Milk Bucket", 1, "transportation", C.iron, "#f4f4f4"],
  ["flint_and_steel", "Flint and Steel", 1, "tools", C.iron, C.lava],
  ["shears", "Shears", 1, "tools", C.iron],
  ["fishing_rod", "Fishing Rod", 1, "tools", C.wood, "#dddddd"],
  ["compass", "Compass", 64, "tools", C.iron, C.redstone],
  ["clock", "Clock", 64, "tools", C.gold],
  ["bow", "Bow", 1, "combat", C.wood],
  ["arrow", "Arrow", 64, "combat", "#cccccc", C.wood],
  ["shield", "Shield", 1, "combat", C.wood, C.iron],
  ["torch", "Torch", 64, "decoration", "#e7c46b", C.wood],
  ["ladder", "Ladder", 64, "decoration", C.wood],
  ["bed", "Bed", 1, "decoration", "#c0322b", C.wood],
  ["minecart", "Minecart", 1, "transportation", C.iron],
  ["rail", "Rail", 64, "transportation", "#8a7a5a"],
  ["lever", "Lever", 64, "redstone", C.wood],
  ["redstone_torch", "Redstone Torch", 64, "redstone", C.redstone],
  ["repeater", "Redstone Repeater", 64, "redstone", "#9a9a9a", C.redstone],
  ["comparator", "Redstone Comparator", 64, "redstone", "#9a9a9a", C.redstone],
  ["piston", "Piston", 64, "redstone", "#9c8456"],
  ["sticky_piston", "Sticky Piston", 64, "redstone", "#7aa84f"],
  ["observer", "Observer", 64, "redstone", "#6f6f6f"],
  ["hopper", "Hopper", 64, "redstone", "#4a4a4a"],
  ["dispenser", "Dispenser", 64, "redstone", "#6f6f6f"],
  ["dropper", "Dropper", 64, "redstone", "#6f6f6f"],
  ["water", "Water", 64, "misc", C.water],
  ["lava", "Lava", 64, "misc", C.lava],
];
for (const [id, name, max, cat, color, accent] of utility) items.push(item(id, name, max, cat, color, accent));

// --- Food ------------------------------------------------------------------
const foods: [string, string, number, string][] = [
  ["apple", "Apple", 64, "#c0322b"],
  ["golden_apple", "Golden Apple", 64, C.gold],
  ["enchanted_golden_apple", "Enchanted Golden Apple", 64, "#f1d33a"],
  ["bread", "Bread", 64, "#c79a4d"],
  ["wheat", "Wheat", 64, "#d8bf4a"],
  ["wheat_seeds", "Wheat Seeds", 64, "#6aa84f"],
  ["carrot", "Carrot", 64, "#e3711f"],
  ["potato", "Potato", 64, "#d8b06b"],
  ["baked_potato", "Baked Potato", 64, "#c79a4d"],
  ["beef", "Raw Beef", 64, "#c0504d"],
  ["cooked_beef", "Steak", 64, "#8a4a2a"],
  ["porkchop", "Raw Porkchop", 64, "#e6a6a0"],
  ["cooked_porkchop", "Cooked Porkchop", 64, "#9a5a3a"],
  ["chicken", "Raw Chicken", 64, "#e6cfa0"],
  ["cooked_chicken", "Cooked Chicken", 64, "#b58a4a"],
  ["cod", "Raw Cod", 64, "#b9a06b"],
  ["cooked_cod", "Cooked Cod", 64, "#c79a4d"],
  ["salmon", "Raw Salmon", 64, "#c0504d"],
  ["mushroom_stew", "Mushroom Stew", 1, "#9a6a3a"],
  ["cookie", "Cookie", 64, "#9a6a3a"],
  ["melon_slice", "Melon Slice", 64, "#3a8a3a"],
  ["sugar_cane", "Sugar Cane", 64, "#6aa84f"],
  ["sweet_berries", "Sweet Berries", 64, "#a32c28"],
];
for (const [id, name, max, color] of foods) items.push(item(id, name, max, "food", color));

// --- Misc / brewing --------------------------------------------------------
const misc: [string, string, number, string, string][] = [
  ["heart_of_the_sea", "Heart of the Sea", 64, "materials", "#3aafd9"],
  ["nautilus_shell", "Nautilus Shell", 64, "materials", "#dcd0b4"],
  ["prismarine_shard", "Prismarine Shard", 64, "materials", "#7ec8b4"],
  ["prismarine_crystals", "Prismarine Crystals", 64, "materials", "#bfeede"],
  ["scute", "Scute", 64, "materials", "#5aa84f"],
  ["trident", "Trident", 1, "combat", "#3a8a8a"],
  ["totem_of_undying", "Totem of Undying", 1, "combat", "#e2c84a"],
  ["potion", "Potion", 1, "brewing", "#7a3aa8"],
  ["splash_potion", "Splash Potion", 1, "brewing", "#7a3aa8"],
  ["glass_bottle", "Glass Bottle", 64, "brewing", C.glass],
  ["brewing_stand", "Brewing Stand", 64, "brewing", "#9a9a9a"],
  ["cauldron", "Cauldron", 64, "brewing", "#4a4a4a"],
  ["fermented_spider_eye", "Fermented Spider Eye", 64, "brewing", "#5a3a5a"],
  ["spider_eye", "Spider Eye", 64, "brewing", "#7a2a2a"],
  ["fire_charge", "Fire Charge", 64, "misc", "#e2640f"],
  ["name_tag", "Name Tag", 64, "misc", "#d8cd9a"],
  ["lead", "Lead", 64, "misc", "#9a7a5a"],
  ["map", "Map", 64, "misc", "#f4f4ee"],
  ["experience_bottle", "Bottle o' Enchanting", 64, "misc", "#7ac46a"],
];
for (const [id, name, max, cat, color] of misc) items.push(item(id, name, max, cat, color));

function cap(s: string): string {
  return s
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export const ITEMS_1_16_1: ItemDef[] = items;

export const CATEGORIES = [
  "building",
  "decoration",
  "redstone",
  "transportation",
  "materials",
  "food",
  "tools",
  "combat",
  "brewing",
  "misc",
] as const;
