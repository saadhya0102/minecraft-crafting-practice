import { create } from "zustand";
import { Engine } from "../../engine/engine";
import type { Registry } from "../../engine/registry";
import type { GameState } from "../../engine/types";
import { layoutById } from "../../engine/layouts";
import { applySetup, type SetupSnapshot } from "../../engine/setup";
import { getRegistry, getBundle, DEFAULT_VERSION } from "../../data/index";
import { applyGameEvent, type GameEvent } from "../engineEvents";

export type EventListener = (e: GameEvent, state: GameState) => void;

interface GameStore {
  version: string;
  registry: Registry;
  engine: Engine;
  state: GameState;
  rev: number;
  instantSmelt: boolean;
  creative: boolean;
  currentSetup: SetupSnapshot | null;
  eventListeners: Set<EventListener>;

  dispatch: (e: GameEvent) => void;
  loadSetup: (setup: SetupSnapshot, opts?: { creative?: boolean }) => void;
  reset: () => void;
  setVersion: (version: string) => void;
  setInstantSmelt: (on: boolean) => void;
  addEventListener: (l: EventListener) => () => void;
}

function buildEngine(version: string): { registry: Registry; engine: Engine } {
  const registry = getRegistry(version);
  const engine = new Engine(registry, getBundle(version).flags);
  return { registry, engine };
}

function freshState(engine: Engine, setup: SetupSnapshot, opts: { creative?: boolean; instantSmelt?: boolean }, registry: Registry): GameState {
  const layout = layoutById(setup.layoutId);
  const state = engine.create(layout, opts);
  applySetup(state, setup, registry);
  return state;
}

const initialVersion = DEFAULT_VERSION;
const { registry: initReg, engine: initEngine } = buildEngine(initialVersion);
const initialSetup: SetupSnapshot = { layoutId: "crafting_table" };

export const useGameStore = create<GameStore>((set, get) => ({
  version: initialVersion,
  registry: initReg,
  engine: initEngine,
  state: freshState(initEngine, initialSetup, {}, initReg),
  rev: 0,
  instantSmelt: false,
  creative: false,
  currentSetup: initialSetup,
  eventListeners: new Set(),

  dispatch: (e) => {
    const { engine, state, eventListeners } = get();
    applyGameEvent(engine, state, e);
    for (const l of eventListeners) l(e, state);
    set({ rev: get().rev + 1 });
  },

  loadSetup: (setup, opts) => {
    const { engine, registry, instantSmelt } = get();
    const creative = opts?.creative ?? false;
    const state = freshState(engine, setup, { creative, instantSmelt }, registry);
    set({ state, currentSetup: setup, creative, rev: get().rev + 1 });
  },

  reset: () => {
    const { currentSetup, loadSetup, creative } = get();
    if (currentSetup) loadSetup(currentSetup, { creative });
  },

  setVersion: (version) => {
    const { registry, engine } = buildEngine(version);
    const { currentSetup, creative, instantSmelt } = get();
    const setup = currentSetup ?? { layoutId: "crafting_table" };
    const state = freshState(engine, setup, { creative, instantSmelt }, registry);
    set({ version, registry, engine, state, rev: get().rev + 1 });
  },

  setInstantSmelt: (on) => {
    set({ instantSmelt: on });
    get().state.instantSmelt = on;
  },

  addEventListener: (l) => {
    const { eventListeners } = get();
    eventListeners.add(l);
    return () => eventListeners.delete(l);
  },
}));
