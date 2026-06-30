import type { ItemDef } from "../../engine/registry";

// Original, low-res (16x16) pixel-art icons drawn in a Minecraft-ish style.
// All shapes are hand-authored here (not Mojang assets); the item palette comes
// from each ItemDef's color/accent. One renderer feeds both the WebGL GUI and
// the DOM tiles so they always match.

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

// --- Generic blocks --------------------------------------------------------
function block(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, base);
  p(ctx, 1, 1, 14, 2, shade(base, 0.22));
  p(ctx, 1, 1, 2, 14, shade(base, 0.12));
  p(ctx, 1, 13, 14, 2, shade(base, -0.26));
  p(ctx, 13, 1, 2, 14, shade(base, -0.16));
  p(ctx, 5, 6, 2, 2, shade(base, -0.12));
  p(ctx, 9, 9, 2, 2, shade(base, 0.1));
}
function bevel(ctx: Ctx, base: string): void {
  p(ctx, 2, 2, 12, 12, base);
  p(ctx, 2, 2, 12, 1, shade(base, 0.28));
  p(ctx, 2, 2, 1, 12, shade(base, 0.16));
  p(ctx, 2, 13, 12, 1, shade(base, -0.3));
  p(ctx, 13, 2, 1, 12, shade(base, -0.2));
}
function cobble(ctx: Ctx, base: string): void {
  const mortar = shade(base, -0.35);
  p(ctx, 1, 1, 14, 14, mortar);
  const rocks: [number, number, number, number, number][] = [
    [2, 2, 5, 4, 0.08], [8, 1, 6, 5, -0.1], [1, 6, 6, 4, 0.12], [8, 6, 5, 5, -0.06],
    [3, 10, 5, 4, 0.05], [9, 11, 5, 3, -0.12], [13, 5, 2, 6, 0.15], [1, 11, 2, 3, -0.08],
  ];
  for (const [x, y, w, h, s] of rocks) {
    p(ctx, x, y, w, h, shade(base, s));
    p(ctx, x, y, w, 1, shade(base, s + 0.14));
    p(ctx, x, y + h - 1, w, 1, shade(base, s - 0.18));
  }
}
function stoneBrick(ctx: Ctx, base: string): void {
  const mortar = shade(base, -0.32);
  p(ctx, 1, 1, 14, 14, mortar);
  for (const [x, y] of [[2, 2], [8, 2], [2, 8], [8, 8]] as const) {
    p(ctx, x, y, 5, 5, base);
    p(ctx, x, y, 5, 1, shade(base, 0.16));
    p(ctx, x, y + 4, 5, 1, shade(base, -0.2));
  }
  p(ctx, 1, 7, 14, 1, mortar);
  p(ctx, 7, 1, 1, 14, mortar);
}
function brickRows(ctx: Ctx, base: string): void {
  const mortar = shade(base, -0.38);
  p(ctx, 1, 1, 14, 14, mortar);
  for (let row = 0; row < 3; row++) {
    const y = 2 + row * 4;
    const offset = row % 2 === 1 ? 3 : 0;
    for (let col = 0; col < 3; col++) {
      const x = 1 + offset + col * 5;
      if (x + 4 > 15) continue;
      p(ctx, x, y, 4, 3, base);
      p(ctx, x, y, 4, 1, shade(base, 0.18));
      p(ctx, x, y + 2, 4, 1, shade(base, -0.22));
    }
  }
}
function grassBlock(ctx: Ctx, base: string, accent?: string): void {
  const dirt = accent ?? "#7a5a3a";
  p(ctx, 1, 1, 14, 14, dirt);
  p(ctx, 1, 1, 14, 6, base);
  p(ctx, 2, 6, 3, 1, base);
  p(ctx, 7, 6, 2, 1, dirt);
  p(ctx, 10, 6, 3, 1, base);
  p(ctx, 4, 7, 2, 1, base);
  p(ctx, 11, 7, 2, 1, base);
  p(ctx, 1, 1, 14, 1, shade(base, 0.2));
  p(ctx, 13, 1, 1, 13, shade(dirt, -0.14));
  p(ctx, 1, 13, 14, 1, shade(dirt, -0.24));
}
function speckle(ctx: Ctx, base: string): void {
  block(ctx, base);
  const pts: [number, number, number][] = [
    [3, 4, -0.22], [6, 3, 0.14], [10, 5, -0.16], [12, 8, 0.1], [4, 8, 0.12], [7, 10, -0.18],
    [9, 12, -0.1], [11, 7, 0.16], [5, 11, -0.14], [8, 6, 0.08], [13, 11, -0.2], [2, 10, 0.06],
  ];
  for (const [x, y, s] of pts) p(ctx, x, y, 1, 1, shade(base, s));
}
function glassPane(ctx: Ctx, base: string): void {
  const edge = shade(base, 0.35);
  p(ctx, 3, 2, 10, 12, edge);
  p(ctx, 4, 3, 8, 10, base);
  p(ctx, 5, 4, 6, 8, shade(base, 0.12));
  p(ctx, 3, 2, 10, 1, "#ffffff");
  p(ctx, 3, 2, 1, 12, "#ffffff");
  p(ctx, 3, 13, 10, 1, shade(base, -0.15));
  p(ctx, 12, 2, 1, 12, shade(base, -0.1));
  p(ctx, 4, 3, 2, 1, "#ffffff");
}
function obsidianBlock(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, base);
  p(ctx, 1, 1, 14, 1, shade(base, 0.08));
  p(ctx, 1, 13, 14, 1, shade(base, -0.2));
  const glint = shade(base, 0.55);
  for (const [x, y] of [[4, 4], [10, 3], [7, 8], [11, 11], [3, 10], [8, 5]] as const) {
    p(ctx, x, y, 1, 1, glint);
  }
}
function hayBlock(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, base);
  for (const y of [2, 5, 8, 11]) {
    p(ctx, 1, y, 14, 1, shade(base, -0.22));
    p(ctx, 2, y + 1, 11, 1, shade(base, 0.16));
  }
  p(ctx, 1, 1, 14, 1, shade(base, 0.2));
  p(ctx, 1, 13, 14, 1, shade(base, -0.26));
}
function pumpkinBlock(ctx: Ctx, base: string): void {
  const rib = shade(base, -0.18);
  p(ctx, 3, 4, 10, 11, base);
  for (const x of [4, 7, 10]) p(ctx, x, 4, 1, 11, rib);
  p(ctx, 3, 4, 10, 1, shade(base, 0.22));
  p(ctx, 3, 14, 10, 1, shade(base, -0.28));
  p(ctx, 6, 1, 4, 3, "#5a8a32");
  p(ctx, 6, 1, 4, 1, shade("#5a8a32", 0.2));
}
function metalBlock(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, base);
  p(ctx, 1, 1, 14, 3, shade(base, 0.32));
  p(ctx, 1, 1, 3, 14, shade(base, 0.2));
  p(ctx, 1, 12, 14, 3, shade(base, -0.34));
  p(ctx, 12, 1, 3, 14, shade(base, -0.22));
  p(ctx, 1, 1, 2, 2, shade(base, 0.4));
  p(ctx, 13, 13, 2, 2, shade(base, -0.38));
}

// --- Materials -------------------------------------------------------------
function ingot(ctx: Ctx, base: string): void {
  const D = shade(base, -0.28);
  const M = shade(base, -0.1);
  p(ctx, 3, 9, 10, 2, D);
  p(ctx, 4, 7, 9, 2, M);
  p(ctx, 5, 5, 8, 2, base);
  p(ctx, 11, 7, 2, 2, D);
  p(ctx, 5, 5, 6, 1, shade(base, 0.3));
  p(ctx, 4, 8, 2, 1, shade(base, 0.3));
}
function ore(ctx: Ctx, base: string): void {
  const stone = "#787878";
  p(ctx, 2, 3, 12, 10, stone);
  p(ctx, 2, 3, 12, 2, shade(stone, 0.2));
  p(ctx, 2, 3, 2, 10, shade(stone, 0.12));
  p(ctx, 2, 12, 12, 1, shade(stone, -0.24));
  p(ctx, 13, 3, 1, 10, shade(stone, -0.16));
  for (const [x, y] of [[5, 5], [10, 4], [6, 9], [11, 10], [4, 11]] as const) {
    p(ctx, x, y, 2, 2, base);
    p(ctx, x, y, 1, 1, shade(base, 0.32));
  }
}
function rawLump(ctx: Ctx, base: string): void {
  const L = shade(base, 0.26);
  const D = shade(base, -0.3);
  p(ctx, 4, 5, 8, 7, base);
  p(ctx, 3, 7, 2, 4, base);
  p(ctx, 11, 6, 2, 5, base);
  p(ctx, 5, 4, 6, 1, base);
  p(ctx, 5, 4, 4, 1, L);
  p(ctx, 4, 10, 7, 1, D);
  p(ctx, 6, 6, 2, 2, L);
}
function nugget(ctx: Ctx, base: string): void {
  p(ctx, 6, 5, 4, 6, base);
  p(ctx, 5, 6, 6, 4, base);
  p(ctx, 6, 5, 3, 2, shade(base, 0.34));
  p(ctx, 5, 9, 4, 1, shade(base, -0.26));
}
function scrap(ctx: Ctx, base: string): void {
  const L = shade(base, 0.24);
  const D = shade(base, -0.3);
  p(ctx, 3, 4, 5, 3, base);
  p(ctx, 8, 7, 4, 2, base);
  p(ctx, 5, 9, 6, 3, base);
  p(ctx, 3, 4, 5, 1, L);
  p(ctx, 5, 11, 6, 1, D);
  p(ctx, 4, 8, 2, 2, D);
}
function debris(ctx: Ctx, base: string): void {
  const host = shade(base, -0.38);
  p(ctx, 2, 3, 12, 10, host);
  p(ctx, 2, 3, 12, 1, shade(host, 0.14));
  p(ctx, 5, 6, 3, 2, base);
  p(ctx, 9, 8, 4, 2, base);
  p(ctx, 5, 6, 1, 1, shade(base, 0.35));
}
function coalLump(ctx: Ctx, base: string): void {
  const D = shade(base, -0.22);
  p(ctx, 4, 4, 7, 6, base);
  p(ctx, 3, 6, 2, 4, base);
  p(ctx, 10, 5, 3, 5, base);
  p(ctx, 6, 3, 4, 1, base);
  p(ctx, 5, 4, 2, 2, shade(base, 0.2));
  p(ctx, 4, 9, 6, 1, D);
}
function flintChip(ctx: Ctx, base: string): void {
  const D = shade(base, -0.32);
  p(ctx, 5, 8, 4, 4, base);
  p(ctx, 7, 5, 3, 3, base);
  p(ctx, 8, 3, 2, 2, base);
  p(ctx, 9, 5, 2, 4, base);
  p(ctx, 7, 5, 2, 1, shade(base, 0.28));
  p(ctx, 5, 8, 2, 2, D);
}
function gem(ctx: Ctx, base: string): void {
  const L = shade(base, 0.35);
  const D = shade(base, -0.28);
  const rows: [number, number, string][] = [
    [7, 2, L], [6, 4, base], [5, 6, base], [4, 8, base], [5, 6, D], [6, 4, D], [7, 2, D],
  ];
  rows.forEach(([x, w, c], i) => p(ctx, x, 3 + i, w, 1, c));
  p(ctx, 6, 5, 2, 2, L);
}
function quartzShard(ctx: Ctx, base: string): void {
  p(ctx, 7, 2, 2, 10, base);
  p(ctx, 6, 4, 1, 6, base);
  p(ctx, 9, 3, 1, 8, base);
  p(ctx, 7, 2, 2, 2, shade(base, 0.3));
  p(ctx, 9, 10, 1, 2, shade(base, -0.22));
}
function gemShard(ctx: Ctx, base: string): void {
  const L = shade(base, 0.3);
  p(ctx, 4, 5, 3, 4, base);
  p(ctx, 8, 4, 2, 3, base);
  p(ctx, 9, 8, 3, 3, base);
  p(ctx, 5, 10, 4, 2, base);
  p(ctx, 4, 5, 2, 1, L);
  p(ctx, 6, 7, 2, 2, shade(base, 0.15));
}
function dust(ctx: Ctx, base: string): void {
  for (const [x, y] of [[3, 5], [6, 3], [9, 6], [12, 4], [5, 9], [8, 10], [11, 11], [4, 12], [7, 7], [10, 8]] as const) {
    p(ctx, x, y, 2, 2, base);
  }
}

