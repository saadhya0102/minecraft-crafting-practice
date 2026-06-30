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
  const tex: [number, number, number][] = [
    [3, 4, -0.14], [6, 3, 0.1], [9, 5, -0.1], [11, 8, 0.08], [4, 9, 0.12], [7, 7, -0.08],
    [10, 11, -0.16], [5, 12, 0.06], [12, 4, -0.12], [8, 10, 0.1], [3, 11, -0.1], [11, 6, 0.14],
  ];
  for (const [x, y, s] of tex) p(ctx, x, y, 1, 1, shade(base, s));
  p(ctx, 2, 2, 2, 1, shade(base, 0.08));
  p(ctx, 12, 12, 2, 2, shade(base, -0.1));
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
  p(ctx, 2, 7, 12, 1, shade(base, -0.1));
  const grassTex: [number, number, number][] = [
    [3, 2, 0.14], [7, 3, -0.1], [11, 2, 0.1], [5, 5, -0.12], [10, 5, 0.08], [4, 4, 0.06],
  ];
  for (const [x, y, s] of grassTex) p(ctx, x, y, 1, 1, shade(base, s));
  for (const [x, y] of [[3, 9], [8, 10], [12, 11], [5, 12], [10, 13], [4, 8]] as const)
    p(ctx, x, y, 1, 1, shade(dirt, -0.16));
  p(ctx, 1, 1, 14, 1, shade(base, 0.2));
  p(ctx, 1, 1, 1, 6, shade(base, 0.1));
  p(ctx, 14, 1, 1, 13, shade(dirt, -0.14));
  p(ctx, 1, 14, 14, 1, shade(dirt, -0.26));
  p(ctx, 2, 8, 11, 1, shade(dirt, 0.08));
}
function speckle(ctx: Ctx, base: string): void {
  block(ctx, base);
  const pts: [number, number, number][] = [
    [3, 4, -0.22], [6, 3, 0.14], [10, 5, -0.16], [12, 8, 0.1], [4, 8, 0.12], [7, 10, -0.18],
    [9, 12, -0.1], [11, 7, 0.16], [5, 11, -0.14], [8, 6, 0.08], [13, 11, -0.2], [2, 10, 0.06],
    [3, 7, -0.12], [10, 10, 0.1], [6, 12, -0.16], [12, 4, 0.08],
  ];
  for (const [x, y, s] of pts) p(ctx, x, y, 1, 1, shade(base, s));
}
function glassPane(ctx: Ctx, base: string): void {
  const dark = shade(base, -0.2);
  const mid = shade(base, 0.06);
  const bright = shade(base, 0.22);
  p(ctx, 1, 1, 14, 14, dark);
  p(ctx, 2, 2, 12, 12, mid);
  p(ctx, 3, 3, 10, 10, bright);
  p(ctx, 1, 1, 14, 2, "#ffffff");
  p(ctx, 1, 1, 2, 14, "#ffffff");
  p(ctx, 2, 2, 1, 12, shade(base, 0.38));
  p(ctx, 2, 1, 12, 1, shade(base, 0.38));
  p(ctx, 1, 13, 14, 2, shade(base, -0.28));
  p(ctx, 13, 1, 2, 14, shade(base, -0.22));
  p(ctx, 4, 4, 2, 7, "#ffffff");
  p(ctx, 5, 5, 1, 5, shade(base, 0.45));
  p(ctx, 10, 9, 2, 2, shade(base, 0.15));
  p(ctx, 8, 6, 1, 2, shade(base, 0.25));
}
function obsidianBlock(ctx: Ctx, base: string): void {
  p(ctx, 1, 1, 14, 14, base);
  p(ctx, 1, 1, 14, 2, shade(base, 0.1));
  p(ctx, 1, 1, 2, 14, shade(base, 0.06));
  p(ctx, 1, 13, 14, 2, shade(base, -0.28));
  p(ctx, 13, 1, 2, 14, shade(base, -0.22));
  const glint = shade(base, 0.55);
  const glintLo = shade(base, 0.28);
  for (const [x, y] of [[4, 3], [9, 2], [6, 7], [11, 10], [3, 9], [8, 4], [12, 6]] as const)
    p(ctx, x, y, 1, 1, glintLo);
  p(ctx, 4, 4, 1, 1, glint);
  p(ctx, 10, 3, 1, 1, glint);
  p(ctx, 7, 8, 1, 1, glint);
  p(ctx, 11, 11, 1, 1, glint);
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
  p(ctx, 1, 1, 14, 14, stone);
  p(ctx, 1, 1, 14, 2, shade(stone, 0.2));
  p(ctx, 1, 1, 2, 14, shade(stone, 0.12));
  p(ctx, 1, 13, 14, 2, shade(stone, -0.24));
  p(ctx, 13, 1, 2, 14, shade(stone, -0.16));
  const speck: [number, number, number][] = [
    [4, 4, -0.1], [8, 3, 0.08], [11, 6, -0.12], [3, 10, 0.06], [9, 11, -0.08], [12, 12, 0.1],
  ];
  for (const [x, y, s] of speck) p(ctx, x, y, 1, 1, shade(stone, s));
  for (const [x, y] of [[4, 4], [9, 3], [5, 9], [10, 10], [11, 6]] as const) {
    p(ctx, x, y, 2, 2, base);
    p(ctx, x, y, 1, 1, shade(base, 0.32));
    p(ctx, x + 1, y + 1, 1, 1, shade(base, -0.18));
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
  const L = shade(base, 0.32);
  const D = shade(base, -0.26);
  const M = shade(base, -0.1);
  p(ctx, 7, 1, 2, 2, L);
  p(ctx, 7, 3, 2, 8, base);
  p(ctx, 7, 3, 1, 7, shade(L, 0.14));
  p(ctx, 9, 4, 1, 6, D);
  p(ctx, 6, 5, 1, 5, M);
  p(ctx, 6, 10, 4, 2, base);
  p(ctx, 6, 11, 3, 1, D);
  p(ctx, 9, 11, 2, 1, shade(D, -0.08));
  p(ctx, 4, 6, 2, 5, shade(base, 0.04));
  p(ctx, 4, 6, 1, 4, L);
  p(ctx, 5, 10, 2, 1, D);
  p(ctx, 4, 5, 2, 1, base);
  p(ctx, 10, 7, 2, 3, M);
  p(ctx, 10, 7, 1, 2, L);
  p(ctx, 11, 9, 1, 1, D);
}
function gemShard(ctx: Ctx, base: string): void {
  const L = shade(base, 0.3);
  const D = shade(base, -0.28);
  const V = shade(base, -0.12);
  p(ctx, 3, 3, 5, 5, base);
  p(ctx, 3, 3, 5, 1, L);
  p(ctx, 3, 3, 1, 5, shade(L, 0.08));
  p(ctx, 7, 5, 1, 3, D);
  p(ctx, 6, 5, 4, 4, shade(base, 0.06));
  p(ctx, 6, 5, 4, 1, L);
  p(ctx, 9, 6, 1, 3, D);
  p(ctx, 4, 9, 3, 3, V);
  p(ctx, 4, 9, 3, 1, shade(V, 0.2));
  p(ctx, 4, 11, 3, 1, D);
  p(ctx, 9, 8, 3, 4, base);
  p(ctx, 9, 8, 3, 1, L);
  p(ctx, 11, 9, 1, 3, D);
  p(ctx, 7, 10, 2, 2, shade(base, 0.1));
  p(ctx, 7, 10, 1, 1, shade(base, 0.36));
  p(ctx, 10, 4, 2, 2, V);
  p(ctx, 10, 4, 1, 1, L);
  p(ctx, 2, 7, 2, 1, D);
}
function dust(ctx: Ctx, base: string): void {
  const L = shade(base, 0.26);
  const Hi = shade(base, 0.42);
  const D = shade(base, -0.2);
  const Lo = shade(base, -0.32);
  p(ctx, 4, 12, 8, 1, Lo);
  p(ctx, 3, 11, 2, 1, D);
  p(ctx, 11, 11, 2, 1, D);
  p(ctx, 5, 9, 7, 2, base);
  p(ctx, 6, 7, 5, 2, base);
  p(ctx, 7, 6, 3, 1, L);
  p(ctx, 4, 10, 2, 2, shade(base, -0.06));
  p(ctx, 11, 9, 2, 2, shade(base, -0.1));
  p(ctx, 5, 8, 2, 1, L);
  p(ctx, 7, 6, 2, 1, Hi);
  p(ctx, 8, 7, 1, 1, Hi);
  p(ctx, 9, 8, 2, 1, D);
  p(ctx, 6, 9, 1, 1, Lo);
  p(ctx, 3, 8, 1, 1, shade(base, 0.14));
  p(ctx, 12, 8, 1, 1, shade(base, -0.08));
  p(ctx, 2, 10, 1, 1, D);
  p(ctx, 10, 6, 1, 1, L);
  p(ctx, 13, 10, 1, 1, shade(base, 0.08));
  p(ctx, 4, 6, 1, 1, shade(base, 0.18));
  p(ctx, 9, 12, 1, 1, Lo);
  p(ctx, 5, 5, 1, 1, Hi);
  p(ctx, 8, 5, 2, 1, shade(base, 0.1));
}

// --- Loose drops -----------------------------------------------------------
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
  const L = shade(base, 0.24);
  const D = shade(base, -0.26);
  p(ctx, 1, 6, 1, 4, L);
  p(ctx, 2, 5, 4, 1, L);
  p(ctx, 2, 6, 4, 4, base);
  p(ctx, 5, 7, 1, 2, base);
  p(ctx, 2, 10, 4, 1, D);
  p(ctx, 1, 9, 1, 1, D);
  p(ctx, 10, 5, 4, 1, L);
  p(ctx, 10, 6, 4, 4, base);
  p(ctx, 14, 6, 1, 4, D);
  p(ctx, 10, 10, 4, 1, D);
  p(ctx, 14, 9, 1, 1, D);
  p(ctx, 6, 7, 4, 2, base);
  p(ctx, 6, 8, 4, 1, D);
  p(ctx, 2, 6, 2, 2, L);
  p(ctx, 11, 6, 2, 2, L);
  p(ctx, 3, 7, 1, 2, L);
}
function feather(ctx: Ctx, base: string, accent?: string): void {
  const shaft = accent ?? shade(base, -0.42);
  const hi = shade(base, 0.26);
  const lo = shade(base, -0.12);
  for (let y = 3; y <= 12; y++) p(ctx, y < 8 ? 7 : 8, y, 1, 1, shaft);
  p(ctx, 7, 13, 2, 1, shaft);
  p(ctx, 5, 3, 4, 1, hi);
  p(ctx, 4, 4, 8, 1, base);
  p(ctx, 3, 5, 10, 1, base);
  p(ctx, 3, 6, 10, 1, base);
  p(ctx, 3, 7, 10, 1, base);
  p(ctx, 3, 8, 10, 1, base);
  p(ctx, 4, 9, 9, 1, base);
  p(ctx, 4, 10, 8, 1, lo);
  p(ctx, 5, 11, 6, 1, lo);
  p(ctx, 6, 12, 4, 1, lo);
  p(ctx, 2, 6, 1, 3, hi);
  p(ctx, 13, 5, 1, 4, lo);
  p(ctx, 5, 4, 2, 1, hi);
  p(ctx, 10, 3, 2, 1, hi);
}
function stringItem(ctx: Ctx, base: string): void {
  const hi = shade(base, 0.2);
  const lo = shade(base, -0.16);
  p(ctx, 5, 3, 5, 1, hi);
  p(ctx, 4, 4, 1, 2, base);
  p(ctx, 10, 4, 1, 3, base);
  p(ctx, 3, 5, 1, 3, base);
  p(ctx, 11, 6, 1, 2, lo);
  p(ctx, 4, 7, 1, 1, base);
  p(ctx, 5, 7, 6, 1, lo);
  p(ctx, 4, 8, 1, 2, base);
  p(ctx, 11, 8, 1, 2, base);
  p(ctx, 5, 10, 1, 2, base);
  p(ctx, 10, 10, 1, 2, base);
  p(ctx, 6, 12, 4, 1, lo);
  p(ctx, 2, 6, 2, 1, hi);
  p(ctx, 12, 4, 2, 1, hi);
  p(ctx, 7, 5, 2, 1, hi);
  p(ctx, 8, 9, 1, 2, hi);
  p(ctx, 3, 9, 2, 1, lo);
}
function sheet(ctx: Ctx, base: string): void {
  const L = shade(base, 0.22);
  const D = shade(base, -0.2);
  p(ctx, 3, 2, 8, 1, L);
  p(ctx, 4, 3, 9, 1, L);
  p(ctx, 4, 4, 10, 9, base);
  p(ctx, 3, 3, 1, 10, L);
  p(ctx, 13, 4, 1, 10, D);
  p(ctx, 14, 5, 1, 8, D);
  p(ctx, 5, 13, 9, 1, D);
  p(ctx, 11, 4, 2, 2, shade(base, -0.06));
  p(ctx, 12, 5, 1, 1, D);
  p(ctx, 7, 5, 1, 7, shade(base, -0.08));
  p(ctx, 9, 6, 1, 5, shade(base, -0.05));
}
function bookItem(ctx: Ctx, base: string, accent?: string): void {
  const cover = shade(base, -0.12);
  const pages = accent ?? "#f4f4ee";
  const strap = shade(base, -0.35);
  const pageLine = shade(pages, -0.12);
  p(ctx, 3, 2, 10, 11, cover);
  p(ctx, 3, 2, 2, 11, shade(base, -0.28));
  p(ctx, 5, 3, 7, 9, pages);
  p(ctx, 5, 3, 7, 1, shade(pages, 0.1));
  p(ctx, 6, 5, 1, 6, pageLine);
  p(ctx, 8, 4, 1, 5, pageLine);
  p(ctx, 10, 5, 1, 4, pageLine);
  p(ctx, 3, 2, 10, 1, shade(cover, 0.24));
  p(ctx, 11, 2, 1, 11, shade(cover, -0.22));
  p(ctx, 3, 12, 10, 1, shade(cover, -0.18));
  p(ctx, 2, 7, 12, 2, strap);
  p(ctx, 2, 7, 12, 1, shade(strap, 0.18));
  p(ctx, 2, 8, 12, 1, shade(strap, -0.2));
  p(ctx, 8, 7, 2, 2, shade(base, 0.12));
  p(ctx, 8, 7, 2, 1, shade(base, 0.32));
}
function leatherPatch(ctx: Ctx, base: string): void {
  const L = shade(base, 0.2);
  const D = shade(base, -0.28);
  const M = shade(base, -0.1);
  p(ctx, 4, 3, 8, 1, L);
  p(ctx, 3, 4, 1, 2, L);
  p(ctx, 12, 4, 1, 2, base);
  p(ctx, 2, 6, 12, 6, base);
  p(ctx, 3, 12, 1, 1, base);
  p(ctx, 4, 13, 8, 1, D);
  p(ctx, 12, 11, 1, 2, D);
  p(ctx, 12, 3, 2, 2, L);
  p(ctx, 13, 4, 1, 1, D);
  p(ctx, 2, 11, 2, 2, M);
  p(ctx, 1, 10, 1, 1, D);
  p(ctx, 6, 6, 2, 2, M);
  p(ctx, 8, 8, 3, 1, D);
  p(ctx, 5, 9, 2, 1, M);
  p(ctx, 3, 4, 10, 1, L);
  p(ctx, 11, 4, 1, 8, D);
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
  const band = shade(base, -0.24);
  const D = shade(base, -0.34);
  const L = shade(base, 0.22);
  p(ctx, 7, 3, 4, 1, base);
  p(ctx, 6, 4, 6, 1, base);
  p(ctx, 5, 5, 8, 1, base);
  p(ctx, 4, 6, 9, 1, base);
  p(ctx, 4, 7, 9, 2, base);
  p(ctx, 5, 9, 7, 1, base);
  p(ctx, 6, 10, 5, 1, base);
  p(ctx, 7, 11, 3, 1, base);
  p(ctx, 9, 4, 4, 6, base);
  p(ctx, 10, 3, 3, 2, base);
  p(ctx, 11, 5, 2, 5, base);
  p(ctx, 3, 8, 2, 3, D);
  p(ctx, 4, 9, 1, 2, shade(base, -0.46));
  p(ctx, 6, 9, 4, 1, band);
  p(ctx, 7, 8, 3, 1, band);
  p(ctx, 8, 7, 3, 1, band);
  p(ctx, 9, 6, 2, 1, band);
  p(ctx, 10, 5, 2, 1, band);
  p(ctx, 9, 8, 2, 1, band);
  p(ctx, 10, 3, 2, 1, L);
  p(ctx, 6, 4, 3, 1, L);
  p(ctx, 11, 5, 1, 4, D);
}
function scuteItem(ctx: Ctx, base: string): void {
  const L = shade(base, 0.26);
  const D = shade(base, -0.3);
  const ridge = shade(base, -0.12);
  p(ctx, 6, 3, 4, 1, base);
  p(ctx, 5, 4, 6, 1, base);
  p(ctx, 4, 5, 8, 1, base);
  p(ctx, 4, 6, 8, 2, base);
  p(ctx, 5, 8, 6, 1, base);
  p(ctx, 6, 9, 4, 1, base);
  p(ctx, 7, 10, 2, 1, base);
  p(ctx, 6, 4, 4, 1, L);
  p(ctx, 7, 5, 2, 3, L);
  p(ctx, 7, 6, 1, 2, ridge);
  p(ctx, 4, 7, 8, 1, D);
  p(ctx, 5, 8, 6, 1, D);
  p(ctx, 11, 5, 1, 4, D);
  p(ctx, 4, 5, 1, 3, shade(base, -0.15));
}
function shardItem(ctx: Ctx, base: string): void {
  const L = shade(base, 0.34);
  const D = shade(base, -0.28);
  const hi = shade(base, 0.5);
  p(ctx, 8, 2, 4, 2, base);
  p(ctx, 7, 4, 5, 2, base);
  p(ctx, 6, 6, 6, 2, base);
  p(ctx, 5, 8, 5, 2, base);
  p(ctx, 5, 10, 4, 2, base);
  p(ctx, 6, 12, 3, 1, base);
  p(ctx, 7, 13, 2, 1, D);
  p(ctx, 8, 2, 3, 1, L);
  p(ctx, 7, 2, 1, 1, hi);
  p(ctx, 6, 6, 3, 1, L);
  p(ctx, 5, 10, 2, 1, D);
  p(ctx, 9, 4, 2, 4, shade(base, -0.12));
}
function crystal(ctx: Ctx, base: string): void {
  const L = shade(base, 0.38);
  const D = shade(base, -0.28);
  const hi = shade(base, 0.55);
  p(ctx, 6, 3, 2, 1, base);
  p(ctx, 9, 3, 2, 1, base);
  p(ctx, 5, 4, 6, 1, base);
  p(ctx, 5, 5, 6, 1, base);
  p(ctx, 5, 6, 6, 1, base);
  p(ctx, 6, 7, 4, 1, base);
  p(ctx, 7, 8, 2, 1, base);
  p(ctx, 8, 9, 1, 1, base);
  p(ctx, 6, 4, 2, 2, L);
  p(ctx, 6, 4, 1, 1, hi);
  p(ctx, 9, 6, 2, 2, D);
  p(ctx, 7, 1, 2, 2, base);
  p(ctx, 7, 1, 1, 1, L);
  p(ctx, 3, 5, 2, 3, base);
  p(ctx, 3, 5, 1, 2, L);
  p(ctx, 11, 6, 2, 3, base);
  p(ctx, 12, 7, 1, 2, D);
  p(ctx, 4, 10, 2, 2, base);
  p(ctx, 4, 10, 1, 1, shade(base, 0.2));
  p(ctx, 10, 10, 2, 2, base);
  p(ctx, 11, 10, 1, 1, D);
}
function teardrop(ctx: Ctx, base: string): void {
  const L = shade(base, 0.42);
  const hi = shade(base, 0.58);
  const D = shade(base, -0.18);
  const ghost = shade(base, 0.22);
  const rows: [number, number][] = [[7, 2], [6, 4], [5, 6], [5, 6], [6, 4], [7, 2], [8, 1]];
  rows.forEach(([x, w], i) => p(ctx, x, 2 + i, w, 1, base));
  p(ctx, 7, 3, 2, 2, L);
  p(ctx, 7, 3, 1, 1, hi);
  p(ctx, 6, 5, 2, 2, ghost);
  p(ctx, 8, 7, 2, 2, ghost);
  p(ctx, 7, 8, 2, 1, shade(base, 0.12));
  p(ctx, 8, 6, 1, 3, D);
  p(ctx, 7, 7, 1, 2, D);
}
function eyeItem(ctx: Ctx, base: string, accent?: string): void {
  const iris = accent ?? shade(base, -0.35);
  const pupil = shade(iris, -0.45);
  const L = shade(base, 0.28);
  const D = shade(base, -0.22);
  const rows: [number, number][] = [[6, 4], [5, 6], [4, 8], [4, 8], [4, 8], [5, 6], [6, 4]];
  rows.forEach(([x, w], i) => p(ctx, x, 4 + i, w, 1, base));
  p(ctx, 5, 5, 3, 1, L);
  p(ctx, 5, 5, 2, 1, shade(base, 0.42));
  p(ctx, 6, 7, 4, 3, iris);
  p(ctx, 7, 8, 2, 2, pupil);
  p(ctx, 6, 7, 1, 1, shade(base, 0.45));
  p(ctx, 5, 10, 6, 1, D);
  p(ctx, 11, 7, 1, 3, D);
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
  const liqHi = shade(base, 0.24);
  const liqLo = shade(base, -0.22);
  const top = splash ? 1 : 0;
  p(ctx, 7, top, 2, 2, cork);
  p(ctx, 7, top, 2, 1, shade(cork, 0.2));
  p(ctx, 7, top + 2, 2, splash ? 2 : 3, g);
  p(ctx, 7, top + 2, 1, splash ? 2 : 3, gHi);
  if (splash) {
    p(ctx, 6, 4, 4, 1, g);
    p(ctx, 5, 5, 6, 1, g);
    p(ctx, 4, 6, 8, 1, g);
    p(ctx, 3, 7, 10, 1, g);
    p(ctx, 3, 8, 10, 5, g);
    p(ctx, 4, 13, 8, 1, g);
    p(ctx, 5, 14, 6, 1, gLo);
    p(ctx, 3, 7, 1, 6, gHi);
    p(ctx, 12, 8, 1, 5, gLo);
    p(ctx, 4, 8, 8, 1, liqHi);
    p(ctx, 4, 9, 8, 4, base);
    p(ctx, 5, 13, 6, 1, liqLo);
    p(ctx, 9, 10, 1, 2, shade(base, -0.28));
  } else {
    p(ctx, 6, 4, 4, 1, g);
    p(ctx, 5, 5, 6, 1, g);
    p(ctx, 4, 6, 8, 1, g);
    p(ctx, 4, 7, 8, 5, g);
    p(ctx, 5, 12, 6, 1, g);
    p(ctx, 6, 13, 4, 1, gLo);
    p(ctx, 7, 14, 2, 1, gLo);
    p(ctx, 5, 5, 1, 9, gHi);
    p(ctx, 10, 5, 1, 9, gLo);
    p(ctx, 5, 7, 6, 1, liqHi);
    p(ctx, 5, 8, 6, 5, base);
    p(ctx, 5, 12, 6, 1, liqLo);
    p(ctx, 9, 9, 1, 3, liqLo);
  }
}
function emptyFlask(ctx: Ctx, base: string): void {
  const gHi = shade(base, 0.22);
  const gLo = shade(base, -0.14);
  const glint = "#ffffff";
  p(ctx, 6, 1, 4, 1, gHi);
  p(ctx, 7, 2, 2, 3, base);
  p(ctx, 7, 2, 1, 3, glint);
  p(ctx, 6, 4, 4, 1, base);
  p(ctx, 5, 5, 6, 1, base);
  p(ctx, 4, 6, 8, 1, base);
  p(ctx, 4, 7, 8, 5, base);
  p(ctx, 5, 12, 6, 1, base);
  p(ctx, 6, 13, 4, 1, gLo);
  p(ctx, 7, 14, 2, 1, gLo);
  p(ctx, 5, 5, 1, 9, gHi);
  p(ctx, 10, 6, 1, 8, gLo);
  p(ctx, 7, 8, 1, 4, glint);
  p(ctx, 6, 10, 2, 1, shade(base, 0.08));
}
function xpFlask(ctx: Ctx, base: string): void {
  flask(ctx, base, "#9c7a4d", false);
  p(ctx, 5, 9, 1, 1, "#eaffd8");
  p(ctx, 9, 10, 1, 1, "#ffffff");
  p(ctx, 7, 11, 1, 1, "#eaffd8");
  p(ctx, 8, 9, 1, 1, "#ffffff");
}
function brewingStand(ctx: Ctx, base: string): void {
  const rod = "#d08838";
  const rodHi = "#ffb060";
  const rodLo = shade(rod, -0.18);
  const flaskG = "#c4e8f0";
  p(ctx, 1, 12, 14, 3, shade(base, -0.1));
  p(ctx, 1, 12, 14, 1, shade(base, 0.12));
  p(ctx, 2, 13, 12, 1, base);
  p(ctx, 7, 9, 2, 3, base);
  p(ctx, 6, 8, 4, 1, shade(base, 0.14));
  p(ctx, 7, 1, 2, 8, rod);
  p(ctx, 7, 1, 1, 8, rodHi);
  p(ctx, 8, 1, 1, 8, rodLo);
  p(ctx, 7, 1, 2, 1, rodHi);
  for (const x of [2, 7, 11] as const) {
    p(ctx, x, 5, 2, 1, rod);
    p(ctx, x, 5, 2, 1, rodHi);
    p(ctx, x + 1, 6, 1, 2, flaskG);
    p(ctx, x, 7, 2, 2, shade(flaskG, -0.1));
    p(ctx, x, 7, 1, 2, shade(flaskG, 0.18));
  }
}
function cauldron(ctx: Ctx, base: string): void {
  const rim = shade(base, 0.28);
  const dark = shade(base, -0.38);
  const inner = shade(base, -0.48);
  p(ctx, 2, 13, 2, 2, dark);
  p(ctx, 12, 13, 2, 2, dark);
  p(ctx, 3, 5, 10, 2, rim);
  p(ctx, 2, 6, 2, 2, rim);
  p(ctx, 12, 6, 2, 2, rim);
  p(ctx, 3, 7, 10, 6, base);
  p(ctx, 3, 7, 10, 1, shade(base, 0.14));
  p(ctx, 12, 7, 1, 6, dark);
  p(ctx, 4, 13, 8, 1, dark);
  p(ctx, 5, 14, 6, 1, shade(base, -0.22));
  p(ctx, 4, 8, 8, 4, inner);
  p(ctx, 5, 8, 6, 1, dark);
}
function fireCharge(ctx: Ctx, base: string): void {
  const ember = shade(base, -0.22);
  const coalHi = shade(base, 0.14);
  p(ctx, 6, 3, 4, 1, base);
  p(ctx, 5, 4, 6, 1, base);
  p(ctx, 4, 5, 8, 1, base);
  p(ctx, 4, 6, 8, 5, base);
  p(ctx, 5, 11, 6, 1, ember);
  p(ctx, 6, 12, 4, 1, ember);
  p(ctx, 5, 4, 4, 1, coalHi);
  p(ctx, 4, 5, 1, 5, coalHi);
  p(ctx, 5, 6, 6, 4, "#ffe566");
  p(ctx, 6, 5, 4, 1, "#fff8b0");
  p(ctx, 7, 7, 2, 2, "#fff8b0");
  p(ctx, 3, 4, 1, 1, "#ffb040");
  p(ctx, 12, 7, 1, 1, "#ffb040");
}
function totem(ctx: Ctx, base: string, accent?: string): void {
  const dark = shade(base, -0.32);
  const mid = shade(base, -0.12);
  const face = accent ?? "#4a9a4a";
  const faceDark = shade(face, -0.35);
  p(ctx, 5, 2, 6, 5, base);
  p(ctx, 5, 2, 6, 1, shade(base, 0.2));
  p(ctx, 6, 7, 4, 4, base);
  p(ctx, 6, 11, 4, 2, mid);
  p(ctx, 2, 6, 3, 2, dark);
  p(ctx, 11, 6, 3, 2, dark);
  p(ctx, 2, 6, 3, 1, shade(dark, 0.12));
  p(ctx, 6, 4, 4, 3, face);
  p(ctx, 6, 4, 1, 2, faceDark);
  p(ctx, 9, 4, 1, 2, faceDark);
  p(ctx, 7, 6, 2, 1, faceDark);
  p(ctx, 10, 2, 1, 11, dark);
  p(ctx, 5, 11, 6, 1, dark);
}
function nameTag(ctx: Ctx, base: string, accent?: string): void {
  const ink = accent ?? "#4a4a4a";
  const string = shade(base, -0.32);
  const tagHi = shade(base, 0.16);
  const tagLo = shade(base, -0.14);
  p(ctx, 7, 1, 2, 1, string);
  p(ctx, 6, 2, 1, 2, string);
  p(ctx, 9, 2, 1, 2, string);
  p(ctx, 8, 2, 1, 1, shade(string, 0.12));
  p(ctx, 4, 4, 8, 10, base);
  p(ctx, 5, 3, 6, 1, base);
  p(ctx, 5, 14, 6, 1, tagLo);
  p(ctx, 4, 4, 8, 1, tagHi);
  p(ctx, 11, 4, 1, 10, tagLo);
  p(ctx, 7, 4, 2, 2, "#2e2e2e");
  p(ctx, 5, 8, 6, 1, ink);
  p(ctx, 5, 10, 4, 1, ink);
  p(ctx, 5, 12, 5, 1, shade(ink, 0.15));
}
function lead(ctx: Ctx, base: string, accent?: string): void {
  const hook = accent ?? "#c8c8c8";
  const hookHi = shade(hook, 0.22);
  const ropeLo = shade(base, -0.22);
  p(ctx, 6, 2, 4, 2, hook);
  p(ctx, 6, 2, 4, 1, hookHi);
  p(ctx, 6, 4, 1, 2, hook);
  p(ctx, 9, 4, 1, 2, shade(hook, -0.12));
  p(ctx, 8, 3, 1, 1, hookHi);
  p(ctx, 7, 6, 2, 2, ropeLo);
  p(ctx, 6, 7, 4, 2, base);
  p(ctx, 6, 7, 4, 1, shade(base, 0.12));
  p(ctx, 7, 9, 2, 2, base);
  p(ctx, 5, 11, 2, 2, ropeLo);
  p(ctx, 8, 12, 2, 2, base);
  p(ctx, 4, 13, 4, 2, ropeLo);
  p(ctx, 4, 13, 4, 1, shade(ropeLo, -0.1));
}
function mapRoll(ctx: Ctx, base: string, accent?: string): void {
  const edge = shade(base, -0.2);
  const edgeLo = shade(base, -0.32);
  const land = accent ?? "#6a9a62";
  const water = shade(land, -0.35);
  p(ctx, 1, 6, 2, 4, edgeLo);
  p(ctx, 13, 6, 2, 4, edgeLo);
  p(ctx, 1, 6, 2, 1, edge);
  p(ctx, 13, 6, 2, 1, edge);
  p(ctx, 3, 5, 10, 6, base);
  p(ctx, 3, 5, 10, 1, shade(base, 0.14));
  p(ctx, 3, 10, 10, 1, edge);
  p(ctx, 4, 7, 3, 2, land);
  p(ctx, 8, 8, 3, 2, water);
  p(ctx, 7, 7, 1, 1, "#8a4a42");
  p(ctx, 10, 9, 2, 1, land);
  p(ctx, 5, 9, 2, 1, shade(land, -0.2));
}
function fermentedEye(ctx: Ctx, base: string): void {
  const hi = shade(base, 0.22);
  const lo = shade(base, -0.28);
  const pupil = shade(base, -0.45);
  const spot = shade(base, -0.12);
  p(ctx, 5, 5, 6, 1, base);
  p(ctx, 4, 6, 8, 1, base);
  p(ctx, 4, 7, 8, 4, base);
  p(ctx, 5, 11, 6, 1, lo);
  p(ctx, 6, 12, 4, 1, lo);
  p(ctx, 4, 6, 1, 5, hi);
  p(ctx, 6, 8, 2, 2, pupil);
  p(ctx, 7, 8, 1, 1, shade(pupil, -0.2));
  p(ctx, 9, 7, 2, 2, spot);
  p(ctx, 5, 10, 2, 1, spot);
  p(ctx, 10, 9, 1, 1, hi);
}

