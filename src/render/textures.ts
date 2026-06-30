import { CanvasSource, Texture } from "pixi.js";
import type { ItemDef } from "../../engine/registry";
import { itemIconCanvas } from "./itemIcon";

/**
 * Caches one WebGL texture per item, generated from the shared pixel-art icon
 * canvas so the GUI and the DOM tiles render identical art.
 */
export class TextureCache {
  private cache = new Map<string, Texture>();

  get(def: ItemDef): Texture {
    const existing = this.cache.get(def.id);
    if (existing) return existing;
    const source = new CanvasSource({ resource: itemIconCanvas(def), scaleMode: "nearest" });
    const tex = new Texture({ source });
    this.cache.set(def.id, tex);
    return tex;
  }

  destroy(): void {
    for (const t of this.cache.values()) t.destroy(true);
    this.cache.clear();
  }
}