// --- Loose drops / round items --------------------------------------------
function orb(ctx: Ctx, base: string, accent?: string): void {
  const rows: [number, number][] = [
    [7, 2], [6, 4], [5, 6], [4, 8], [4, 8], [4, 8], [4, 8], [5, 6], [6, 4], [7, 2],
  ];
  rows.forEach(([x, w], i) => p(ctx, x, 3 + i, w, 1, base));
  p(ctx, 5, 4, 3, 2, shade(base, 0.34));
  p(ctx, 6, 5, 2, 1, shade(base, 0.5));
  p(ctx, 9, 9, 3, 2, shade(base, -0.3));
  if (accent) p(ctx, 6, 7, 2, 2, accent);
}
function egg(ctx: Ctx, base: string): void {
  const rows: [number, number][] = [[7, 2], [6, 4], [5, 6], [5, 6], [5, 6], [5, 6], [6, 4], [7, 2]];
  rows.forEach(([x, w], i) => p(ctx, x, 3 + i, w, 1, base));
  p(ctx, 6, 4, 2, 2, shade(base, 0.28));
  p(ctx, 5, 9, 4, 1, shade(base, -0.22));
}
function rod(ctx: Ctx, base: string): void {
  const glow = shade(base, 0.45);
  p(ctx, 7, 2, 2, 3, glow);
  p(ctx, 6, 2, 4, 1, shade(glow, 0.3));
  p(ctx, 7, 2, 1, 1, "#fff8d0");
  for (let y = 5; y <= 13; y++) {
    p(ctx, 7, y, 2, 1, base);
    if (y % 2 === 0) p(ctx, 6, y, 1, 1, shade(base, -0.18));
  }
  p(ctx, 7, 13, 2, 1, shade(base, -0.25));
}
function boneItem(ctx: Ctx, base: string): void {
  const D = shade(base, -0.24);
  p(ctx, 2, 6, 4, 4, base);
  p(ctx, 10, 6, 4, 4, base);
  p(ctx, 2, 6, 4, 1, shade(base, 0.2));
  p(ctx, 10, 6, 4, 1, shade(base, 0.2));
  p(ctx, 5, 7, 6, 2, base);
  p(ctx, 5, 8, 6, 1, D);
  p(ctx, 2, 9, 4, 1, D);
  p(ctx, 10, 9, 4, 1, D);
}
function feather(ctx: Ctx, base: string, accent?: string): void {
  const shaft = accent ?? shade(base, -0.4);
  for (let i = 0; i < 10; i++) p(ctx, 3 + i, 12 - i, 1, 2, shaft);
  for (const [x, y, w] of [[6, 4, 3], [5, 5, 5], [4, 6, 6], [4, 7, 5], [5, 8, 3]] as const) p(ctx, x, y, w, 1, base);
  p(ctx, 5, 5, 3, 1, shade(base, 0.22));
}
function stringItem(ctx: Ctx, base: string): void {
  for (const [x, y, w, h] of [[3, 4, 4, 1], [2, 5, 1, 4], [6, 5, 1, 3], [3, 8, 4, 1], [8, 5, 5, 1], [12, 6, 1, 4], [9, 9, 4, 1], [8, 7, 1, 2], [5, 10, 6, 1], [4, 11, 1, 2], [10, 11, 1, 2]] as const)
    p(ctx, x, y, w, h, base);
  p(ctx, 5, 10, 4, 1, shade(base, 0.12));
}
function sheet(ctx: Ctx, base: string): void {
  p(ctx, 4, 2, 9, 12, base);
  p(ctx, 4, 2, 9, 1, shade(base, 0.16));
  p(ctx, 12, 2, 1, 12, shade(base, -0.14));
  p(ctx, 4, 13, 9, 1, shade(base, -0.14));
  p(ctx, 6, 6, 1, 5, shade(base, -0.06));
  p(ctx, 8, 5, 1, 4, shade(base, -0.05));
}
function bookItem(ctx: Ctx, base: string, accent?: string): void {
  const cover = shade(base, -0.08);
  const pages = accent ?? "#f4f4ee";
  p(ctx, 3, 3, 10, 10, cover);
  p(ctx, 5, 4, 7, 8, pages);
  p(ctx, 3, 3, 2, 10, shade(base, -0.22));
  p(ctx, 3, 3, 10, 1, shade(cover, 0.22));
  p(ctx, 6, 5, 1, 6, shade(pages, -0.1));
  p(ctx, 8, 6, 1, 4, shade(pages, -0.08));
}
function leatherPatch(ctx: Ctx, base: string): void {
  p(ctx, 3, 4, 10, 8, base);
  p(ctx, 4, 3, 8, 1, base);
  p(ctx, 5, 11, 6, 1, base);
  p(ctx, 3, 4, 10, 1, shade(base, 0.16));
  p(ctx, 11, 4, 1, 8, shade(base, -0.3));
  p(ctx, 6, 6, 2, 2, shade(base, -0.14));
}
function cluster(ctx: Ctx, base: string): void {
  const stem = shade(base, -0.2);
  p(ctx, 5, 9, 2, 3, stem);
  p(ctx, 7, 8, 2, 4, stem);
  p(ctx, 9, 9, 2, 3, stem);
  p(ctx, 4, 5, 3, 3, base);
  p(ctx, 7, 4, 3, 3, base);
  p(ctx, 10, 5, 3, 3, base);
  p(ctx, 4, 5, 3, 1, shade(base, 0.3));
}
function shell(ctx: Ctx, base: string): void {
  const spiral = shade(base, -0.22);
  const rows: [number, number][] = [[8, 4], [6, 6], [5, 8], [5, 8], [6, 6], [7, 4]];
  rows.forEach(([x, w], i) => p(ctx, x, 4 + i, w, 1, base));
  p(ctx, 6, 7, 4, 1, spiral);
  p(ctx, 7, 8, 3, 1, spiral);
  p(ctx, 5, 5, 2, 2, shade(base, 0.22));
}
function scuteItem(ctx: Ctx, base: string): void {
  p(ctx, 4, 5, 8, 6, base);
  p(ctx, 5, 4, 6, 1, base);
  p(ctx, 6, 3, 4, 1, base);
  p(ctx, 4, 5, 8, 1, shade(base, 0.24));
  p(ctx, 4, 10, 8, 1, shade(base, -0.28));
}
function shardItem(ctx: Ctx, base: string): void {
  p(ctx, 6, 3, 4, 2, base);
  p(ctx, 5, 5, 6, 2, base);
  p(ctx, 6, 7, 4, 3, base);
  p(ctx, 7, 10, 2, 3, base);
  p(ctx, 6, 3, 4, 1, shade(base, 0.32));
  p(ctx, 8, 8, 2, 2, shade(base, -0.26));
}
function crystal(ctx: Ctx, base: string): void {
  const main: [number, number][] = [[7, 2], [6, 4], [5, 6], [6, 4], [7, 2]];
  main.forEach(([x, w], i) => p(ctx, x, 2 + i, w, 1, base));
  p(ctx, 4, 6, 2, 3, base);
  p(ctx, 10, 7, 2, 2, base);
  p(ctx, 5, 8, 6, 2, base);
  p(ctx, 7, 10, 2, 3, base);
  p(ctx, 6, 3, 2, 1, shade(base, 0.36));
}
function teardrop(ctx: Ctx, base: string): void {
  p(ctx, 7, 3, 2, 2, base);
  p(ctx, 6, 5, 4, 2, base);
  p(ctx, 5, 7, 6, 2, base);
  p(ctx, 6, 9, 4, 2, base);
  p(ctx, 7, 11, 2, 2, base);
  p(ctx, 7, 4, 2, 2, shade(base, 0.38));
}
function eyeItem(ctx: Ctx, base: string, accent?: string): void {
  const iris = accent ?? shade(base, -0.35);
  p(ctx, 5, 5, 6, 2, base);
  p(ctx, 4, 7, 8, 4, base);
  p(ctx, 5, 11, 6, 1, base);
  p(ctx, 5, 5, 6, 1, shade(base, 0.22));
  p(ctx, 6, 7, 4, 3, iris);
  p(ctx, 7, 8, 2, 2, shade(iris, -0.45));
  p(ctx, 6, 7, 2, 1, shade(base, 0.35));
}
function brickItem(ctx: Ctx, base: string): void {
  p(ctx, 3, 5, 10, 6, base);
  p(ctx, 3, 5, 10, 1, shade(base, 0.22));
  p(ctx, 12, 5, 1, 6, shade(base, -0.24));
  p(ctx, 3, 10, 10, 1, shade(base, -0.3));
  p(ctx, 5, 7, 6, 1, shade(base, -0.18));
}

