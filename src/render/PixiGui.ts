import { Application, Container, Graphics, Sprite, Text, TextStyle } from "pixi.js";
import type { GameState } from "../../engine/types";
import type { Registry } from "../../engine/registry";
import { TextureCache } from "./textures";
import { SLOT, ITEM, type GuiGeometry } from "./geometry";

export interface UiState {
  hoverSlot: number | null;
  /** Mouse position in GUI units (for the held cursor item). */
  cursorX: number;
  cursorY: number;
  dragSlots: number[];
}

const countStyle = (scale: number) =>
  new TextStyle({
    fontFamily: "monospace",
    fontSize: 9 * scale,
    fontWeight: "bold",
    fill: "#ffffff",
    stroke: { color: "#3f3f3f", width: 2 * scale },
  });

export class PixiGui {
  app = new Application();
  private registry!: Registry;
  private tex!: TextureCache;
  private geo!: GuiGeometry;
  private scale = 2;

  private panel = new Graphics();
  private highlight = new Graphics();
  private itemLayer = new Container();
  private overlayLayer = new Container();
  private spritePool: Sprite[] = [];
  private textPool: Text[] = [];

  private pendingState: GameState | null = null;
  private pendingUi: UiState | null = null;
  private rafScheduled = false;
  private ready = false;
  private destroyed = false;

  async init(canvas: HTMLCanvasElement, registry: Registry): Promise<void> {
    this.registry = registry;
    await this.app.init({
      canvas,
      backgroundAlpha: 0,
      antialias: false,
      resolution: Math.min(window.devicePixelRatio || 1, 2),
      autoDensity: true,
      width: 360,
      height: 360,
    });
    // If destroy() was called while init() was in flight (e.g. React StrictMode
    // double-invoke in dev), tear down now instead of leaving a live context.
    if (this.destroyed) {
      try {
        this.app.destroy(true, { children: true, texture: true });
      } catch {
        /* ignore */
      }
      return;
    }
    this.tex = new TextureCache();
    // Highlight sits BELOW items so hover/drag overlays never wash out icons.
    this.app.stage.addChild(this.panel, this.highlight, this.itemLayer, this.overlayLayer);
    this.ready = true;
  }

  setRegistry(registry: Registry): void {
    this.registry = registry;
    this.tex?.destroy();
    this.tex = new TextureCache();
  }

  setLayout(geo: GuiGeometry, scale: number): void {
    this.geo = geo;
    this.scale = scale;
    if (!this.ready) return;
    this.app.renderer.resize(geo.width * scale, geo.height * scale);
    this.drawPanel();
  }

  get widthPx(): number {
    return this.geo.width * this.scale;
  }
  get heightPx(): number {
    return this.geo.height * this.scale;
  }

  private drawPanel(): void {
    const g = this.panel;
    const s = this.scale;
    g.clear();
    // Window background (Minecraft GUI grey).
    g.roundRect(0, 0, this.geo.width * s, this.geo.height * s, 3 * s).fill("#c6c6c6");
    g.roundRect(0, 0, this.geo.width * s, this.geo.height * s, 3 * s).stroke({ color: "#555555", width: 2 });

    for (const slot of this.geo.slots) {
      const x = slot.x * s;
      const y = slot.y * s;
      const w = SLOT * s;
      // recessed slot look
      g.rect(x, y, w, w).fill("#8b8b8b");
      g.rect(x, y, w, 2 * (s / 2)).fill("#373737");
      g.rect(x, y, 2 * (s / 2), w).fill("#373737");
      g.rect(x, y + w - 2, w, 2).fill("#ffffff");
      g.rect(x + w - 2, y, 2, w).fill("#ffffff");
    }
    for (const d of this.geo.decorations) {
      if (d.type === "arrow") {
        const x = d.x * s;
        const y = (d.y + SLOT / 2) * s;
        g.rect(x, y - 2, 16 * s * 0.6, 4).fill("#555555");
        g.poly([x + 16 * s * 0.6, y - 6, x + 16 * s * 0.6 + 8, y, x + 16 * s * 0.6, y + 6]).fill("#555555");
      } else if (d.type === "flame") {
        const x = (d.x + SLOT / 2) * s;
        const y = (d.y + SLOT / 2) * s;
        g.poly([x, y - 6, x + 5, y + 5, x - 5, y + 5]).fill("#e2820f");
      }
    }
  }

