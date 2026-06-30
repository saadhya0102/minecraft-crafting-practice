import type { ItemDef } from "../../engine/registry";

// Original, low-res (16x16) pixel-art icons drawn in a Minecraft-ish style.
// Shapes are hand-authored here (not Mojang assets); item palette comes from
// each ItemDef's color/accent. One renderer feeds both the WebGL GUI and the
// DOM tiles so they always match.

export const ICON = 16;

type Ctx = CanvasRenderingContext2D;

function clampByte(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}
function shade(hex: string | undefined, amt: number): string {
  const h = (hex ?? "#9a9a9a").replace("#", "");
  if (h.length < 6) return hex ?? "#9a9a9a";
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return "#9a9a9a";
  const f = (c: number) => clampByte(c + 255 * amt);
  return `#${[f(r), f(g), f(b)].map((c) => c.toString(16).padStart(2, "0")).join("")}`;
}

function p(ctx: Ctx, x: number, y: number, w: number, h: number, c: string): void {
  ctx.fillStyle = c;
  ctx.fillRect(x, y, w, h);
}

/** A blocky square with 4-edge bevel shading. */
function block(ctx: Ctx, base: string, accent?: string): void {
  p(ctx, 1, 1, 14, 14, base);
  p(ctx, 1, 1, 14, 2, shade(base, 0.22)); // top light
  p(ctx, 1, 1, 2, 14, shade(base, 0.12)); // left light
  p(ctx, 1, 13, 14, 2, shade(base, -0.26)); // bottom dark
  p(ctx, 13, 1, 2, 14, shade(base, -0.16)); // right dark
  // a little speckle so flat blocks read as textured
  p(ctx, 5, 6, 2, 2, shade(base, -0.12));
  p(ctx, 9, 9, 2, 2, shade(base, 0.1));
  if (accent) p(ctx, 6, 6, 4, 4, accent);
}

function ingot(ctx: Ctx, base: string): void {
  // parallelogram bar
  p(ctx, 4, 6, 9, 5, base);
  p(ctx, 5, 5, 8, 1, base);
  p(ctx, 3, 10, 9, 1, base);
  p(ctx, 4, 6, 9, 1, shade(base, 0.28)); // top highlight
  p(ctx, 3, 10, 9, 1, shade(base, -0.28)); // bottom shadow
}

function gem(ctx: Ctx, base: string): void {
  const L = shade(base, 0.3);
  const D = shade(base, -0.25);
  const rows: [number, number][] = [
    [7, 2],
    [6, 4],
    [5, 6],
    [4, 8],
    [5, 6],
    [6, 4],
    [7, 2],
  ];
  rows.forEach(([x, w], i) => p(ctx, x, 3 + i, w, 1, base));
  p(ctx, 6, 4, 2, 1, L);
  p(ctx, 5, 6, 2, 1, L);
  p(ctx, 7, 8, 3, 1, D);
}

function dust(ctx: Ctx, base: string): void {
  const pts: [number, number][] = [
    [3, 5], [6, 3], [9, 6], [12, 4], [5, 9], [8, 10], [11, 11], [4, 12], [7, 7], [10, 8],
  ];
  for (const [x, y] of pts) p(ctx, x, y, 2, 2, base);
}

function planks(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, base);
  const d = shade(base, -0.28);
  for (const y of [1, 5, 9, 13]) p(ctx, 1, y, 14, 1, d);
  p(ctx, 8, 1, 1, 4, d);
  p(ctx, 4, 5, 1, 4, d);
  p(ctx, 11, 9, 1, 4, d);
  p(ctx, 1, 1, 14, 1, shade(base, 0.18));
}

function log(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, base);
  const d = shade(base, -0.3);
  const l = shade(base, 0.18);
  for (const x of [3, 6, 9, 12]) p(ctx, x, 1, 1, 14, d);
  p(ctx, 4, 1, 1, 14, l);
  p(ctx, 1, 1, 2, 14, shade(base, 0.1));
  p(ctx, 13, 1, 2, 14, shade(base, -0.18));
}