// --- Brewing / potions -----------------------------------------------------
function flask(ctx: Ctx, base: string, accent: string | undefined, splash: boolean): void {
  const cork = accent ?? "#9c7a4d";
  const g = "#c4e8f0";
  const gHi = "#ecf8fc";
  const gLo = shade(g, -0.14);
  p(ctx, 7, splash ? 2 : 1, 2, 2, cork);
  p(ctx, 7, splash ? 4 : 3, 2, 2, gLo);
  p(ctx, 7, splash ? 4 : 3, 1, 2, gHi);
  if (splash) {
    p(ctx, 4, 6, 8, 1, g);
    p(ctx, 3, 7, 1, 5, g);
    p(ctx, 12, 7, 1, 5, gLo);
    p(ctx, 3, 11, 10, 1, g);
    p(ctx, 4, 9, 8, 4, base);
    p(ctx, 4, 9, 8, 1, shade(base, 0.2));
  } else {
    p(ctx, 6, 5, 4, 1, g);
    p(ctx, 5, 6, 1, 7, gHi);
    p(ctx, 10, 6, 1, 7, gLo);
    p(ctx, 5, 6, 6, 1, g);
    p(ctx, 6, 12, 4, 1, g);
    p(ctx, 5, 13, 6, 1, gLo);
    p(ctx, 6, 8, 4, 5, base);
    p(ctx, 6, 8, 4, 1, shade(base, 0.24));
    p(ctx, 6, 12, 4, 1, shade(base, -0.22));
  }
}
function emptyFlask(ctx: Ctx, base: string): void {
  const gHi = shade(base, 0.2);
  const gLo = shade(base, -0.12);
  p(ctx, 7, 1, 2, 2, "#b08a52");
  p(ctx, 7, 3, 2, 2, gLo);
  p(ctx, 6, 5, 4, 1, base);
  p(ctx, 5, 6, 1, 7, gHi);
  p(ctx, 10, 6, 1, 7, gLo);
  p(ctx, 5, 6, 6, 1, base);
  p(ctx, 6, 12, 4, 1, base);
  p(ctx, 5, 13, 6, 1, gLo);
  p(ctx, 6, 7, 1, 2, "#ffffff");
}
function xpFlask(ctx: Ctx, base: string): void {
  flask(ctx, base, "#9c7a4d", false);
  p(ctx, 5, 9, 1, 1, "#eaffd8");
  p(ctx, 9, 10, 1, 1, "#ffffff");
  p(ctx, 7, 11, 1, 1, "#eaffd8");
}
function brewingStand(ctx: Ctx, base: string): void {
  const rod = "#d08838";
  p(ctx, 1, 13, 14, 2, shade(base, -0.08));
  p(ctx, 7, 9, 2, 4, base);
  p(ctx, 6, 8, 4, 1, shade(base, 0.14));
  p(ctx, 3, 4, 2, 5, rod);
  p(ctx, 7, 3, 2, 6, rod);
  p(ctx, 11, 4, 2, 5, rod);
  p(ctx, 3, 3, 2, 1, "#ffb060");
  p(ctx, 7, 2, 2, 1, "#ffb060");
  p(ctx, 11, 3, 2, 1, "#ffb060");
}
function cauldron(ctx: Ctx, base: string): void {
  const rim = shade(base, 0.28);
  p(ctx, 1, 6, 2, 2, base);
  p(ctx, 13, 6, 2, 2, base);
  p(ctx, 3, 5, 10, 2, rim);
  p(ctx, 4, 7, 8, 5, base);
  p(ctx, 5, 12, 6, 2, shade(base, -0.14));
  p(ctx, 5, 7, 6, 3, shade(base, -0.38));
}
function fireCharge(ctx: Ctx, base: string): void {
  const ember = shade(base, -0.22);
  p(ctx, 6, 3, 4, 1, base);
  p(ctx, 5, 4, 6, 1, base);
  p(ctx, 4, 5, 8, 5, base);
  p(ctx, 5, 10, 6, 1, ember);
  p(ctx, 6, 5, 4, 4, "#ffe566");
  p(ctx, 7, 4, 2, 1, "#fff8b0");
  p(ctx, 3, 4, 1, 1, shade(base, 0.18));
  p(ctx, 12, 8, 1, 1, "#ffb040");
}
function totem(ctx: Ctx, base: string, accent?: string): void {
  const dark = shade(base, -0.32);
  const eye = accent ?? "#4a9a4a";
  p(ctx, 5, 2, 6, 12, base);
  p(ctx, 5, 2, 6, 1, shade(base, 0.18));
  p(ctx, 10, 2, 1, 12, dark);
  p(ctx, 2, 5, 3, 3, dark);
  p(ctx, 11, 5, 3, 3, dark);
  p(ctx, 6, 5, 1, 2, eye);
  p(ctx, 9, 5, 1, 2, eye);
  p(ctx, 6, 8, 4, 1, dark);
  p(ctx, 5, 11, 6, 1, dark);
}
function nameTag(ctx: Ctx, base: string, accent?: string): void {
  const ink = accent ?? "#4a4a4a";
  const string = shade(base, -0.32);
  p(ctx, 7, 1, 2, 1, string);
  p(ctx, 6, 2, 1, 2, string);
  p(ctx, 9, 2, 1, 2, string);
  p(ctx, 4, 5, 8, 9, base);
  p(ctx, 4, 5, 8, 1, shade(base, 0.16));
  p(ctx, 11, 5, 1, 9, shade(base, -0.14));
  p(ctx, 7, 5, 2, 2, "#2e2e2e");
  p(ctx, 5, 8, 6, 1, ink);
  p(ctx, 5, 10, 4, 1, ink);
}
function lead(ctx: Ctx, base: string, accent?: string): void {
  const hook = accent ?? "#c8c8c8";
  p(ctx, 6, 2, 4, 2, hook);
  p(ctx, 6, 4, 1, 2, hook);
  p(ctx, 9, 4, 1, 2, shade(hook, -0.12));
  p(ctx, 7, 6, 2, 2, base);
  p(ctx, 6, 8, 2, 2, shade(base, -0.22));
  p(ctx, 8, 10, 2, 2, base);
  p(ctx, 6, 12, 2, 2, shade(base, -0.22));
  p(ctx, 4, 13, 5, 2, shade(base, -0.22));
}
function mapRoll(ctx: Ctx, base: string, accent?: string): void {
  const edge = shade(base, -0.2);
  const land = accent ?? "#6a9a62";
  p(ctx, 2, 5, 12, 6, base);
  p(ctx, 2, 5, 12, 1, shade(base, 0.14));
  p(ctx, 2, 10, 12, 1, edge);
  p(ctx, 1, 6, 1, 4, edge);
  p(ctx, 14, 6, 1, 4, edge);
  p(ctx, 4, 7, 3, 2, land);
  p(ctx, 8, 8, 2, 2, shade(land, -0.25));
  p(ctx, 7, 10, 2, 1, "#8a4a42");
}
function fermentedEye(ctx: Ctx, base: string): void {
  const lo = shade(base, -0.28);
  p(ctx, 5, 5, 6, 1, base);
  p(ctx, 4, 6, 8, 1, base);
  p(ctx, 3, 7, 10, 4, base);
  p(ctx, 4, 11, 8, 1, lo);
  p(ctx, 3, 7, 1, 4, shade(base, 0.22));
  p(ctx, 5, 8, 2, 2, shade(base, -0.12));
  p(ctx, 7, 8, 2, 2, shade(base, -0.45));
}

