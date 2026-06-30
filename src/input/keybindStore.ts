import { create } from "zustand";
import { ACTIONS, defaultBinds, type ActionId } from "./actions";

export interface KeybindProfile {
  name: string;
  binds: Record<ActionId, string>;
}

interface KeybindStore {
  profiles: KeybindProfile[];
  active: number;
  binds(): Record<ActionId, string>;
  setBind: (action: ActionId, code: string) => { conflict?: ActionId };
  conflictFor: (code: string, exclude: ActionId) => ActionId | null;
  resetActive: () => void;
  selectProfile: (index: number) => void;
  addProfile: (name: string) => void;
  renameProfile: (index: number, name: string) => void;
  deleteProfile: (index: number) => void;
  exportActive: () => string;
  importProfile: (json: string) => boolean;
}

const KEY = "craftpace.keybinds.v1";

function load(): { profiles: KeybindProfile[]; active: number } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.profiles) && parsed.profiles.length) {
        // backfill any missing actions with defaults
        for (const p of parsed.profiles) p.binds = { ...defaultBinds(), ...p.binds };
        const active = Math.max(0, Math.min(parsed.active ?? 0, parsed.profiles.length - 1));
        return { profiles: parsed.profiles, active };
      }
    }
  } catch {
    /* ignore */
  }
  return { profiles: [{ name: "Default", binds: defaultBinds() }], active: 0 };
}

function persist(profiles: KeybindProfile[], active: number): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ profiles, active }));
  } catch {
    /* ignore */
  }
}

const initial = load();

export const useKeybindStore = create<KeybindStore>((set, get) => ({
  profiles: initial.profiles,
  active: initial.active,

  binds: () => get().profiles[get().active].binds,

  conflictFor: (code, exclude) => {
    const binds = get().binds();
    for (const a of ACTIONS) {
      if (a.id !== exclude && binds[a.id] === code) return a.id;
    }
    return null;
  },

  setBind: (action, code) => {
    const { profiles, active, conflictFor } = get();
    const conflict = conflictFor(code, action);
    const next = profiles.map((p, i) =>
      i === active ? { ...p, binds: { ...p.binds, [action]: code } } : p,
    );
    // Unbind the conflicting action (single-binding policy, like Minecraft).
    if (conflict) next[active].binds[conflict] = "";
    set({ profiles: next });
    persist(next, active);
    return { conflict: conflict ?? undefined };
  },

  resetActive: () => {
    const { profiles, active } = get();
    const next = profiles.map((p, i) => (i === active ? { ...p, binds: defaultBinds() } : p));
    set({ profiles: next });
    persist(next, active);
  },

  selectProfile: (index) => {
    set({ active: index });
    persist(get().profiles, index);
  },

  addProfile: (name) => {
    const next = [...get().profiles, { name, binds: defaultBinds() }];
    set({ profiles: next, active: next.length - 1 });
    persist(next, next.length - 1);
  },

  renameProfile: (index, name) => {
    const next = get().profiles.map((p, i) => (i === index ? { ...p, name } : p));
    set({ profiles: next });
    persist(next, get().active);
  },

  deleteProfile: (index) => {
    const { profiles } = get();
    if (profiles.length <= 1) return;
    const next = profiles.filter((_, i) => i !== index);
    const active = Math.max(0, Math.min(get().active, next.length - 1));
    set({ profiles: next, active });
    persist(next, active);
  },

  exportActive: () => JSON.stringify(get().profiles[get().active], null, 2),

  importProfile: (json) => {
    try {
      const p = JSON.parse(json) as KeybindProfile;
      if (!p.binds || typeof p.binds !== "object") return false;
      const profile: KeybindProfile = { name: p.name || "Imported", binds: { ...defaultBinds(), ...p.binds } };
      const next = [...get().profiles, profile];
      set({ profiles: next, active: next.length - 1 });
      persist(next, next.length - 1);
      return true;
    } catch {
      return false;
    }
  },
}));