// --- Tools / weapons / armor ----------------------------------------------
function toolHandle(ctx: Ctx, wood: string): void {
  for (let i = 0; i < 8; i++) p(ctx, 3 + i, 13 - i, 2, 2, wood);
  for (let i = 0; i < 8; i++) p(ctx, 3 + i, 13 - i, 1, 1, shade(wood, 0.16));
}
function drawSword(ctx: Ctx, base: string, wood: string, guard: string): void {
  p(ctx, 2, 13, 2, 2, guard);
  p(ctx, 3, 10, 2, 4, wood);
  p(ctx, 2, 9, 5, 2, guard);
  for (let i = 0; i < 8; i++) p(ctx, 4 + i, 9 - i, 2, 2, base);
  p(ctx, 11, 1, 2, 2, base);
  p(ctx, 11, 1, 1, 1, shade(base, 0.32));
}
function drawPickaxe(ctx: Ctx, base: string, wood: string): void {
  toolHandle(ctx, wood);
  p(ctx, 8, 5, 7, 2, base);
  p(ctx, 8, 3, 2, 2, base);
  p(ctx, 13, 3, 2, 2, base);
  p(ctx, 8, 5, 7, 1, shade(base, 0.26));
  p(ctx, 8, 6, 7, 1, shade(base, -0.2));
}
function drawAxe(ctx: Ctx, base: string, wood: string): void {
  toolHandle(ctx, wood);
  p(ctx, 9, 2, 5, 3, base);
  p(ctx, 10, 5, 4, 2, base);
  p(ctx, 11, 7, 3, 1, base);
  p(ctx, 9, 2, 5, 1, shade(base, 0.26));
  p(ctx, 9, 2, 1, 5, shade(base, -0.22));
}
function drawShovel(ctx: Ctx, base: string, wood: string): void {
  toolHandle(ctx, wood);
  p(ctx, 10, 2, 4, 4, base);
  p(ctx, 11, 6, 2, 1, base);
  p(ctx, 10, 2, 4, 1, shade(base, 0.28));
  p(ctx, 13, 2, 1, 4, shade(base, -0.2));
}
function drawHoe(ctx: Ctx, base: string, wood: string): void {
  toolHandle(ctx, wood);
  p(ctx, 9, 3, 6, 2, base);
  p(ctx, 9, 5, 2, 2, base);
  p(ctx, 9, 3, 6, 1, shade(base, 0.24));
  p(ctx, 14, 3, 1, 2, shade(base, -0.2));
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
  p(ctx, 7, 10, 2, 5, trunk);
  p(ctx, 7, 10, 1, 5, shade(trunk, 0.14));
  p(ctx, 5, 4, 6, 6, base);
  p(ctx, 4, 5, 8, 4, base);
  p(ctx, 6, 3, 4, 1, shade(base, 0.25));
  p(ctx, 4, 6, 2, 2, shade(base, 0.15));
  p(ctx, 10, 5, 2, 2, shade(base, -0.12));
  p(ctx, 6, 8, 4, 1, shade(base, -0.18));
  p(ctx, 6, 14, 4, 1, shade(trunk, -0.28));
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
  const wood = base;
  const stone = shade(base, -0.28);
  const head = shade(base, 0.06);
  p(ctx, 1, 2, 14, 5, wood);
  p(ctx, 1, 2, 14, 1, shade(wood, 0.24));
  p(ctx, 1, 2, 1, 5, shade(wood, 0.14));
  p(ctx, 13, 2, 1, 5, shade(wood, -0.18));
  p(ctx, 5, 3, 1, 3, shade(wood, -0.14));
  p(ctx, 9, 3, 1, 3, shade(wood, -0.14));
  p(ctx, 1, 6, 14, 1, shade(wood, -0.22));
  p(ctx, 1, 7, 14, 4, stone);
  p(ctx, 1, 7, 14, 1, shade(stone, 0.16));
  p(ctx, 1, 10, 14, 1, shade(stone, -0.24));
  p(ctx, 13, 7, 1, 4, shade(stone, -0.18));
  p(ctx, 5, 8, 2, 2, shade(stone, -0.1));
  p(ctx, 9, 9, 2, 1, shade(stone, 0.08));
  p(ctx, 2, 11, 12, 3, head);
  p(ctx, 2, 11, 12, 1, shade(head, 0.2));
  p(ctx, 2, 13, 12, 1, shade(head, -0.26));
  p(ctx, 1, 11, 1, 3, shade(head, 0.1));
  p(ctx, 14, 11, 1, 3, shade(head, -0.16));
  p(ctx, 6, 12, 4, 1, shade(head, -0.08));
}
function stickyPiston(ctx: Ctx, base: string, accent?: string): void {
  const plank = accent ?? "#9c8456";
  piston(ctx, plank);
  const slime = base;
  p(ctx, 2, 11, 12, 3, slime);
  p(ctx, 3, 12, 10, 1, shade(slime, 0.22));
  p(ctx, 2, 13, 12, 1, shade(slime, -0.22));
  p(ctx, 5, 12, 2, 1, shade(slime, 0.14));
  p(ctx, 9, 12, 2, 1, shade(slime, 0.1));
  p(ctx, 7, 11, 2, 1, shade(slime, 0.18));
}
function hopper(ctx: Ctx, base: string): void {
  const hi = shade(base, 0.2);
  const lo = shade(base, -0.28);
  const rim = shade(base, 0.26);
  p(ctx, 1, 2, 14, 2, base);
  p(ctx, 1, 2, 14, 1, rim);
  p(ctx, 1, 3, 1, 1, hi);
  p(ctx, 14, 3, 1, 1, lo);
  p(ctx, 2, 4, 12, 2, base);
  p(ctx, 3, 6, 10, 2, base);
  p(ctx, 4, 8, 8, 2, base);
  p(ctx, 2, 4, 1, 6, hi);
  p(ctx, 13, 4, 1, 6, lo);
  p(ctx, 4, 4, 8, 1, shade(base, -0.18));
  p(ctx, 5, 6, 6, 1, shade(base, -0.14));
  p(ctx, 6, 10, 4, 2, base);
  p(ctx, 7, 12, 2, 3, base);
  p(ctx, 7, 12, 2, 1, lo);
  p(ctx, 6, 10, 4, 1, shade(base, 0.12));
  p(ctx, 7, 14, 2, 1, shade(base, -0.32));
}
function dispenser(ctx: Ctx, base: string): void {
  const hole = shade(base, -0.42);
  const deep = shade(base, -0.55);
  block(ctx, base);
  p(ctx, 4, 4, 8, 8, hole);
  p(ctx, 5, 5, 6, 6, deep);
  p(ctx, 6, 6, 4, 4, shade(base, -0.62));
  p(ctx, 7, 5, 2, 6, shade(base, -0.62));
  p(ctx, 5, 7, 6, 2, shade(base, -0.62));
  p(ctx, 7, 7, 2, 2, shade(base, -0.72));
  p(ctx, 7, 10, 2, 1, shade(base, 0.12));
}
function dropper(ctx: Ctx, base: string): void {
  const hole = shade(base, -0.42);
  const deep = shade(base, -0.55);
  block(ctx, base);
  p(ctx, 5, 2, 6, 2, hole);
  p(ctx, 6, 3, 4, 1, deep);
  p(ctx, 6, 4, 4, 8, hole);
  p(ctx, 7, 5, 2, 6, deep);
  p(ctx, 6, 12, 4, 2, hole);
  p(ctx, 7, 13, 2, 1, shade(base, -0.68));
  p(ctx, 6, 4, 1, 8, shade(hole, 0.08));
}
function lever(ctx: Ctx, base: string): void {
  const cobble = shade(base, -0.42);
  const rock = shade(base, -0.18);
  const stick = base;
  p(ctx, 2, 10, 12, 5, cobble);
  p(ctx, 3, 11, 4, 2, rock);
  p(ctx, 8, 10, 5, 3, shade(rock, 0.08));
  p(ctx, 4, 13, 4, 2, shade(rock, -0.12));
  p(ctx, 9, 13, 4, 2, rock);
  p(ctx, 2, 10, 12, 1, shade(cobble, 0.1));
  p(ctx, 2, 14, 12, 1, shade(cobble, -0.22));
  for (let i = 0; i < 7; i++) p(ctx, 4 + i, 9 - i, 2, 2, stick);
  for (let i = 0; i < 7; i++) p(ctx, 4 + i, 9 - i, 1, 1, shade(stick, 0.2));
  p(ctx, 10, 3, 2, 2, stick);
  p(ctx, 10, 3, 1, 1, shade(stick, 0.28));
}
function railIcon(ctx: Ctx, base: string): void {
  const tie = shade(base, -0.18);
  const tieHi = shade(tie, 0.14);
  const rail = shade(base, 0.32);
  const railHi = shade(rail, 0.22);
  const railLo = shade(base, 0.08);
  for (const x of [3, 7, 11]) {
    p(ctx, x, 3, 2, 10, tie);
    p(ctx, x, 3, 1, 10, tieHi);
  }
  p(ctx, 2, 5, 12, 2, railLo);
  p(ctx, 2, 5, 12, 1, railHi);
  p(ctx, 2, 9, 12, 2, railLo);
  p(ctx, 2, 10, 12, 1, shade(railLo, -0.14));
  p(ctx, 2, 9, 12, 1, railHi);
}
function minecart(ctx: Ctx, base: string): void {
  const dark = shade(base, -0.36);
  const inner = shade(base, -0.2);
  const hi = shade(base, 0.28);
  const wheel = shade(base, -0.5);
  const wheelHi = shade(wheel, 0.2);
  p(ctx, 2, 12, 4, 2, wheel);
  p(ctx, 3, 12, 2, 1, wheelHi);
  p(ctx, 10, 12, 4, 2, wheel);
  p(ctx, 11, 12, 2, 1, wheelHi);
  p(ctx, 3, 4, 10, 1, hi);
  p(ctx, 2, 5, 1, 7, hi);
  p(ctx, 13, 5, 1, 7, dark);
  p(ctx, 3, 5, 1, 6, hi);
  p(ctx, 12, 5, 1, 6, dark);
  p(ctx, 4, 6, 8, 5, inner);
  p(ctx, 3, 11, 10, 1, dark);
  p(ctx, 2, 11, 12, 1, dark);
}
function bookshelf(ctx: Ctx, base: string, accent?: string): void {
  const shelf = shade(base, -0.28);
  const frame = shade(base, -0.18);
  const spineA = accent ?? shade(base, -0.45);
  const spineB = shade(spineA, -0.18);
  const spineC = shade(base, 0.12);
  const spineD = shade(spineA, 0.14);
  p(ctx, 1, 1, 14, 14, base);
  p(ctx, 1, 1, 14, 1, shade(base, 0.16));
  p(ctx, 1, 13, 14, 1, frame);
  p(ctx, 13, 1, 1, 14, frame);
  p(ctx, 1, 5, 14, 1, shelf);
  p(ctx, 1, 9, 14, 1, shelf);
  const top: [number, number, string][] = [[2, 2, spineA], [5, 2, spineB], [8, 3, spineC], [12, 1, spineD]];
  for (const [x, w, c] of top) {
    p(ctx, x, 2, w, 3, c);
    p(ctx, x, 2, 1, 3, shade(c, 0.2));
  }
  const bot: [number, number, string][] = [[2, 1, spineB], [4, 3, spineA], [8, 2, spineD], [11, 2, spineC]];
  for (const [x, w, c] of bot) {
    p(ctx, x, 10, w, 3, c);
    p(ctx, x, 10, 1, 3, shade(c, 0.2));
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
  const rung = shade(base, -0.22);
  const hi = shade(base, 0.18);
  const lo = shade(base, -0.28);
  p(ctx, 4, 1, 2, 14, base);
  p(ctx, 10, 1, 2, 14, base);
  p(ctx, 4, 1, 1, 14, hi);
  p(ctx, 11, 1, 1, 14, lo);
  for (const y of [3, 6, 9, 12]) {
    p(ctx, 6, y, 4, 1, rung);
    p(ctx, 6, y, 4, 1, shade(rung, 0.12));
  }
  p(ctx, 4, 1, 2, 1, hi);
  p(ctx, 10, 1, 2, 1, hi);
  p(ctx, 4, 14, 2, 1, lo);
  p(ctx, 10, 14, 2, 1, lo);
}
function bed(ctx: Ctx, base: string, accent?: string): void {
  const frame = accent ?? shade(base, -0.42);
  const frameHi = shade(frame, 0.16);
  const frameLo = shade(frame, -0.22);
  const pillow = shade(frame, 0.72);
  const sheet = shade(base, 0.1);
  const sheetLo = shade(base, -0.18);
  p(ctx, 1, 12, 2, 3, frameLo);
  p(ctx, 13, 12, 2, 3, frameLo);
  p(ctx, 1, 13, 14, 2, frame);
  p(ctx, 1, 4, 2, 9, frame);
  p(ctx, 1, 4, 1, 9, frameHi);
  p(ctx, 3, 5, 11, 7, base);
  p(ctx, 3, 5, 11, 1, sheet);
  p(ctx, 13, 5, 1, 7, sheetLo);
  p(ctx, 3, 5, 4, 3, pillow);
  p(ctx, 3, 5, 4, 1, shade(pillow, 0.1));
  p(ctx, 13, 7, 1, 5, frame);
  p(ctx, 12, 10, 2, 1, frameLo);
}
function lantern(ctx: Ctx, base: string, accent?: string): void {
  const cage = accent ?? "#9a7a5a";
  const light = base || "#e7c46b";
  p(ctx, 7, 1, 2, 1, cage);
  p(ctx, 6, 2, 4, 1, cage);
  p(ctx, 5, 3, 6, 1, cage);
  p(ctx, 4, 4, 1, 8, cage);
  p(ctx, 11, 4, 1, 8, cage);
  p(ctx, 5, 4, 6, 7, light);
  p(ctx, 7, 5, 2, 4, "#fff2b0");
  p(ctx, 6, 6, 1, 2, shade(light, 0.2));
  p(ctx, 9, 7, 1, 2, shade(light, -0.12));
  p(ctx, 5, 12, 6, 1, cage);
  p(ctx, 6, 13, 4, 1, shade(cage, -0.2));
}
function redstoneTorch(ctx: Ctx, base: string, accent?: string): void {
  const stick = accent ?? "#9c7a4d";
  p(ctx, 7, 8, 2, 7, stick);
  p(ctx, 6, 3, 4, 5, base);
  p(ctx, 7, 2, 2, 2, shade(base, 0.35));
}
function repeater(ctx: Ctx, base: string, accent?: string): void {
  const rs = accent ?? "#c0322b";
  const stick = shade(rs, -0.38);
  const glow = shade(rs, 0.32);
  const slabHi = shade(base, 0.18);
  const slabLo = shade(base, -0.24);
  p(ctx, 1, 10, 14, 5, base);
  p(ctx, 1, 10, 14, 1, slabHi);
  p(ctx, 1, 14, 14, 1, slabLo);
  p(ctx, 1, 10, 1, 5, shade(base, 0.08));
  p(ctx, 14, 10, 1, 5, shade(base, -0.12));
  p(ctx, 3, 9, 10, 1, rs);
  p(ctx, 5, 8, 6, 1, shade(rs, 0.18));
  p(ctx, 3, 5, 2, 4, stick);
  p(ctx, 3, 3, 2, 2, rs);
  p(ctx, 3, 3, 1, 1, glow);
  p(ctx, 11, 5, 2, 4, stick);
  p(ctx, 11, 3, 2, 2, rs);
  p(ctx, 12, 3, 1, 1, glow);
  p(ctx, 7, 11, 2, 3, shade(base, -0.32));
  p(ctx, 7, 11, 2, 1, shade(base, -0.18));
}
function comparator(ctx: Ctx, base: string, accent?: string): void {
  const rs = accent ?? "#c0322b";
  const stick = shade(rs, -0.38);
  const glow = shade(rs, 0.32);
  const slabHi = shade(base, 0.18);
  const slabLo = shade(base, -0.24);
  p(ctx, 1, 10, 14, 5, base);
  p(ctx, 1, 10, 14, 1, slabHi);
  p(ctx, 1, 14, 14, 1, slabLo);
  p(ctx, 1, 10, 1, 5, shade(base, 0.08));
  p(ctx, 14, 10, 1, 5, shade(base, -0.12));
  p(ctx, 2, 9, 12, 1, rs);
  p(ctx, 4, 8, 8, 1, shade(rs, 0.16));
  p(ctx, 2, 5, 2, 4, stick);
  p(ctx, 2, 3, 2, 2, rs);
  p(ctx, 3, 3, 1, 1, glow);
  p(ctx, 12, 5, 2, 4, stick);
  p(ctx, 12, 3, 2, 2, rs);
  p(ctx, 12, 3, 1, 1, glow);
  p(ctx, 7, 4, 2, 4, stick);
  p(ctx, 7, 2, 2, 2, rs);
  p(ctx, 7, 2, 1, 1, glow);
}
function observer(ctx: Ctx, base: string, accent?: string): void {
  const rs = accent ?? "#c0322b";
  const face = shade(base, -0.36);
  const bezel = shade(base, -0.52);
  block(ctx, base);
  p(ctx, 1, 3, 5, 10, face);
  p(ctx, 1, 3, 5, 1, shade(face, 0.14));
  p(ctx, 1, 12, 5, 1, shade(face, -0.22));
  p(ctx, 5, 3, 1, 10, shade(face, -0.12));
  p(ctx, 2, 5, 3, 6, bezel);
  p(ctx, 2, 6, 2, 4, rs);
  p(ctx, 2, 6, 1, 2, shade(rs, 0.35));
  p(ctx, 10, 4, 1, 8, shade(base, -0.16));
  p(ctx, 12, 5, 1, 6, shade(base, -0.1));
  p(ctx, 8, 6, 1, 4, shade(base, -0.08));
}
function torch(ctx: Ctx, base: string): void {
  const wood = "#9c7a4d";
  const flame = base || "#e7c46b";
  const hi = "#fff2b0";
  const core = shade(flame, 0.25);
  const ember = shade(flame, -0.18);
  p(ctx, 7, 6, 2, 9, wood);
  p(ctx, 7, 6, 1, 9, shade(wood, 0.16));
  p(ctx, 8, 14, 1, 1, shade(wood, -0.25));
  p(ctx, 7, 5, 2, 1, ember);
  p(ctx, 6, 3, 4, 2, flame);
  p(ctx, 7, 2, 2, 1, core);
  p(ctx, 7, 1, 2, 1, hi);
  p(ctx, 6, 3, 1, 2, shade(flame, 0.3));
  p(ctx, 9, 4, 1, 1, ember);
  p(ctx, 5, 4, 1, 1, shade(flame, 0.15));
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
  p(ctx, 5, 1, 6, 1, base);
  p(ctx, 5, 1, 2, 1, hi);
  p(ctx, 4, 2, 1, 1, base);
  p(ctx, 11, 2, 1, 1, lo);
  p(ctx, 3, 3, 1, 1, lo);
  p(ctx, 12, 3, 1, 1, lo);
  if (accent) {
    p(ctx, 4, 6, 8, 2, accent);
    p(ctx, 5, 8, 6, 4, accent);
    p(ctx, 5, 11, 6, 1, shade(accent, -0.24));
    p(ctx, 4, 5, 8, 1, shade(accent, 0.34));
    p(ctx, 6, 6, 2, 1, shade(accent, 0.38));
  } else {
    p(ctx, 4, 6, 8, 2, shade(base, -0.52));
    p(ctx, 5, 8, 6, 3, shade(base, -0.62));
    p(ctx, 6, 9, 4, 2, shade(base, -0.68));
    p(ctx, 4, 5, 8, 1, shade(base, -0.45));
    p(ctx, 5, 11, 6, 1, dark);
  }
  p(ctx, 3, 4, 10, 2, base);
  p(ctx, 3, 4, 10, 1, hi);
  p(ctx, 12, 5, 1, 1, lo);
  p(ctx, 3, 6, 1, 7, hi);
  p(ctx, 4, 7, 1, 2, base);
  p(ctx, 5, 9, 1, 3, base);
  p(ctx, 12, 6, 1, 7, lo);
  p(ctx, 11, 7, 1, 2, lo);
  p(ctx, 10, 9, 1, 3, lo);
  p(ctx, 4, 12, 8, 1, dark);
  p(ctx, 5, 13, 6, 1, lo);
}
function ringDial(ctx: Ctx, rim: string): void {
  const rows: [number, number][] = [
    [7, 2], [6, 4], [5, 6], [4, 8], [4, 8], [4, 8], [4, 8], [5, 6], [6, 4], [7, 2],
  ];
  rows.forEach(([x, w], i) => p(ctx, x, 3 + i, w, 1, rim));
}
function compass(ctx: Ctx, base: string, accent?: string): void {
  const face = shade(base, 0.42);
  const needle = accent ?? "#c0322b";
  const tail = shade(base, 0.72);
  const hub = shade(base, -0.28);
  ringDial(ctx, shade(base, -0.1));
  const faceRows: [number, number][] = [
    [6, 4], [5, 6], [4, 8], [4, 8], [4, 8], [4, 8], [5, 6], [6, 4],
  ];
  faceRows.forEach(([x, w], i) => p(ctx, x, 4 + i, w, 1, face));
  p(ctx, 5, 4, 2, 1, shade(face, 0.14));
  p(ctx, 10, 4, 1, 1, needle);
  p(ctx, 9, 5, 1, 1, needle);
  p(ctx, 8, 5, 1, 1, needle);
  p(ctx, 8, 6, 1, 1, shade(needle, -0.06));
  p(ctx, 7, 7, 1, 1, shade(needle, -0.14));
  p(ctx, 4, 10, 1, 1, shade(tail, -0.1));
  p(ctx, 5, 9, 1, 1, tail);
  p(ctx, 5, 8, 1, 1, tail);
  p(ctx, 6, 8, 1, 1, tail);
  p(ctx, 7, 8, 1, 1, shade(tail, -0.06));
  p(ctx, 7, 7, 2, 2, hub);
}
function clock(ctx: Ctx, base: string): void {
  const day = shade(base, 0.55);
  const night = shade(base, -0.5);
  ringDial(ctx, shade(base, -0.1));
  const splits: [number, number, number, number][] = [
    [6, 4, 2, 2], [5, 5, 3, 3], [4, 6, 4, 4], [4, 7, 4, 4],
    [4, 8, 4, 4], [4, 9, 4, 4], [5, 10, 3, 3], [6, 11, 2, 2],
  ];
  for (const [x, y, dw, nw] of splits) {
    p(ctx, x, y, dw, 1, day);
    p(ctx, x + dw, y, nw, 1, night);
  }
  p(ctx, 8, 4, 1, 8, shade(night, -0.12));
}
function liquidBlock(ctx: Ctx, base: string, isLava: boolean): void {
  const side = shade(base, -0.28);
  const deep = shade(base, -0.42);
  const topHi = shade(base, 0.32);
  p(ctx, 1, 8, 14, 6, side);
  p(ctx, 1, 8, 2, 6, shade(base, -0.18));
  p(ctx, 13, 8, 2, 6, deep);
  p(ctx, 1, 13, 14, 2, deep);
  p(ctx, 1, 14, 14, 1, shade(base, -0.48));
  p(ctx, 1, 4, 14, 4, base);
  p(ctx, 1, 4, 14, 1, topHi);
  p(ctx, 1, 4, 1, 4, shade(base, 0.18));
  p(ctx, 13, 4, 2, 4, shade(base, 0.06));
  p(ctx, 1, 7, 14, 1, shade(base, -0.1));
  if (isLava) {
    p(ctx, 3, 5, 4, 1, shade(base, 0.38));
    p(ctx, 9, 6, 3, 1, shade(base, 0.22));
    p(ctx, 5, 6, 2, 1, "#ffdd66");
    p(ctx, 11, 5, 2, 1, "#ffb040");
  } else {
    p(ctx, 2, 5, 5, 1, shade(base, 0.14));
    p(ctx, 9, 6, 4, 1, shade(base, -0.08));
    p(ctx, 3, 6, 1, 1, "#ffffff");
    p(ctx, 7, 5, 2, 1, "#ffffff");
    p(ctx, 11, 5, 1, 1, "#ffffff");
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
  const stem = shade(base, -0.42);
  p(ctx, 7, 2, 2, 2, stem);
  p(ctx, 8, 1, 1, 1, stem);
  p(ctx, 9, 2, 3, 1, leaf);
  p(ctx, 10, 3, 2, 1, leaf);
  p(ctx, 11, 4, 1, 1, shade(leaf, 0.12));
  const rows: [number, number][] = [[7, 2], [6, 4], [5, 6], [5, 6], [5, 6], [5, 6], [6, 4], [7, 2]];
  rows.forEach(([x, w], i) => p(ctx, x, 4 + i, w, 1, base));
  p(ctx, 6, 5, 2, 4, shade(base, 0.28));
  p(ctx, 9, 7, 2, 3, shade(base, -0.22));
  p(ctx, 8, 10, 1, 1, shade(base, -0.14));
  if (id !== "apple") p(ctx, 7, 6, 2, 1, shade(base, 0.35));
  if (id === "enchanted_golden_apple") {
    p(ctx, 5, 7, 1, 1, "#bf4cc7");
    p(ctx, 10, 8, 1, 1, "#3aafd9");
    p(ctx, 8, 10, 1, 1, "#bf4cc7");
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
  const belly = shade(base, 0.14);
  p(ctx, 4, 6, 8, 4, base);
  p(ctx, 2, 7, 2, 2, base);
  p(ctx, 3, 6, 1, 1, base);
  p(ctx, 3, 10, 1, 1, base);
  p(ctx, 12, 6, 2, 1, base);
  p(ctx, 12, 9, 2, 1, base);
  p(ctx, 13, 7, 1, 2, base);
  p(ctx, 14, 6, 1, 1, base);
  p(ctx, 14, 9, 1, 1, base);
  p(ctx, 6, 4, 2, 2, fin);
  p(ctx, 8, 5, 3, 1, fin);
  p(ctx, 11, 5, 1, 1, fin);
  p(ctx, 5, 10, 4, 1, belly);
  p(ctx, 7, 11, 2, 1, fin);
  p(ctx, 3, 7, 1, 1, "#2a2a2a");
  p(ctx, 5, 8, 5, 1, shade(base, 0.08));
  p(ctx, 10, 7, 2, 2, shade(base, -0.18));
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
  const tie = shade(stalk, -0.35);
  p(ctx, 5, 10, 1, 4, stalk);
  p(ctx, 7, 9, 2, 5, stalk);
  p(ctx, 10, 10, 1, 4, stalk);
  p(ctx, 6, 13, 4, 1, tie);
  p(ctx, 4, 2, 3, 3, base);
  p(ctx, 7, 1, 3, 4, base);
  p(ctx, 10, 2, 3, 3, base);
  p(ctx, 4, 2, 2, 1, shade(base, 0.28));
  p(ctx, 7, 1, 2, 2, shade(base, 0.32));
  p(ctx, 10, 2, 2, 1, shade(base, 0.28));
  p(ctx, 4, 3, 1, 2, shade(base, -0.12));
  p(ctx, 8, 2, 1, 3, shade(base, -0.12));
  p(ctx, 11, 3, 1, 2, shade(base, -0.12));
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

  if (def.tool || /^(bow|arrow|shield|trident|fishing_rod|shears|flint_and_steel)$/.test(id)) return "tool";

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

  if (/_dust$|^redstone$|^gunpowder$|^sugar$|_dye$|blaze_powder|bone_meal/.test(id)) return "dust";

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

  if (/^compass$/.test(id)) return "compass";
  if (/^clock$/.test(id)) return "clock";
  if (/^minecart$/.test(id)) return "minecart";
  if (/^water$|^lava$/.test(id)) return "liquid";
  if (/^sugar_cane$/.test(id)) return "cane";
  if (/bucket$/.test(id)) return "bucket";

  if (/^stick$/.test(id)) return "stick";
  if (/^redstone_torch$/.test(id)) return "redstoneTorch";
  if (/^torch$/.test(id)) return "torch";

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