// --- Tools / weapons / armor ----------------------------------------------
function drawSword(ctx: Ctx, base: string, wood: string, guard: string): void {
  p(ctx, 2, 13, 2, 2, guard);
  p(ctx, 3, 10, 2, 4, wood);
  p(ctx, 2, 9, 5, 2, guard);
  for (let i = 0; i < 8; i++) p(ctx, 4 + i, 9 - i, 2, 2, base);
  p(ctx, 11, 1, 2, 2, base);
  p(ctx, 11, 1, 1, 1, shade(base, 0.32));
}
function drawPickaxe(ctx: Ctx, base: string, wood: string): void {
  p(ctx, 1, 4, 2, 2, base);
  p(ctx, 2, 2, 2, 2, base);
  p(ctx, 3, 1, 2, 2, base);
  p(ctx, 11, 4, 2, 2, base);
  p(ctx, 10, 2, 2, 2, base);
  p(ctx, 9, 1, 2, 2, base);
  p(ctx, 3, 4, 10, 2, base);
  p(ctx, 3, 4, 10, 1, shade(base, 0.24));
  p(ctx, 7, 6, 2, 9, wood);
}
function drawAxe(ctx: Ctx, base: string, wood: string): void {
  p(ctx, 7, 2, 6, 5, base);
  p(ctx, 9, 2, 4, 2, shade(base, 0.26));
  p(ctx, 4, 3, 3, 3, base);
  p(ctx, 6, 6, 3, 2, shade(base, -0.32));
  p(ctx, 7, 8, 2, 7, wood);
}
function drawShovel(ctx: Ctx, base: string, wood: string): void {
  p(ctx, 5, 2, 6, 2, base);
  p(ctx, 4, 4, 8, 2, base);
  p(ctx, 5, 6, 6, 2, base);
  p(ctx, 5, 2, 6, 1, shade(base, 0.28));
  p(ctx, 7, 8, 2, 7, wood);
}
function drawHoe(ctx: Ctx, base: string, wood: string): void {
  p(ctx, 2, 3, 7, 2, base);
  p(ctx, 2, 5, 5, 2, base);
  p(ctx, 2, 3, 7, 1, shade(base, 0.22));
  p(ctx, 7, 5, 2, 2, base);
  p(ctx, 8, 5, 2, 10, wood);
}
function drawHelmet(ctx: Ctx, base: string): void {
  p(ctx, 5, 2, 6, 2, base);
  p(ctx, 4, 4, 8, 3, base);
  p(ctx, 5, 7, 6, 3, shade(base, -0.35));
  p(ctx, 6, 8, 4, 1, "#1a1a1a");
  p(ctx, 4, 10, 8, 2, base);
  p(ctx, 5, 2, 6, 1, shade(base, 0.22));
}
function drawChestplate(ctx: Ctx, base: string): void {
  p(ctx, 2, 3, 3, 3, base);
  p(ctx, 11, 3, 3, 3, base);
  p(ctx, 4, 3, 8, 9, base);
  p(ctx, 6, 3, 4, 2, shade(base, -0.35));
  p(ctx, 7, 5, 2, 6, shade(base, 0.14));
  p(ctx, 4, 3, 8, 1, shade(base, 0.22));
}
function drawLeggings(ctx: Ctx, base: string): void {
  p(ctx, 4, 2, 8, 2, base);
  p(ctx, 4, 4, 3, 8, base);
  p(ctx, 9, 4, 3, 8, base);
  p(ctx, 7, 4, 2, 6, shade(base, -0.3));
  p(ctx, 4, 2, 8, 1, shade(base, 0.2));
}
function drawBoots(ctx: Ctx, base: string): void {
  const sole = shade(base, -0.3);
  p(ctx, 3, 5, 3, 5, base);
  p(ctx, 2, 10, 4, 2, base);
  p(ctx, 2, 12, 3, 1, sole);
  p(ctx, 10, 5, 3, 5, base);
  p(ctx, 10, 10, 4, 2, base);
  p(ctx, 11, 12, 3, 1, sole);
}
function drawBow(ctx: Ctx, base: string): void {
  for (const [x, y] of [[4, 12], [3, 10], [3, 7], [4, 4], [6, 2], [9, 2], [11, 4], [11, 7], [11, 10], [10, 12]] as const)
    p(ctx, x, y, 2, 2, base);
  p(ctx, 6, 2, 4, 1, shade(base, 0.2));
  p(ctx, 12, 3, 1, 10, "#dddddd");
}
function drawArrow(ctx: Ctx, base: string, wood: string): void {
  p(ctx, 2, 12, 2, 2, base);
  p(ctx, 1, 13, 2, 1, shade(base, 0.15));
  for (let i = 0; i < 7; i++) p(ctx, 3 + i, 12 - i, 1, 2, wood);
  p(ctx, 10, 3, 2, 2, base);
  p(ctx, 11, 2, 2, 2, base);
  p(ctx, 12, 1, 1, 2, shade(base, 0.28));
}
function drawShield(ctx: Ctx, base: string, boss: string): void {
  p(ctx, 4, 2, 8, 3, base);
  p(ctx, 3, 5, 10, 4, base);
  p(ctx, 4, 9, 8, 3, base);
  p(ctx, 6, 12, 4, 2, base);
  p(ctx, 7, 14, 2, 1, base);
  p(ctx, 4, 2, 8, 1, shade(base, 0.18));
  p(ctx, 12, 5, 1, 7, shade(base, -0.28));
  p(ctx, 6, 6, 4, 4, boss);
  p(ctx, 7, 7, 2, 2, shade(boss, 0.25));
}
function drawTrident(ctx: Ctx, base: string): void {
  const shaft = shade(base, -0.2);
  p(ctx, 7, 1, 2, 4, base);
  p(ctx, 3, 2, 2, 3, base);
  p(ctx, 2, 3, 1, 2, base);
  p(ctx, 11, 2, 2, 3, base);
  p(ctx, 13, 3, 1, 2, base);
  p(ctx, 4, 5, 8, 1, base);
  p(ctx, 7, 6, 2, 9, shaft);
}
function drawFishingRod(ctx: Ctx, base: string): void {
  p(ctx, 2, 11, 2, 4, shade(base, -0.2));
  for (const [x, y] of [[3, 10], [4, 8], [5, 6], [6, 4], [8, 3], [10, 2]] as const) p(ctx, x, y, 2, 2, base);
  p(ctx, 12, 2, 2, 2, shade(base, 0.15));
  p(ctx, 13, 3, 1, 8, "#dddddd");
  p(ctx, 13, 11, 2, 1, "#dddddd");
}
function drawShears(ctx: Ctx, base: string): void {
  const dark = shade(base, -0.25);
  const light = shade(base, 0.22);
  p(ctx, 2, 9, 5, 2, base);
  p(ctx, 1, 11, 3, 3, dark);
  p(ctx, 2, 8, 4, 1, light);
  p(ctx, 6, 5, 5, 2, base);
  p(ctx, 10, 3, 3, 3, dark);
  p(ctx, 7, 5, 4, 1, light);
  p(ctx, 5, 7, 3, 3, dark);
}
function drawFlintAndSteel(ctx: Ctx, base: string): void {
  const flint = "#e2640f";
  p(ctx, 8, 3, 4, 3, base);
  p(ctx, 10, 6, 3, 2, base);
  p(ctx, 11, 8, 2, 4, base);
  p(ctx, 9, 3, 3, 1, shade(base, 0.25));
  p(ctx, 3, 8, 4, 4, flint);
  p(ctx, 4, 7, 3, 1, flint);
  p(ctx, 3, 8, 2, 1, shade(flint, 0.3));
  p(ctx, 7, 7, 2, 2, "#fff2a0");
}
function tool(ctx: Ctx, def: ItemDef): void {
  const base = def.color ?? "#cfcfcf";
  const id = def.id.replace(/^.*:/, "");
  const wood = def.accent && def.accent !== "#c8c8c8" ? def.accent : "#9c7a4d";
  const guard = id === "wooden_sword" ? "#c8c8c8" : shade(base, -0.12);
  if (id === "bow") return drawBow(ctx, base);
  if (id === "arrow") return drawArrow(ctx, base, wood);
  if (id === "shield") return drawShield(ctx, base, def.accent ?? "#cfcfcf");
  if (id === "trident") return drawTrident(ctx, base);
  if (id === "fishing_rod") return drawFishingRod(ctx, base);
  if (id === "shears") return drawShears(ctx, base);
  if (id === "flint_and_steel") return drawFlintAndSteel(ctx, base);
  if (/_sword$/.test(id)) return drawSword(ctx, base, wood, guard);
  if (/_pickaxe$/.test(id)) return drawPickaxe(ctx, base, wood);
  if (/_axe$/.test(id)) return drawAxe(ctx, base, wood);
  if (/_shovel$/.test(id)) return drawShovel(ctx, base, wood);
  if (/_hoe$/.test(id)) return drawHoe(ctx, base, wood);
  if (/_helmet$/.test(id)) return drawHelmet(ctx, base);
  if (/_chestplate$/.test(id)) return drawChestplate(ctx, base);
  if (/_leggings$/.test(id)) return drawLeggings(ctx, base);
  if (/_boots$/.test(id)) return drawBoots(ctx, base);
  return drawPickaxe(ctx, base, wood);
}

// --- Wood set --------------------------------------------------------------
function planks(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, base);
  const d = shade(base, -0.28);
  for (const y of [1, 5, 9, 13]) p(ctx, 1, y, 14, 1, d);
  p(ctx, 8, 1, 1, 4, d);
  p(ctx, 4, 5, 1, 4, d);
  p(ctx, 11, 9, 1, 4, d);
  p(ctx, 1, 1, 14, 1, shade(base, 0.18));
}
function log(ctx: Ctx, base: string, accent?: string): void {
  const ring = accent ?? shade(base, -0.22);
  const d = shade(base, -0.32);
  p(ctx, 1, 3, 14, 12, base);
  for (const x of [3, 6, 9, 12]) p(ctx, x, 3, 1, 12, d);
  p(ctx, 4, 3, 1, 12, shade(base, 0.18));
  p(ctx, 2, 1, 12, 2, ring);
  p(ctx, 5, 1, 6, 1, shade(ring, 0.14));
  p(ctx, 7, 2, 2, 1, shade(ring, -0.22));
}
function woodLog(ctx: Ctx, base: string, accent?: string): void {
  const d = accent ?? shade(base, -0.28);
  p(ctx, 1, 1, 14, 14, base);
  for (const x of [2, 5, 8, 11]) p(ctx, x, 1, 1, 14, d);
  for (const y of [4, 8, 12]) p(ctx, 1, y, 14, 1, shade(d, -0.1));
  p(ctx, 1, 1, 14, 1, shade(base, 0.18));
}
function slab(ctx: Ctx, base: string): void {
  const d = shade(base, -0.28);
  p(ctx, 1, 8, 14, 8, base);
  p(ctx, 1, 8, 14, 1, d);
  p(ctx, 1, 12, 14, 1, d);
  p(ctx, 6, 8, 1, 4, d);
  p(ctx, 1, 8, 14, 1, shade(base, 0.2));
}
function stairs(ctx: Ctx, base: string): void {
  const d = shade(base, -0.28);
  p(ctx, 1, 9, 14, 6, base);
  p(ctx, 1, 5, 8, 4, base);
  p(ctx, 1, 9, 14, 1, d);
  p(ctx, 1, 5, 8, 1, shade(base, 0.18));
  p(ctx, 9, 5, 1, 4, shade(base, -0.34));
}
function fence(ctx: Ctx, base: string): void {
  p(ctx, 7, 2, 2, 12, base);
  p(ctx, 2, 5, 12, 2, base);
  p(ctx, 2, 9, 12, 2, base);
  p(ctx, 7, 2, 1, 12, shade(base, 0.12));
  p(ctx, 2, 5, 12, 1, shade(base, 0.15));
  p(ctx, 2, 10, 12, 1, shade(base, -0.22));
}
function door(ctx: Ctx, base: string, accent?: string): void {
  const frame = accent ?? shade(base, -0.25);
  const d = shade(base, -0.32);
  p(ctx, 3, 1, 10, 14, base);
  p(ctx, 4, 3, 8, 4, d);
  p(ctx, 4, 9, 8, 5, d);
  p(ctx, 3, 1, 1, 14, frame);
  p(ctx, 12, 1, 1, 14, frame);
  p(ctx, 3, 1, 10, 1, shade(base, 0.2));
  p(ctx, 10, 8, 1, 2, shade(base, 0.35));
}
function trapdoor(ctx: Ctx, base: string, accent?: string): void {
  const d = accent ?? shade(base, -0.3);
  p(ctx, 2, 5, 12, 8, base);
  for (const y of [5, 8, 11]) p(ctx, 2, y, 12, 1, d);
  p(ctx, 2, 5, 12, 1, shade(base, 0.22));
  p(ctx, 2, 12, 12, 1, shade(base, -0.28));
}
function boat(ctx: Ctx, base: string): void {
  p(ctx, 1, 11, 14, 3, "#3a6ff0");
  p(ctx, 1, 11, 14, 1, shade("#3a6ff0", 0.2));
  p(ctx, 2, 8, 12, 4, base);
  p(ctx, 3, 7, 10, 1, base);
  p(ctx, 1, 9, 1, 3, base);
  p(ctx, 14, 9, 1, 3, base);
  p(ctx, 2, 11, 12, 1, shade(base, -0.3));
  p(ctx, 6, 6, 4, 1, shade(base, -0.15));
}
function sapling(ctx: Ctx, base: string, accent?: string): void {
  const trunk = accent ?? "#9c7a4d";
  p(ctx, 4, 12, 8, 3, "#7a5a3a");
  p(ctx, 7, 8, 2, 5, trunk);
  p(ctx, 5, 4, 6, 4, base);
  p(ctx, 6, 3, 4, 1, shade(base, 0.25));
  p(ctx, 4, 6, 2, 2, shade(base, 0.15));
}
function leaves(ctx: Ctx, base: string): void {
  p(ctx, 2, 4, 12, 10, base);
  p(ctx, 4, 2, 8, 2, base);
  p(ctx, 3, 6, 3, 3, shade(base, 0.2));
  p(ctx, 10, 5, 3, 3, shade(base, -0.15));
  p(ctx, 6, 8, 4, 3, shade(base, 0.12));
  p(ctx, 2, 13, 12, 1, shade(base, -0.25));
}
function button(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, shade(base, -0.5));
  p(ctx, 5, 5, 6, 6, base);
  p(ctx, 5, 5, 6, 1, shade(base, 0.28));
  p(ctx, 5, 10, 6, 1, shade(base, -0.26));
}
function pressurePlate(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, shade(base, -0.45));
  p(ctx, 2, 7, 12, 2, base);
  p(ctx, 2, 7, 12, 1, shade(base, 0.25));
  p(ctx, 2, 8, 12, 1, shade(base, -0.28));
}
function sign(ctx: Ctx, base: string, accent?: string): void {
  const post = accent ?? shade(base, -0.3);
  p(ctx, 7, 9, 2, 6, post);
  p(ctx, 2, 3, 12, 6, base);
  p(ctx, 2, 3, 12, 1, shade(base, 0.22));
  p(ctx, 4, 5, 8, 1, shade(base, -0.15));
  p(ctx, 5, 6, 6, 1, shade(base, -0.12));
}