function liquidBucket(ctx: Ctx, accent?: string): void {
  const iron = "#cfcfcf";
  p(ctx, 4, 5, 8, 8, iron);
  p(ctx, 4, 5, 8, 1, "#eaeaea");
  p(ctx, 4, 12, 8, 1, "#9a9a9a");
  p(ctx, 4, 5, 1, 8, "#e2e2e2");
  p(ctx, 11, 5, 1, 8, "#9a9a9a");
  // rim
  p(ctx, 3, 4, 10, 1, iron);
  if (accent) {
    p(ctx, 6, 7, 4, 4, accent);
    p(ctx, 6, 7, 4, 1, shade(accent, 0.25));
  }
}

function tool(ctx: Ctx, def: ItemDef): void {
  const base = def.color ?? "#cfcfcf";
  const wood = def.accent && def.accent !== "#c8c8c8" ? def.accent : "#9c7a4d";
  const id = def.id;
  const diag = (sx: number, sy: number, n: number, c: string) => {
    for (let i = 0; i < n; i++) p(ctx, sx + i, sy - i, 2, 2, c);
  };
  if (/_sword$/.test(id)) {
    p(ctx, 3, 11, 3, 3, wood);
    diag(4, 11, 8, base);
    p(ctx, 3, 10, 3, 1, shade(base, -0.2));
  } else if (/_pickaxe$/.test(id)) {
    p(ctx, 2, 4, 12, 2, base);
    p(ctx, 2, 3, 3, 1, base);
    p(ctx, 11, 3, 3, 1, base);
    diag(7, 13, 4, wood);
    p(ctx, 8, 5, 2, 9, wood);
  } else if (/_axe$/.test(id)) {
    p(ctx, 4, 3, 6, 7, base);
    p(ctx, 9, 4, 2, 4, base);
    p(ctx, 6, 8, 2, 7, wood);
  } else if (/_shovel$/.test(id)) {
    p(ctx, 6, 3, 5, 5, base);
    p(ctx, 6, 3, 5, 1, shade(base, 0.2));
    p(ctx, 8, 7, 2, 8, wood);
  } else if (/_helmet$|_chestplate$|_leggings$|_boots$/.test(id)) {
    p(ctx, 4, 4, 8, 9, base);
    p(ctx, 6, 4, 4, 2, base === "#dddddd" ? "#cfcfcf" : shade(base, -0.4)); // neck cut
    p(ctx, 4, 4, 8, 1, shade(base, 0.22));
    p(ctx, 4, 12, 8, 1, shade(base, -0.26));
  } else {
    // hoe / generic
    p(ctx, 4, 3, 8, 2, base);
    p(ctx, 4, 5, 2, 2, base);
    p(ctx, 8, 5, 2, 9, wood);
  }
}

function door(ctx: Ctx, base: string): void {
  p(ctx, 3, 1, 10, 14, base);
  p(ctx, 3, 1, 10, 1, shade(base, 0.18));
  p(ctx, 3, 1, 1, 14, shade(base, 0.12));
  p(ctx, 12, 1, 1, 14, shade(base, -0.22));
  const d = shade(base, -0.3);
  p(ctx, 5, 3, 6, 3, d);
  p(ctx, 5, 8, 6, 4, d);
  p(ctx, 10, 7, 1, 2, shade(base, 0.3)); // knob
}

function boat(ctx: Ctx, base: string): void {
  p(ctx, 2, 8, 12, 4, base);
  p(ctx, 3, 7, 10, 1, base);
  p(ctx, 1, 9, 1, 2, base);
  p(ctx, 14, 9, 1, 2, base);
  p(ctx, 2, 11, 12, 1, shade(base, -0.3));
  p(ctx, 3, 7, 10, 1, shade(base, 0.2));
  p(ctx, 6, 6, 4, 1, base); // seat
}

function food(ctx: Ctx, base: string): void {
  const rows: [number, number][] = [
    [6, 4], [4, 8], [3, 10], [3, 10], [3, 10], [4, 8], [5, 6],
  ];
  rows.forEach(([x, w], i) => p(ctx, x, 4 + i, w, 1, base));
  p(ctx, 5, 5, 2, 2, shade(base, 0.35));
  p(ctx, 4, 9, 8, 1, shade(base, -0.2));
}

