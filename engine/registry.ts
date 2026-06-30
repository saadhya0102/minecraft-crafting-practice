import type { ItemId, ItemStack } from "./types";

export interface ItemDef {
  id: ItemId;
  /** Human-friendly display name. */
  name: string;
  /** Max stack size (64, 16, or 1). */
  maxStack: number;
  /** Creative-tab style category for the builder palette. */
  category?: string;
  /** True for tools/weapons (used for durability + non-stacking). */
  tool?: boolean;
  /** Optional base color for placeholder sprite rendering (hex). */
  color?: string;
  /** Optional secondary color used to draw a simple icon overlay. */
  accent?: string;
  /** Optional texture key into the (open-license) atlas. */
  texture?: string;
}

/** An ingredient is a single item id or an "any-of" list (a tag, pre-expanded). */
export type Ingredient = ItemId | ItemId[];

export interface ShapedRecipe {
  type: "shaped";
  /** Up to 3 rows of up to 3 chars; spaces are empty. */
  pattern: string[];
  key: Record<string, Ingredient>;
  result: ItemStack;
  /** If false, the mirrored variant is NOT accepted. Defaults to true. */
  mirror?: boolean;
}

export interface ShapelessRecipe {
  type: "shapeless";
  ingredients: Ingredient[];
  result: ItemStack;
}

export type Recipe = ShapedRecipe | ShapelessRecipe;

export interface RegistryData {
  version: string;
  items: ItemDef[];
  recipes: Recipe[];
  /** input item id -> smelting result stack. */
  smelting: Record<ItemId, ItemStack>;
}

export class Registry {
  readonly version: string;
  private itemMap: Map<ItemId, ItemDef>;
  readonly recipes: Recipe[];
  private smeltMap: Map<ItemId, ItemStack>;

  constructor(data: RegistryData) {
    this.version = data.version;
    this.itemMap = new Map(data.items.map((i) => [i.id, i]));
    this.recipes = data.recipes;
    this.smeltMap = new Map(Object.entries(data.smelting));
  }

  has(id: ItemId): boolean {
    return this.itemMap.has(id);
  }

  item(id: ItemId): ItemDef | undefined {
    return this.itemMap.get(id);
  }

  name(id: ItemId): string {
    return this.itemMap.get(id)?.name ?? prettify(id);
  }

  maxStack(id: ItemId): number {
    return this.itemMap.get(id)?.maxStack ?? 64;
  }

  isTool(id: ItemId): boolean {
    return this.itemMap.get(id)?.tool ?? false;
  }

  smeltResultOf(id: ItemId): ItemStack | undefined {
    const r = this.smeltMap.get(id);
    return r ? { ...r } : undefined;
  }

  allItems(): ItemDef[] {
    return [...this.itemMap.values()];
  }
}

export function prettify(id: ItemId): string {
  const bare = id.includes(":") ? id.split(":")[1] : id;
  return bare
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}