// --- Redstone / functional blocks -----------------------------------------
function craftingTable(ctx: Ctx, base: string): void {
  block(ctx, base);
  const gap = shade(base, -0.38);
  const cell = shade(base, 0.06);
  for (let gy = 0; gy < 3; gy++) for (let gx = 0; gx < 3; gx++) p(ctx, 3 + gx * 4, 3 + gy * 4, 3, 3, cell);
  p(ctx, 6, 3, 1, 9, gap);
  p(ctx, 10, 3, 1, 9, gap);
  p(ctx, 3, 6, 9, 1, gap);
  p(ctx, 3, 10, 9, 1, gap);
}
function furnace(ctx: Ctx, base: string, accent?: string): void {
  const glow = accent ?? "#e2640f";
  block(ctx, base);
  p(ctx, 5, 3, 6, 1, shade(base, -0.22));
  p(ctx, 4, 7, 8, 6, shade(base, -0.45));
  p(ctx, 5, 8, 6, 4, glow);
  p(ctx, 5, 8, 6, 1, shade(glow, 0.32));
}
function chest(ctx: Ctx, base: string): void {
  const D = shade(base, -0.28);
  p(ctx, 2, 4, 12, 10, base);
  p(ctx, 2, 4, 12, 1, shade(base, 0.15));
  p(ctx, 13, 4, 1, 10, D);
  p(ctx, 2, 13, 12, 1, D);
  p(ctx, 2, 8, 12, 1, D);
  p(ctx, 7, 7, 2, 3, "#cfcfcf");
}
function enderChest(ctx: Ctx, base: string, accent?: string): void {
  const glow = accent ?? "#147a6c";
  p(ctx, 2, 4, 12, 10, base);
  p(ctx, 2, 8, 12, 1, shade(base, -0.3));
  p(ctx, 6, 6, 4, 1, shade(glow, 0.35));
  p(ctx, 7, 7, 2, 3, glow);
}
function tnt(ctx: Ctx, base: string): void {
  block(ctx, base);
  p(ctx, 2, 5, 12, 2, "#f4f4ee");
  p(ctx, 2, 9, 12, 2, "#f4f4ee");
  p(ctx, 3, 6, 10, 1, shade("#f4f4ee", -0.12));
  p(ctx, 3, 10, 10, 1, shade("#f4f4ee", -0.12));
}
function piston(ctx: Ctx, base: string): void {
  p(ctx, 2, 2, 12, 6, base);
  p(ctx, 2, 2, 12, 1, shade(base, 0.2));
  p(ctx, 2, 7, 12, 1, shade(base, -0.25));
  p(ctx, 1, 8, 14, 6, "#9a9a9a");
  p(ctx, 1, 8, 14, 1, shade("#9a9a9a", 0.18));
  p(ctx, 1, 13, 14, 2, shade("#9a9a9a", -0.25));
}
function stickyPiston(ctx: Ctx, base: string, accent?: string): void {
  piston(ctx, base);
  p(ctx, 2, 2, 12, 2, accent ?? "#7aa84f");
  p(ctx, 3, 3, 10, 2, shade(accent ?? "#7aa84f", 0.15));
}
function hopper(ctx: Ctx, base: string): void {
  p(ctx, 2, 3, 12, 2, shade(base, 0.08));
  p(ctx, 3, 5, 10, 3, base);
  p(ctx, 5, 8, 6, 2, base);
  p(ctx, 7, 10, 2, 4, base);
  p(ctx, 2, 3, 12, 1, shade(base, 0.2));
  p(ctx, 7, 13, 2, 1, shade(base, -0.3));
}
function dispenser(ctx: Ctx, base: string): void {
  block(ctx, base);
  p(ctx, 4, 6, 8, 5, shade(base, -0.42));
  p(ctx, 5, 7, 6, 3, shade(base, -0.55));
  p(ctx, 10, 8, 2, 1, "#cfcfcf");
}
function dropper(ctx: Ctx, base: string): void {
  block(ctx, base);
  p(ctx, 5, 3, 6, 2, shade(base, -0.35));
  p(ctx, 6, 5, 4, 6, shade(base, -0.48));
  p(ctx, 7, 11, 2, 2, shade(base, -0.55));
}
function lever(ctx: Ctx, base: string): void {
  p(ctx, 3, 9, 10, 5, "#8a8a8a");
  p(ctx, 3, 9, 10, 1, "#9a9a9a");
  for (let i = 0; i < 6; i++) p(ctx, 4 + i, 8 - i, 2, 2, base);
  p(ctx, 9, 3, 2, 2, shade(base, 0.2));
}
function railIcon(ctx: Ctx, base: string): void {
  const rail = shade(base, 0.25);
  for (const y of [5, 9, 13]) p(ctx, 2, y, 12, 1, shade(base, -0.18));
  p(ctx, 3, 4, 2, 10, rail);
  p(ctx, 11, 4, 2, 10, rail);
  p(ctx, 3, 4, 2, 1, shade(rail, 0.3));
}
function minecart(ctx: Ctx, base: string): void {
  p(ctx, 2, 6, 12, 5, base);
  p(ctx, 3, 5, 10, 1, base);
  p(ctx, 2, 6, 12, 1, shade(base, 0.22));
  p(ctx, 2, 10, 12, 1, shade(base, -0.26));
  p(ctx, 4, 7, 8, 2, shade(base, 0.08));
  p(ctx, 3, 11, 3, 2, "#3a3a3a");
  p(ctx, 10, 11, 3, 2, "#3a3a3a");
}
function bookshelf(ctx: Ctx, base: string, accent?: string): void {
  const spineA = accent ?? "#c0322b";
  const spineB = shade(base, -0.35);
  const spineC = "#1f4ca5";
  p(ctx, 1, 1, 14, 14, base);
  for (const y of [5, 9]) p(ctx, 1, y, 14, 1, shade(base, -0.3));
  const spines: [number, string][] = [[3, spineA], [5, spineB], [7, spineC], [9, spineA], [11, spineB]];
  for (const [x, c] of spines) {
    p(ctx, x, 2, 2, 3, c);
    p(ctx, x, 6, 2, 3, shade(c, 0.08));
    p(ctx, x, 10, 2, 3, c);
  }
}
function glowstoneBlock(ctx: Ctx, base: string): void {
  block(ctx, base);
  for (const [x, y] of [[4, 4], [9, 5], [6, 9], [11, 10], [5, 12]] as const) {
    p(ctx, x, y, 2, 2, shade(base, 0.35));
    p(ctx, x, y, 1, 1, "#fff2b0");
  }
}
function ladder(ctx: Ctx, base: string): void {
  const D = shade(base, -0.25);
  p(ctx, 4, 1, 2, 14, base);
  p(ctx, 10, 1, 2, 14, base);
  for (const y of [3, 6, 9, 12]) p(ctx, 4, y, 8, 1, D);
  p(ctx, 4, 1, 2, 14, shade(base, 0.12));
}
function bed(ctx: Ctx, base: string, accent?: string): void {
  const frame = accent ?? "#9c7a4d";
  p(ctx, 1, 10, 14, 4, frame);
  p(ctx, 2, 5, 12, 6, base);
  p(ctx, 2, 5, 12, 1, shade(base, 0.12));
  p(ctx, 2, 5, 3, 4, "#f4f4ee");
  p(ctx, 13, 5, 1, 6, shade(base, -0.2));
}
function lantern(ctx: Ctx, base: string, accent?: string): void {
  const cage = accent ?? "#9a7a5a";
  const light = base || "#e7c46b";
  p(ctx, 7, 1, 2, 2, cage);
  p(ctx, 5, 3, 6, 1, cage);
  p(ctx, 4, 4, 8, 8, cage);
  p(ctx, 6, 5, 4, 5, light);
  p(ctx, 7, 6, 2, 2, "#fff2b0");
  p(ctx, 5, 12, 6, 1, cage);
}
function redstoneTorch(ctx: Ctx, base: string, accent?: string): void {
  const stick = accent ?? "#9c7a4d";
  p(ctx, 7, 8, 2, 7, stick);
  p(ctx, 6, 3, 4, 5, base);
  p(ctx, 7, 2, 2, 2, shade(base, 0.35));
}
function repeater(ctx: Ctx, base: string, accent?: string): void {
  const rs = accent ?? "#c0322b";
  p(ctx, 2, 6, 12, 7, base);
  p(ctx, 2, 6, 12, 1, shade(base, 0.2));
  p(ctx, 4, 8, 2, 3, rs);
  p(ctx, 10, 8, 2, 3, rs);
  p(ctx, 6, 9, 4, 1, rs);
  p(ctx, 7, 7, 2, 5, shade(base, -0.35));
}
function comparator(ctx: Ctx, base: string, accent?: string): void {
  const rs = accent ?? "#c0322b";
  p(ctx, 2, 6, 12, 7, base);
  p(ctx, 2, 6, 12, 1, shade(base, 0.2));
  p(ctx, 3, 8, 3, 3, rs);
  p(ctx, 10, 8, 3, 3, rs);
  p(ctx, 6, 9, 4, 1, rs);
  p(ctx, 7, 7, 2, 2, shade(base, -0.35));
}
function observer(ctx: Ctx, base: string, accent?: string): void {
  block(ctx, base);
  p(ctx, 4, 4, 8, 8, shade(base, -0.4));
  p(ctx, 6, 6, 4, 4, shade(base, -0.55));
  p(ctx, 7, 7, 2, 2, accent ?? "#c0322b");
}
function torch(ctx: Ctx, base: string): void {
  p(ctx, 7, 7, 2, 8, "#9c7a4d");
  p(ctx, 6, 3, 4, 4, base || "#e7c46b");
  p(ctx, 7, 2, 2, 2, "#fff2b0");
}
function stick(ctx: Ctx, base: string): void {
  const c = base ?? "#9c7a4d";
  for (let i = 0; i < 6; i++) p(ctx, 4 + i, 12 - i, 2, 2, c);
  for (let i = 0; i < 4; i++) p(ctx, 9 + i, 6 - i, 2, 2, c);
}