function stick(ctx: Ctx, base: string): void {
  const c = base ?? "#9c7a4d";
  for (let i = 0; i < 6; i++) p(ctx, 4 + i, 12 - i * 1.5, 2, 2, c);
  for (let i = 0; i < 4; i++) p(ctx, 9 + i, 6 - i, 2, 2, c);
}

function bottle(ctx: Ctx, base: string): void {
  p(ctx, 7, 2, 2, 3, "#b08a52"); // cork/neck
  p(ctx, 5, 5, 6, 9, "#bfe6f0"); // glass
  p(ctx, 6, 8, 4, 5, base); // liquid
  p(ctx, 5, 5, 1, 9, "#ffffff");
}

function torch(ctx: Ctx, base: string): void {
  p(ctx, 7, 7, 2, 8, "#9c7a4d");
  p(ctx, 6, 3, 4, 4, base || "#e7c46b");
  p(ctx, 7, 2, 2, 2, "#fff2b0");
}

function ore(ctx: Ctx, base: string): void {
  block(ctx, "#7f7f7f");
  for (const [x, y] of [[4, 4], [10, 5], [6, 10], [11, 11], [8, 7]]) {
    p(ctx, x, y, 2, 2, base);
    p(ctx, x, y, 1, 1, shade(base, 0.3));
  }
}

function archetype(def: ItemDef): string {
  const id = def.id.replace(/^.*:/, "");
  if (def.tool) return "tool";
  if (/_ingot$|_nugget$/.test(id)) return "ingot";
  if (/_ore$|^raw_|ancient_debris/.test(id)) return "ore";
  if (/^diamond$|^emerald$|^amethyst_shard$|_shard$|^quartz$|^lapis_lazuli$|prismarine_crystals/.test(id)) return "gem";
  if (/dust$|^redstone$|^gunpowder$|^sugar$|^glowstone$|_dye$|blaze_powder|bone_meal/.test(id)) return "dust";
  if (/_planks$/.test(id)) return "planks";
  if (/_log$|_wood$|^bamboo$/.test(id)) return "log";
  if (/_door$/.test(id)) return "door";
  if (/_boat$/.test(id)) return "boat";
  if (/bucket$/.test(id)) return "bucket";
  if (/^stick$/.test(id)) return "stick";
  if (/^torch$/.test(id)) return "torch";
  if (/potion$|^glass_bottle$|experience_bottle/.test(id)) return "bottle";
  if (def.category === "food") return "food";
  return "block";
}

export function drawItemIcon(ctx: Ctx, def: ItemDef): void {
  ctx.clearRect(0, 0, ICON, ICON);
  const base = def.color ?? "#9a9a9a";
  switch (archetype(def)) {
    case "tool":
      return tool(ctx, def);
    case "ingot":
      return ingot(ctx, base);
    case "ore":
      return ore(ctx, base);
    case "gem":
      return gem(ctx, base);
    case "dust":
      return dust(ctx, base);
    case "planks":
      return planks(ctx, base);
    case "log":
      return log(ctx, base);
    case "door":
      return door(ctx, base);
    case "boat":
      return boat(ctx, base);
    case "bucket":
      return liquidBucket(ctx, def.accent);
    case "stick":
      return stick(ctx, base);
    case "torch":
      return torch(ctx, base);
    case "bottle":
      return bottle(ctx, base);
    case "food":
      return food(ctx, base);
    default:
      return block(ctx, base, def.accent);
  }
}

const canvasCache = new Map<string, HTMLCanvasElement>();
const dataUrlCache = new Map<string, string>();

/** A 16x16 canvas with the item's pixel-art icon (cached by id). */
export function itemIconCanvas(def: ItemDef): HTMLCanvasElement {
  const cached = canvasCache.get(def.id);
  if (cached) return cached;
  const canvas = document.createElement("canvas");
  canvas.width = ICON;
  canvas.height = ICON;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = false;
  drawItemIcon(ctx, def);
  canvasCache.set(def.id, canvas);
  return canvas;
}

/** A data URL of the item icon (cached) for use in <img>/CSS. */
export function itemIconDataUrl(def: ItemDef): string {
  const cached = dataUrlCache.get(def.id);
  if (cached) return cached;
  const url = itemIconCanvas(def).toDataURL();
  dataUrlCache.set(def.id, url);
  return url;
}
