import type { ItemId, ItemStack } from "./types";
import type { Ingredient, Recipe, ShapedRecipe, ShapelessRecipe } from "./registry";

export function ingredientMatches(ing: Ingredient, id: ItemId | null): boolean {
  if (id === null) return false;
  return Array.isArray(ing) ? ing.includes(id) : ing === id;
}

/** A 2D grid of item ids (row-major). null = empty cell. */
export type Grid = (ItemId | null)[][];

interface BBox {
  top: number;
  left: number;
  rows: number;
  cols: number;
  cells: (ItemId | null)[][];
}

function trim(grid: Grid): BBox | null {
  let top = Infinity;
  let left = Infinity;
  let bottom = -1;
  let right = -1;
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) {
        top = Math.min(top, r);
        left = Math.min(left, c);
        bottom = Math.max(bottom, r);
        right = Math.max(right, c);
      }
    }
  }
  if (bottom === -1) return null; // empty grid
  const rows = bottom - top + 1;
  const cols = right - left + 1;
  const cells: (ItemId | null)[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: (ItemId | null)[] = [];
    for (let c = 0; c < cols; c++) row.push(grid[top + r][left + c]);
    cells.push(row);
  }
  return { top, left, rows, cols, cells };
}

function patternToGrid(recipe: ShapedRecipe): {
  rows: number;
  cols: number;
  cells: (Ingredient | null)[][];
} {
  const rows = recipe.pattern.length;
  const cols = Math.max(...recipe.pattern.map((p) => p.length));
  const cells: (Ingredient | null)[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: (Ingredient | null)[] = [];
    for (let c = 0; c < cols; c++) {
      const ch = recipe.pattern[r][c] ?? " ";
      row.push(ch === " " ? null : recipe.key[ch] ?? null);
    }
    cells.push(row);
  }
  // Trim pattern bounding box too (so " X "/"X" etc. compare equal after trim).
  const grid: Grid = cells.map((row) => row.map(() => null));
  // We only need dims + cells for comparison; reuse trim by mapping to presence.
  let top = Infinity,
    left = Infinity,
    bottom = -1,
    right = -1;
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (cells[r][c] !== null) {
        top = Math.min(top, r);
        left = Math.min(left, c);
        bottom = Math.max(bottom, r);
        right = Math.max(right, c);
      }
  void grid;
  if (bottom === -1) return { rows: 0, cols: 0, cells: [] };
  const tRows = bottom - top + 1;
  const tCols = right - left + 1;
  const trimmed: (Ingredient | null)[][] = [];
  for (let r = 0; r < tRows; r++) {
    const row: (Ingredient | null)[] = [];
    for (let c = 0; c < tCols; c++) row.push(cells[top + r][left + c]);
    trimmed.push(row);
  }
  return { rows: tRows, cols: tCols, cells: trimmed };
}

function matchShaped(recipe: ShapedRecipe, box: BBox): boolean {
  const pat = patternToGrid(recipe);
  if (pat.rows !== box.rows || pat.cols !== box.cols) return false;

  const compare = (mirror: boolean): boolean => {
    for (let r = 0; r < box.rows; r++) {
      for (let c = 0; c < box.cols; c++) {
        const pc = mirror ? box.cols - 1 - c : c;
        const ing = pat.cells[r][pc];
        const id = box.cells[r][c];
        if (ing === null) {
          if (id !== null) return false;
        } else if (!ingredientMatches(ing, id)) {
          return false;
        }
      }
    }
    return true;
  };

  if (compare(false)) return true;
  if (recipe.mirror !== false && pat.cols > 1) return compare(true);
  return false;
}

function matchShapeless(recipe: ShapelessRecipe, grid: Grid): boolean {
  const items: ItemId[] = [];
  for (const row of grid) for (const cell of row) if (cell !== null) items.push(cell);
  if (items.length !== recipe.ingredients.length) return false;

  // Backtracking bipartite match: each item assigned to a distinct ingredient.
  const used = new Array(recipe.ingredients.length).fill(false);
  const assign = (i: number): boolean => {
    if (i === items.length) return true;
    for (let j = 0; j < recipe.ingredients.length; j++) {
      if (!used[j] && ingredientMatches(recipe.ingredients[j], items[i])) {
        used[j] = true;
        if (assign(i + 1)) return true;
        used[j] = false;
      }
    }
    return false;
  };
  return assign(0);
}

/** Returns the crafting result stack for a grid, or null if nothing matches. */
export function matchRecipe(recipes: Recipe[], grid: Grid): ItemStack | null {
  const box = trim(grid);
  if (!box) return null;
  for (const recipe of recipes) {
    if (recipe.type === "shaped") {
      if (matchShaped(recipe, box)) return { ...recipe.result };
    } else if (matchShapeless(recipe, grid)) {
      return { ...recipe.result };
    }
  }
  return null;
}