// --- Transport / liquid ----------------------------------------------------
function liquidBucket(ctx: Ctx, base: string, accent?: string): void {
  const hi = shade(base, 0.24);
  const lo = shade(base, -0.22);
  const dark = shade(base, -0.34);
  p(ctx, 6, 2, 4, 1, base);
  p(ctx, 5, 3, 1, 2, base);
  p(ctx, 10, 3, 1, 2, base);
  p(ctx, 3, 5, 10, 1, base);
  p(ctx, 3, 6, 2, 7, base);
  p(ctx, 11, 6, 2, 7, lo);
  p(ctx, 3, 6, 1, 7, hi);
  p(ctx, 4, 12, 8, 1, dark);
  p(ctx, 5, 13, 6, 1, lo);
  if (accent) {
    p(ctx, 5, 6, 6, 1, shade(accent, 0.3));
    p(ctx, 4, 7, 8, 5, accent);
    p(ctx, 5, 11, 6, 1, shade(accent, -0.22));
    p(ctx, 6, 8, 2, 1, shade(accent, 0.3));
  } else {
    p(ctx, 5, 6, 6, 6, shade(base, -0.48));
    p(ctx, 5, 6, 6, 1, shade(base, -0.55));
  }
}
function ringDial(ctx: Ctx, rim: string): void {
  const ring: [number, number][] = [
    [6, 3], [7, 3], [8, 3], [9, 3], [5, 4], [10, 4], [4, 5], [11, 5], [4, 6], [11, 6],
    [4, 7], [11, 7], [4, 8], [11, 8], [4, 9], [11, 9], [5, 10], [10, 10], [6, 11], [7, 11], [8, 11], [9, 11],
  ];
  for (const [x, y] of ring) p(ctx, x, y, 1, 1, rim);
}
function compass(ctx: Ctx, base: string, accent?: string): void {
  const face = shade(base, 0.42);
  const needle = accent ?? "#c0322b";
  ringDial(ctx, base);
  p(ctx, 6, 4, 4, 1, face);
  p(ctx, 5, 5, 6, 6, face);
  p(ctx, 6, 11, 4, 1, face);
  p(ctx, 7, 7, 2, 2, shade(base, -0.24));
  p(ctx, 9, 5, 1, 1, needle);
  p(ctx, 8, 5, 1, 1, needle);
  p(ctx, 8, 6, 1, 1, shade(needle, 0.2));
  p(ctx, 6, 8, 1, 1, "#888");
  p(ctx, 5, 9, 1, 1, "#777");
}
function clock(ctx: Ctx, base: string): void {
  const face = shade(base, 0.55);
  const hand = shade(base, -0.55);
  ringDial(ctx, base);
  p(ctx, 6, 4, 4, 1, face);
  p(ctx, 5, 5, 6, 6, face);
  p(ctx, 6, 11, 4, 1, face);
  p(ctx, 7, 7, 2, 2, hand);
  p(ctx, 5, 8, 3, 1, hand);
  p(ctx, 8, 4, 1, 4, hand);
}
function liquidBlock(ctx: Ctx, base: string, isLava: boolean): void {
  const side = shade(base, -0.28);
  p(ctx, 1, 7, 14, 8, side);
  p(ctx, 1, 14, 14, 1, shade(base, -0.4));
  p(ctx, 13, 7, 2, 8, shade(base, -0.4));
  p(ctx, 1, 5, 14, 3, base);
  p(ctx, 1, 5, 14, 1, shade(base, 0.32));
  p(ctx, 3, 6, 5, 1, shade(base, 0.32));
  p(ctx, 9, 7, 4, 1, shade(base, -0.12));
  if (isLava) {
    p(ctx, 5, 7, 2, 1, shade(base, 0.45));
    p(ctx, 11, 7, 1, 1, "#ffdd66");
  } else {
    p(ctx, 4, 7, 1, 1, "#ffffff");
    p(ctx, 7, 7, 2, 1, "#ffffff");
  }
}
function sugarCane(ctx: Ctx, base: string): void {
  const joint = shade(base, -0.32);
  for (const [x, y, h] of [[5, 4, 9], [8, 2, 11], [11, 5, 8]] as const) {
    p(ctx, x, y, 2, h, base);
    p(ctx, x, y, 1, h, shade(base, 0.28));
    for (let j = y + 3; j < y + h; j += 4) p(ctx, x, j, 2, 1, joint);
  }
}

// --- 1.21 additions --------------------------------------------------------
function rawCopper(ctx: Ctx, base: string): void {
  const stone = "#6a6a6a";
  p(ctx, 3, 4, 10, 10, stone);
  p(ctx, 3, 4, 10, 1, shade(stone, 0.15));
  p(ctx, 12, 4, 1, 10, shade(stone, -0.18));
  for (const [x, y, w, h] of [[5, 6, 3, 3], [9, 5, 2, 2], [7, 9, 3, 2], [4, 9, 2, 2]] as const) {
    p(ctx, x, y, w, h, base);
    p(ctx, x, y, w, 1, shade(base, 0.28));
  }
}
function copperBulb(ctx: Ctx, base: string, accent?: string): void {
  block(ctx, base);
  p(ctx, 5, 5, 6, 6, shade(base, -0.12));
  p(ctx, 6, 6, 4, 4, accent ?? "#e7c46b");
  p(ctx, 7, 7, 2, 2, "#fff6c8");
}
function amethystShard(ctx: Ctx, base: string): void {
  const L = shade(base, 0.32);
  const D = shade(base, -0.28);
  const spikes: [number, number, number, number, string][] = [
    [7, 2, 2, 5, base], [4, 5, 2, 4, L], [10, 4, 2, 5, base], [6, 8, 2, 3, D], [9, 9, 2, 2, L],
  ];
  for (const [x, y, w, h, c] of spikes) {
    p(ctx, x, y, w, h, c);
    p(ctx, x, y, w, 1, shade(c, 0.25));
  }
  p(ctx, 5, 11, 6, 2, shade(base, -0.35));
  p(ctx, 7, 2, 2, 1, "#d8c8f8");
}
function spyglass(ctx: Ctx, base: string, accent?: string): void {
  const lens = accent ?? "#3a8a8a";
  for (let i = 0; i < 9; i++) p(ctx, 4 + i, 11 - i, 2, 2, base);
  p(ctx, 4, 11, 2, 1, shade(base, 0.25));
  p(ctx, 10, 5, 2, 2, shade(base, -0.22));
  p(ctx, 12, 3, 3, 3, lens);
  p(ctx, 12, 3, 3, 1, shade(lens, 0.35));
  p(ctx, 13, 4, 1, 1, "#a8f0f0");
}
function mace(ctx: Ctx, base: string, accent?: string): void {
  const handle = accent ?? "#7a5a4a";
  p(ctx, 7, 9, 2, 6, handle);
  p(ctx, 7, 9, 1, 6, shade(handle, 0.18));
  p(ctx, 4, 2, 8, 8, base);
  p(ctx, 4, 2, 8, 2, shade(base, 0.2));
  p(ctx, 10, 3, 2, 7, shade(base, -0.22));
  p(ctx, 5, 4, 3, 3, shade(base, -0.15));
  p(ctx, 8, 5, 2, 2, shade(base, 0.15));
}
function breezeRod(ctx: Ctx, base: string): void {
  p(ctx, 7, 2, 2, 12, base);
  p(ctx, 7, 2, 1, 12, shade(base, 0.28));
  const wisp = shade(base, 0.45);
  for (const [x, y] of [[5, 3], [9, 5], [4, 8], [10, 10], [6, 12]] as const) p(ctx, x, y, 2, 2, wisp);
  p(ctx, 7, 2, 2, 2, "#e8fff8");
}
function windCharge(ctx: Ctx, base: string): void {
  const rim = shade(base, -0.18);
  p(ctx, 4, 4, 8, 8, base);
  p(ctx, 5, 3, 6, 1, rim);
  p(ctx, 3, 5, 1, 6, rim);
  p(ctx, 12, 5, 1, 6, rim);
  p(ctx, 5, 12, 6, 1, rim);
  p(ctx, 7, 5, 1, 6, "#ffffff");
  p(ctx, 5, 7, 6, 1, "#ffffff");
  p(ctx, 7, 7, 2, 2, "#f5ffff");
}
function heavyCore(ctx: Ctx, base: string): void {
  p(ctx, 3, 3, 10, 10, base);
  p(ctx, 3, 3, 10, 2, shade(base, 0.18));
  p(ctx, 11, 3, 2, 10, shade(base, -0.2));
  p(ctx, 2, 6, 12, 4, "#7a7a82");
  p(ctx, 2, 6, 12, 1, shade("#7a7a82", 0.22));
  p(ctx, 6, 6, 4, 4, shade(base, -0.35));
  p(ctx, 7, 7, 2, 2, "#1a1820");
}
function tuff(ctx: Ctx, base: string): void {
  block(ctx, base);
  const speck = shade(base, -0.32);
  for (const [x, y] of [[3, 4], [6, 3], [10, 5], [4, 8], [8, 7], [11, 9], [5, 11], [9, 12], [7, 10]] as const)
    p(ctx, x, y, 1, 1, speck);
}
function calcite(ctx: Ctx, base: string): void {
  block(ctx, base);
  const band = shade(base, -0.12);
  for (let i = 0; i < 5; i++) {
    p(ctx, 2 + i * 2, 2 + i, 2, 10, band);
    p(ctx, 3 + i * 2, 3 + i, 1, 8, shade(base, 0.08));
  }
}
function trialKey(ctx: Ctx, base: string): void {
  const dark = shade(base, -0.3);
  p(ctx, 3, 3, 4, 5, base);
  p(ctx, 3, 3, 4, 1, shade(base, 0.28));
  p(ctx, 6, 4, 1, 3, "#2a2418");
  p(ctx, 7, 5, 6, 2, base);
  p(ctx, 7, 5, 6, 1, shade(base, 0.22));
  p(ctx, 10, 7, 2, 1, dark);
  p(ctx, 12, 7, 2, 1, dark);
}