  requestDraw(state: GameState, ui: UiState): void {
    this.pendingState = state;
    this.pendingUi = ui;
    if (this.rafScheduled || !this.ready) return;
    this.rafScheduled = true;
    requestAnimationFrame(() => {
      this.rafScheduled = false;
      if (this.pendingState && this.pendingUi) this.draw(this.pendingState, this.pendingUi);
    });
  }

  private acquireSprite(i: number): Sprite {
    let sp = this.spritePool[i];
    if (!sp) {
      sp = new Sprite();
      sp.visible = false;
      this.spritePool[i] = sp;
      this.itemLayer.addChild(sp);
    }
    return sp;
  }
  private acquireText(i: number): Text {
    let t = this.textPool[i];
    if (!t) {
      t = new Text({ text: "", style: countStyle(this.scale) });
      t.visible = false;
      this.textPool[i] = t;
      this.itemLayer.addChild(t);
    }
    return t;
  }

  private draw(state: GameState, ui: UiState): void {
    if (!this.geo) return;
    const s = this.scale;
    let spi = 0;
    let txi = 0;
    const itemPx = ITEM * s;
    const offset = ((SLOT - ITEM) / 2) * s;

    for (const slot of this.geo.slots) {
      const stack = state.slots[slot.id];
      if (!stack) continue;
      const def = this.registry.item(stack.id);
      const sp = this.acquireSprite(spi++);
      sp.texture = this.tex.get(def ?? { id: stack.id, name: stack.id, maxStack: 64, color: "#9a9a9a" });
      sp.x = slot.x * s + offset;
      sp.y = slot.y * s + offset;
      sp.width = itemPx;
      sp.height = itemPx;
      sp.visible = true;
      if (stack.count > 1) {
        const t = this.acquireText(txi++);
        t.text = String(stack.count);
        t.style = countStyle(s);
        t.anchor.set(1, 1);
        t.x = (slot.x + SLOT - 1) * s;
        t.y = (slot.y + SLOT - 1) * s;
        t.visible = true;
      }
    }

    // Held cursor stack (drawn in overlay layer following the mouse).
    for (const child of this.overlayLayer.removeChildren()) child.destroy();
    if (state.cursor) {
      const def = this.registry.item(state.cursor.id);
      const sp = new Sprite(
        this.tex.get(def ?? { id: state.cursor.id, name: state.cursor.id, maxStack: 64, color: "#9a9a9a" }),
      );
      sp.width = itemPx;
      sp.height = itemPx;
      sp.x = ui.cursorX * s - itemPx / 2;
      sp.y = ui.cursorY * s - itemPx / 2;
      this.overlayLayer.addChild(sp);
      if (state.cursor.count > 1) {
        const t = new Text({ text: String(state.cursor.count), style: countStyle(s) });
        t.anchor.set(0.5, 0.5);
        t.x = ui.cursorX * s + itemPx / 4;
        t.y = ui.cursorY * s + itemPx / 4;
        this.overlayLayer.addChild(t);
      }
    }

    for (let i = spi; i < this.spritePool.length; i++) this.spritePool[i].visible = false;
    for (let i = txi; i < this.textPool.length; i++) this.textPool[i].visible = false;

    // Highlights.
    const hl = this.highlight;
    hl.clear();
    for (const id of ui.dragSlots) {
      const rect = this.geo.slots.find((sl) => sl.id === id);
      if (rect) hl.rect(rect.x * s, rect.y * s, SLOT * s, SLOT * s).stroke({ color: "#ffffff", width: 2 });
    }
    if (ui.hoverSlot != null) {
      const rect = this.geo.slots.find((sl) => sl.id === ui.hoverSlot);
      if (rect) hl.rect(rect.x * s + 1, rect.y * s + 1, SLOT * s - 2, SLOT * s - 2).fill({ color: "#ffffff", alpha: 0.35 });
    }
  }

  destroy(): void {
    this.destroyed = true;
    // If init() hasn't finished yet, it will self-destroy on completion.
    if (!this.ready) return;
    this.ready = false;
    this.tex?.destroy();
    try {
      this.app.destroy(true, { children: true, texture: true });
    } catch {
      /* ignore */
    }
  }
}
