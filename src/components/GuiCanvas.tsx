import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";
import { PixiGui, type UiState } from "../render/PixiGui";
import { computeGeometry, slotAt, type GuiGeometry } from "../render/geometry";
import { installKeyboard } from "../input/keyboardHandler";

const DOUBLE_MS = 250;

export function GuiCanvas({ scale = 3 }: { scale?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const guiRef = useRef<PixiGui | null>(null);
  const geoRef = useRef<GuiGeometry | null>(null);
  const scaleRef = useRef(scale);
  const uiRef = useRef<UiState>({ hoverSlot: null, cursorX: 0, cursorY: 0, dragSlots: [] });
  const draggingRef = useRef(false);
  const lastLeftRef = useRef<{ t: number; slot: number | null }>({ t: 0, slot: null });

  // Init Pixi exactly once for the lifetime of the canvas. The await-based
  // cleanup tears down even if React (StrictMode) unmounts before init resolves.
  useEffect(() => {
    const canvas = canvasRef.current!;
    const gui = new PixiGui();
    const { registry } = useGameStore.getState();
    const ready = gui.init(canvas, registry).then(() => {
      guiRef.current = gui;
      const geo = computeGeometry(useGameStore.getState().state.layout);
      geoRef.current = geo;
      gui.setLayout(geo, scaleRef.current);
      gui.requestDraw(useGameStore.getState().state, uiRef.current);
      return gui;
    });
    return () => {
      ready.then((g) => g.destroy()).catch(() => gui.destroy());
      if (guiRef.current === gui) guiRef.current = null;
    };
  }, []);

  // Re-render on every state change, and rebuild geometry when the layout changes.
  useEffect(() => {
    return useGameStore.subscribe((s, prev) => {
      const gui = guiRef.current;
      if (!gui) return;
      if (s.registry !== prev.registry) gui.setRegistry(s.registry);
      if (s.state.layout !== prev.state.layout || s.registry !== prev.registry) {
        const geo = computeGeometry(s.state.layout);
        geoRef.current = geo;
        gui.setLayout(geo, scaleRef.current);
      }
      gui.requestDraw(s.state, uiRef.current);
    });
  }, []);

  // Apply GUI-scale changes without re-creating the Pixi application.
  useEffect(() => {
    scaleRef.current = scale;
    const gui = guiRef.current;
    if (gui && geoRef.current) {
      gui.setLayout(geoRef.current, scale);
      gui.requestDraw(useGameStore.getState().state, uiRef.current);
    }
  }, [scale]);

  // Keyboard (number keys, drop, offhand, etc.) via the remappable keybind system.
  useEffect(() => {
    const getHover = () => uiRef.current.hoverSlot;
    return installKeyboard(getHover);
  }, []);

  function toGui(e: React.PointerEvent): { gx: number; gy: number; slot: number | null } {
    const rect = canvasRef.current!.getBoundingClientRect();
    const geo = geoRef.current;
    if (!geo || rect.width <= 0 || rect.height <= 0) return { gx: 0, gy: 0, slot: null };
    // Map using the canvas's actual rendered size so clicks stay accurate
    // regardless of GUI scale, devicePixelRatio, or any CSS sizing.
    const gx = ((e.clientX - rect.left) * geo.width) / rect.width;
    const gy = ((e.clientY - rect.top) * geo.height) / rect.height;
    return { gx, gy, slot: slotAt(geo, gx, gy) };
  }

  function redraw() {
    const gui = guiRef.current;
    if (gui) gui.requestDraw(useGameStore.getState().state, uiRef.current);
  }

  function stackableHere(slot: number | null): boolean {
    const { state, registry } = useGameStore.getState();
    if (slot == null) return false;
    const def = state.layout.slots[slot];
    if (!def || def.kind === "craftOut" || def.kind === "furnaceOut") return false;
    const cur = state.cursor;
    const s = state.slots[slot];
    if (!cur) return true;
    if (!s) return true;
    return s.id === cur.id && s.count < registry.maxStack(s.id);
  }

  function onPointerDown(e: React.PointerEvent) {
    e.preventDefault();
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const { gx, gy, slot } = toGui(e);
    uiRef.current.cursorX = gx;
    uiRef.current.cursorY = gy;
    uiRef.current.hoverSlot = slot; // so keyboard actions work even without a prior move
    const { dispatch, state, creative } = useGameStore.getState();

    if (e.button === 1) {
      if (slot != null && creative) dispatch({ t: "pick", slot });
      redraw();
      return;
    }

    if (slot == null) {
      if (state.cursor) dispatch({ t: "dropCursor", whole: e.button === 0 });
      redraw();
      return;
    }

    // Shift + click = quick-move (matches Minecraft).
    if (e.button === 0 && e.shiftKey) {
      dispatch({ t: "shiftLeft", slot });
      redraw();
      return;
    }

    if (e.button === 0) {
      const now = performance.now();
      const isDouble = now - lastLeftRef.current.t < DOUBLE_MS && lastLeftRef.current.slot === slot;
      lastLeftRef.current = { t: now, slot };
      if (isDouble) {
        if (draggingRef.current) endDrag();
        dispatch({ t: "double", slot });
        redraw();
        return;
      }
    }

    const button = e.button === 2 ? "right" : "left";
    if (state.cursor && stackableHere(slot)) {
      draggingRef.current = true;
      uiRef.current.dragSlots = [slot];
      dispatch({ t: "dragStart", button });
      dispatch({ t: "dragAdd", slot });
    } else {
      dispatch(button === "right" ? { t: "right", slot } : { t: "left", slot });
    }
    redraw();
  }

  function onPointerMove(e: React.PointerEvent) {
    const { gx, gy, slot } = toGui(e);
    uiRef.current.cursorX = gx;
    uiRef.current.cursorY = gy;
    uiRef.current.hoverSlot = slot;
    if (draggingRef.current && slot != null && !uiRef.current.dragSlots.includes(slot)) {
      uiRef.current.dragSlots.push(slot);
      useGameStore.getState().dispatch({ t: "dragAdd", slot });
    }
    redraw();
  }

  function endDrag() {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    useGameStore.getState().dispatch({ t: "dragEnd" });
    uiRef.current.dragSlots = [];
    redraw();
  }

  function onPointerUp(e: React.PointerEvent) {
    e.preventDefault();
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    endDrag();
  }

  function onPointerEnter(e: React.PointerEvent) {
    const { gx, gy, slot } = toGui(e);
    uiRef.current.cursorX = gx;
    uiRef.current.cursorY = gy;
    uiRef.current.hoverSlot = slot;
    redraw();
  }

  function onPointerLeave() {
    // Keep an active drag alive when the pointer leaves the canvas; it ends on
    // pointerup/cancel (pointer capture keeps delivering events).
    if (!draggingRef.current) {
      uiRef.current.hoverSlot = null;
      redraw();
    }
  }

  function onPointerCancel(e: React.PointerEvent) {
    (e.target as Element).releasePointerCapture?.(e.pointerId);
    endDrag();
    uiRef.current.hoverSlot = null;
    redraw();
  }

  return (
    <canvas
      ref={canvasRef}
      className="gui-canvas"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerCancel={onPointerCancel}
      onLostPointerCapture={() => endDrag()}
      onContextMenu={(e) => e.preventDefault()}
      style={{ imageRendering: "pixelated", touchAction: "none" }}
    />
  );
}