// --- Food ------------------------------------------------------------------
function foodApple(ctx: Ctx, base: string, accent: string | undefined, id: string): void {
  const leaf = accent ?? "#4a7a32";
  p(ctx, 7, 2, 2, 3, shade(base, -0.42));
  p(ctx, 9, 2, 3, 2, leaf);
  const rows: [number, number][] = [[7, 2], [6, 4], [5, 6], [5, 6], [5, 6], [5, 6], [6, 4], [7, 2]];
  rows.forEach(([x, w], i) => p(ctx, x, 5 + i, w, 1, base));
  p(ctx, 6, 6, 2, 5, shade(base, 0.28));
  p(ctx, 9, 9, 2, 2, shade(base, -0.22));
  if (id !== "apple") p(ctx, 8, 6, 2, 1, shade(base, 0.35));
  if (id === "enchanted_golden_apple") {
    p(ctx, 4, 8, 1, 1, "#bf4cc7");
    p(ctx, 11, 7, 1, 1, "#3aafd9");
  }
}
function foodBread(ctx: Ctx, base: string): void {
  p(ctx, 3, 7, 10, 5, base);
  p(ctx, 4, 6, 8, 1, base);
  p(ctx, 5, 5, 6, 1, base);
  p(ctx, 3, 11, 10, 1, shade(base, -0.3));
  p(ctx, 4, 6, 8, 1, shade(base, 0.22));
  p(ctx, 6, 9, 2, 1, shade(base, -0.12));
  p(ctx, 9, 9, 2, 1, shade(base, -0.12));
}
function foodCarrot(ctx: Ctx, base: string, accent?: string): void {
  const top = accent ?? "#4a7a32";
  p(ctx, 7, 2, 2, 1, top);
  p(ctx, 6, 3, 4, 1, top);
  p(ctx, 5, 4, 2, 1, top);
  p(ctx, 9, 4, 2, 1, top);
  p(ctx, 6, 5, 4, 1, base);
  p(ctx, 7, 6, 3, 2, base);
  p(ctx, 8, 8, 2, 2, base);
  p(ctx, 9, 10, 2, 1, shade(base, -0.08));
  p(ctx, 10, 12, 2, 1, shade(base, -0.2));
  p(ctx, 6, 6, 1, 4, shade(base, 0.25));
}
function foodPotato(ctx: Ctx, base: string, id: string): void {
  const baked = id === "baked_potato";
  const spot = shade(base, baked ? -0.38 : -0.16);
  p(ctx, 4, 5, 8, 6, base);
  p(ctx, 5, 4, 6, 1, base);
  p(ctx, 6, 10, 4, 1, shade(base, -0.22));
  p(ctx, 5, 6, 1, 1, spot);
  p(ctx, 9, 7, 1, 1, spot);
  p(ctx, 7, 9, 2, 1, spot);
  p(ctx, 4, 5, 3, 1, shade(base, 0.14));
}
function foodMeatRaw(ctx: Ctx, base: string): void {
  p(ctx, 3, 6, 10, 5, base);
  p(ctx, 4, 5, 8, 1, base);
  p(ctx, 3, 10, 10, 1, shade(base, -0.24));
  p(ctx, 3, 6, 2, 4, shade(base, 0.14));
  p(ctx, 8, 8, 3, 1, shade(base, -0.08));
}
function foodMeatCooked(ctx: Ctx, base: string): void {
  p(ctx, 3, 6, 10, 5, base);
  p(ctx, 4, 5, 8, 1, shade(base, 0.1));
  p(ctx, 3, 10, 10, 1, shade(base, -0.32));
  p(ctx, 4, 7, 8, 1, shade(base, -0.42));
  p(ctx, 4, 9, 8, 1, shade(base, -0.34));
}
function foodFish(ctx: Ctx, base: string, accent?: string): void {
  const fin = accent ?? shade(base, -0.22);
  p(ctx, 4, 6, 7, 4, base);
  p(ctx, 3, 7, 1, 2, base);
  p(ctx, 11, 6, 3, 4, base);
  p(ctx, 12, 5, 2, 1, base);
  p(ctx, 12, 10, 2, 1, base);
  p(ctx, 5, 9, 5, 1, shade(base, 0.14));
  p(ctx, 4, 5, 2, 1, fin);
  p(ctx, 6, 5, 1, 1, "#2a2a2a");
}
function foodCookie(ctx: Ctx, base: string): void {
  const chip = shade(base, -0.35);
  const rows: [number, number][] = [[6, 4], [5, 6], [4, 8], [4, 8], [5, 6], [6, 4]];
  rows.forEach(([x, w], i) => p(ctx, x, 4 + i, w, 1, base));
  p(ctx, 5, 5, 2, 2, shade(base, 0.2));
  for (const [x, y] of [[6, 7], [8, 6], [7, 9], [5, 8], [9, 8]] as const) p(ctx, x, y, 1, 1, chip);
}
function foodMelon(ctx: Ctx, base: string, accent?: string): void {
  const rind = accent ?? shade(base, -0.28);
  p(ctx, 4, 4, 2, 1, rind);
  for (let i = 0; i < 6; i++) p(ctx, 4, 5 + i, 3 + i, 1, base);
  p(ctx, 4, 4, 1, 7, rind);
  for (const [x, y] of [[7, 7], [8, 8], [6, 8], [9, 9]] as const) p(ctx, x, y, 1, 1, shade(base, -0.32));
}
function foodWheat(ctx: Ctx, base: string, accent: string | undefined, id: string): void {
  const stalk = accent ?? "#6aa84f";
  if (id === "wheat_seeds") {
    p(ctx, 6, 7, 4, 1, stalk);
    for (const [x, y] of [[5, 9], [7, 10], [9, 9], [6, 11], [8, 11]] as const) {
      p(ctx, x, y, 2, 2, base);
      p(ctx, x, y, 1, 1, shade(base, 0.2));
    }
    return;
  }
  p(ctx, 7, 11, 2, 3, stalk);
  p(ctx, 6, 10, 1, 2, stalk);
  p(ctx, 9, 10, 1, 2, stalk);
  for (const [x, y] of [[5, 3], [8, 2], [6, 5], [8, 5]] as const) {
    p(ctx, x, y, 2, 2, base);
    p(ctx, x, y, 1, 1, shade(base, 0.22));
  }
}
function foodBerries(ctx: Ctx, base: string, accent?: string): void {
  const leaf = accent ?? "#4a7a32";
  p(ctx, 6, 3, 4, 2, leaf);
  for (const [x, y] of [[5, 6], [8, 6], [6, 8], [9, 8], [7, 10], [5, 10], [10, 7]] as const) {
    p(ctx, x, y, 2, 2, base);
    p(ctx, x, y, 1, 1, shade(base, 0.24));
  }
}
function foodStew(ctx: Ctx, base: string, accent?: string): void {
  const bowl = accent ?? "#8a623b";
  p(ctx, 3, 9, 10, 4, bowl);
  p(ctx, 4, 8, 8, 1, shade(bowl, 0.2));
  p(ctx, 12, 9, 1, 4, shade(bowl, -0.22));
  p(ctx, 4, 9, 8, 3, base);
  p(ctx, 5, 9, 6, 1, shade(base, 0.14));
  p(ctx, 6, 10, 2, 1, shade(base, -0.16));
}
function food(ctx: Ctx, base: string): void {
  const rows: [number, number][] = [[6, 4], [4, 8], [3, 10], [3, 10], [3, 10], [4, 8], [5, 6]];
  rows.forEach(([x, w], i) => p(ctx, x, 4 + i, w, 1, base));
  p(ctx, 5, 5, 2, 2, shade(base, 0.35));
}

// --- Archetype dispatch ----------------------------------------------------
function archetype(def: ItemDef): string {
  const id = def.id.replace(/^.*:/, "");

  // 1.21 + special single items (before generic suffix rules)
  if (id === "spyglass") return "spyglass";
  if (id === "mace") return "mace";
  if (id === "trial_key") return "trialKey";
  if (id === "wind_charge") return "windCharge";
  if (id === "heavy_core") return "heavyCore";
  if (id === "copper_bulb") return "copperBulb";
  if (id === "amethyst_shard") return "amethystShard";
  if (id === "raw_copper") return "rawCopper";
  if (id === "copper_block") return "metalBlock";
  if (id === "amethyst_block") return "metalBlock";
  if (id === "tuff") return "tuff";
  if (id === "calcite") return "calcite";
  if (id === "breeze_rod") return "breezeRod";

  // Tools / weapons / armor
  if (def.tool || /^(bow|arrow|shield|trident|fishing_rod|shears|flint_and_steel)$/.test(id)) return "tool";

  // Metals / minerals
  if (/_ingot$/.test(id)) return "ingot";
  if (/_nugget$/.test(id)) return "nugget";
  if (/^netherite_scrap$/.test(id)) return "scrap";
  if (/^ancient_debris$/.test(id)) return "debris";
  if (/^raw_/.test(id)) return "rawLump";
  if (/_ore$/.test(id)) return "ore";
  if (/^blaze_rod$/.test(id)) return "rod";
  if (/^coal$|^charcoal$/.test(id)) return "coalLump";
  if (/^flint$/.test(id)) return "flintChip";
  if (/^quartz$/.test(id)) return "quartzShard";
  if (/^lapis_lazuli$/.test(id)) return "gemShard";
  if (/^diamond$|^emerald$/.test(id)) return "gem";

  // Loose drops
  if (/^ender_pearl$|^snowball$|^slime_ball$|^magma_cream$|^clay_ball$/.test(id)) return "orb";
  if (/^egg$/.test(id)) return "egg";
  if (/^ghast_tear$/.test(id)) return "teardrop";
  if (/^prismarine_crystals$|^heart_of_the_sea$/.test(id)) return "crystal";
  if (/^prismarine_shard$/.test(id)) return "shard";
  if (/^scute$/.test(id)) return "scute";
  if (/^nautilus_shell$/.test(id)) return "shell";
  if (/^nether_wart$/.test(id)) return "cluster";
  if (/^bone$/.test(id)) return "bone";
  if (/^feather$/.test(id)) return "feather";
  if (/^string$/.test(id)) return "string";
  if (/^paper$/.test(id)) return "sheet";
  if (/^book$/.test(id)) return "book";
  if (/^leather$/.test(id)) return "leather";
  if (/^spider_eye$|^ender_eye$/.test(id)) return "eye";

  // Dust / powders
  if (/_dust$|^redstone$|^gunpowder$|^sugar$|_dye$|blaze_powder|bone_meal/.test(id)) return "dust";

  // Brewing / potions / utility items
  if (/^glass_bottle$/.test(id)) return "emptyFlask";
  if (/^splash_potion$/.test(id)) return "splashFlask";
  if (/^experience_bottle$/.test(id)) return "xpFlask";
  if (/^potion$/.test(id)) return "potionFlask";
  if (/^brewing_stand$/.test(id)) return "brewingStand";
  if (/^cauldron$/.test(id)) return "cauldron";
  if (/^fermented_spider_eye$/.test(id)) return "fermentedEye";
  if (/^fire_charge$/.test(id)) return "fireCharge";
  if (/^totem_of_undying$/.test(id)) return "totem";
  if (/^name_tag$/.test(id)) return "nameTag";
  if (/^lead$/.test(id)) return "lead";
  if (/^map$/.test(id)) return "mapRoll";

  // Transport / liquids
  if (/^compass$/.test(id)) return "compass";
  if (/^clock$/.test(id)) return "clock";
  if (/^minecart$/.test(id)) return "minecart";
  if (/^water$|^lava$/.test(id)) return "liquid";
  if (/^sugar_cane$/.test(id)) return "cane";
  if (/bucket$/.test(id)) return "bucket";

  // Thin items
  if (/^stick$/.test(id)) return "stick";
  if (/^redstone_torch$/.test(id)) return "redstoneTorch";
  if (/^torch$/.test(id)) return "torch";

  // Food (specific shapes, then category fallback)
  if (/^apple$|^golden_apple$|^enchanted_golden_apple$/.test(id)) return "foodApple";
  if (/^bread$/.test(id)) return "foodBread";
  if (/^cookie$/.test(id)) return "foodCookie";
  if (/^carrot$/.test(id)) return "foodCarrot";
  if (/^potato$|^baked_potato$/.test(id)) return "foodPotato";
  if (/^cooked_beef$|^cooked_porkchop$|^cooked_chicken$/.test(id)) return "foodMeatCooked";
  if (/^beef$|^porkchop$|^chicken$/.test(id)) return "foodMeatRaw";
  if (/^cod$|^cooked_cod$|^salmon$|^cooked_salmon$/.test(id)) return "foodFish";
  if (/^melon_slice$/.test(id)) return "foodMelon";
  if (/^wheat$|^wheat_seeds$/.test(id)) return "foodWheat";
  if (/^sweet_berries$/.test(id)) return "foodBerries";
  if (/^mushroom_stew$/.test(id)) return "foodStew";
  if (def.category === "food") return "food";

  // Wood set
  if (/_sapling$/.test(id)) return "sapling";
  if (/_leaves$/.test(id)) return "leaves";
  if (/_pressure_plate$/.test(id)) return "pressurePlate";
  if (/_trapdoor$/.test(id)) return "trapdoor";
  if (/_button$/.test(id)) return "button";
  if (/_sign$/.test(id)) return "sign";
  if (/_stairs$/.test(id)) return "stairs";
  if (/_fence$/.test(id)) return "fence";
  if (/_slab$/.test(id)) return "slab";
  if (/_planks$/.test(id)) return "planks";
  if (/_log$|^bamboo$/.test(id)) return "log";
  if (/_wood$/.test(id)) return "wood";
  if (/_door$/.test(id)) return "door";
  if (/_boat$/.test(id)) return "boat";

  // Functional blocks
  if (/^crafting_table$/.test(id)) return "craftingTable";
  if (/^furnace$/.test(id)) return "furnace";
  if (/^ender_chest$/.test(id)) return "enderChest";
  if (/^chest$/.test(id)) return "chest";
  if (/^tnt$/.test(id)) return "tnt";
  if (/^sticky_piston$/.test(id)) return "stickyPiston";
  if (/^piston$/.test(id)) return "piston";
  if (/^hopper$/.test(id)) return "hopper";
  if (/^dispenser$/.test(id)) return "dispenser";
  if (/^dropper$/.test(id)) return "dropper";
  if (/^lever$/.test(id)) return "lever";
  if (/^rail$/.test(id)) return "rail";
  if (/^repeater$/.test(id)) return "repeater";
  if (/^comparator$/.test(id)) return "comparator";
  if (/^observer$/.test(id)) return "observer";
  if (/^bookshelf$/.test(id)) return "bookshelf";
  if (/^glowstone$/.test(id)) return "glowstone";
  if (/^ladder$/.test(id)) return "ladder";
  if (/^bed$/.test(id)) return "bed";
  if (/lantern$/.test(id)) return "lantern";

  // Building blocks
  if (/^brick$/.test(id)) return "brickItem";
  if (/^cobblestone$/.test(id)) return "cobble";
  if (/^stone_bricks$|^nether_bricks$/.test(id)) return "stoneBrick";
  if (/^bricks$/.test(id)) return "bricks";
  if (/^grass_block$/.test(id)) return "grass";
  if (/^sand$|^red_sand$|^gravel$/.test(id)) return "speckle";
  if (/^glass$/.test(id)) return "glass";
  if (/^obsidian$/.test(id)) return "obsidian";
  if (/^hay_block$/.test(id)) return "hay";
  if (/^pumpkin$/.test(id)) return "pumpkin";
  if (/^(lapis_block|iron_block|gold_block|diamond_block|emerald_block|redstone_block)$/.test(id)) return "metalBlock";
  if (/_wool$|_concrete$/.test(id)) return "bevel";

  return "block";
}

export function drawItemIcon(ctx: Ctx, def: ItemDef): void {
  ctx.clearRect(0, 0, ICON, ICON);
  const base = def.color ?? "#9a9a9a";
  const accent = def.accent;
  const id = def.id.replace(/^.*:/, "");
  switch (archetype(def)) {
    case "tool": return tool(ctx, def);
    case "ingot": return ingot(ctx, base);
    case "nugget": return nugget(ctx, base);
    case "scrap": return scrap(ctx, base);
    case "debris": return debris(ctx, base);
    case "rawLump": return rawLump(ctx, base);
    case "rawCopper": return rawCopper(ctx, base);
    case "ore": return ore(ctx, base);
    case "rod": return rod(ctx, base);
    case "coalLump": return coalLump(ctx, base);
    case "flintChip": return flintChip(ctx, base);
    case "quartzShard": return quartzShard(ctx, base);
    case "gemShard": return gemShard(ctx, base);
    case "gem": return gem(ctx, base);
    case "dust": return dust(ctx, base);
    case "orb": return orb(ctx, base, accent);
    case "egg": return egg(ctx, base);
    case "teardrop": return teardrop(ctx, base);
    case "crystal": return crystal(ctx, base);
    case "shard": return shardItem(ctx, base);
    case "scute": return scuteItem(ctx, base);
    case "shell": return shell(ctx, base);
    case "cluster": return cluster(ctx, base);
    case "bone": return boneItem(ctx, base);
    case "feather": return feather(ctx, base, accent);
    case "string": return stringItem(ctx, base);
    case "sheet": return sheet(ctx, base);
    case "book": return bookItem(ctx, base, accent);
    case "leather": return leatherPatch(ctx, base);
    case "eye": return eyeItem(ctx, base, accent);
    case "emptyFlask": return emptyFlask(ctx, base);
    case "splashFlask": return flask(ctx, base, accent, true);
    case "xpFlask": return xpFlask(ctx, base);
    case "potionFlask": return flask(ctx, base, accent, false);
    case "brewingStand": return brewingStand(ctx, base);
    case "cauldron": return cauldron(ctx, base);
    case "fermentedEye": return fermentedEye(ctx, base);
    case "fireCharge": return fireCharge(ctx, base);
    case "totem": return totem(ctx, base, accent);
    case "nameTag": return nameTag(ctx, base, accent);
    case "lead": return lead(ctx, base, accent);
    case "mapRoll": return mapRoll(ctx, base, accent);
    case "compass": return compass(ctx, base, accent);
    case "clock": return clock(ctx, base);
    case "minecart": return minecart(ctx, base);
    case "liquid": return liquidBlock(ctx, base, id === "lava");
    case "cane": return sugarCane(ctx, base);
    case "bucket": return liquidBucket(ctx, base, accent);
    case "stick": return stick(ctx, base);
    case "redstoneTorch": return redstoneTorch(ctx, base, accent);
    case "torch": return torch(ctx, base);
    case "foodApple": return foodApple(ctx, base, accent, id);
    case "foodBread": return foodBread(ctx, base);
    case "foodCookie": return foodCookie(ctx, base);
    case "foodCarrot": return foodCarrot(ctx, base, accent);
    case "foodPotato": return foodPotato(ctx, base, id);
    case "foodMeatCooked": return foodMeatCooked(ctx, base);
    case "foodMeatRaw": return foodMeatRaw(ctx, base);
    case "foodFish": return foodFish(ctx, base, accent);
    case "foodMelon": return foodMelon(ctx, base, accent);
    case "foodWheat": return foodWheat(ctx, base, accent, id);
    case "foodBerries": return foodBerries(ctx, base, accent);
    case "foodStew": return foodStew(ctx, base, accent);
    case "food": return food(ctx, base);
    case "sapling": return sapling(ctx, base, accent);
    case "leaves": return leaves(ctx, base);
    case "pressurePlate": return pressurePlate(ctx, base);
    case "trapdoor": return trapdoor(ctx, base, accent);
    case "button": return button(ctx, base);
    case "sign": return sign(ctx, base, accent);
    case "stairs": return stairs(ctx, base);
    case "fence": return fence(ctx, base);
    case "slab": return slab(ctx, base);
    case "planks": return planks(ctx, base);
    case "log": return log(ctx, base, accent);
    case "wood": return woodLog(ctx, base, accent);
    case "door": return door(ctx, base, accent);
    case "boat": return boat(ctx, base);
    case "craftingTable": return craftingTable(ctx, base);
    case "furnace": return furnace(ctx, base, accent);
    case "enderChest": return enderChest(ctx, base, accent);
    case "chest": return chest(ctx, base);
    case "tnt": return tnt(ctx, base);
    case "stickyPiston": return stickyPiston(ctx, base, accent);
    case "piston": return piston(ctx, base);
    case "hopper": return hopper(ctx, base);
    case "dispenser": return dispenser(ctx, base);
    case "dropper": return dropper(ctx, base);
    case "lever": return lever(ctx, base);
    case "rail": return railIcon(ctx, base);
    case "repeater": return repeater(ctx, base, accent);
    case "comparator": return comparator(ctx, base, accent);
    case "observer": return observer(ctx, base, accent);
    case "bookshelf": return bookshelf(ctx, base, accent);
    case "glowstone": return glowstoneBlock(ctx, base);
    case "ladder": return ladder(ctx, base);
    case "bed": return bed(ctx, base, accent);
    case "lantern": return lantern(ctx, base, accent);
    case "spyglass": return spyglass(ctx, base, accent);
    case "mace": return mace(ctx, base, accent);
    case "trialKey": return trialKey(ctx, base);
    case "windCharge": return windCharge(ctx, base);
    case "heavyCore": return heavyCore(ctx, base);
    case "copperBulb": return copperBulb(ctx, base, accent);
    case "amethystShard": return amethystShard(ctx, base);
    case "breezeRod": return breezeRod(ctx, base);
    case "tuff": return tuff(ctx, base);
    case "calcite": return calcite(ctx, base);
    case "cobble": return cobble(ctx, base);
    case "stoneBrick": return stoneBrick(ctx, base);
    case "bricks": return brickRows(ctx, base);
    case "brickItem": return brickItem(ctx, base);
    case "grass": return grassBlock(ctx, base, accent);
    case "speckle": return speckle(ctx, base);
    case "glass": return glassPane(ctx, base);
    case "obsidian": return obsidianBlock(ctx, base);
    case "hay": return hayBlock(ctx, base);
    case "pumpkin": return pumpkinBlock(ctx, base);
    case "metalBlock": return metalBlock(ctx, base);
    case "bevel": return bevel(ctx, base);
    default: return block(ctx, base);
  }
}

const canvasCache = new Map<string, HTMLCanvasElement>();
const dataUrlCache = new Map<string, string>();

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

export function itemIconDataUrl(def: ItemDef): string {
  const cached = dataUrlCache.get(def.id);
  if (cached) return cached;
  const url = itemIconCanvas(def).toDataURL();
  dataUrlCache.set(def.id, url);
  return url;
}
