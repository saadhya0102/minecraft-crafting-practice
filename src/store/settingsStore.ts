import { create } from "zustand";

const KEY = "craftpace.settings.v1";

interface Settings {
  guiScale: number; // 2..4
  highContrast: boolean;
  reducedMotion: boolean;
  setGuiScale: (n: number) => void;
  setHighContrast: (b: boolean) => void;
  setReducedMotion: (b: boolean) => void;
  /** Re-read from localStorage (used after a cloud restore). */
  reload: () => void;
}

function load(): { guiScale: number; highContrast: boolean; reducedMotion: boolean } {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { guiScale: 3, highContrast: false, reducedMotion: false, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return {
    guiScale: 3,
    highContrast: false,
    reducedMotion: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
  };
}

function persist(s: Pick<Settings, "guiScale" | "highContrast" | "reducedMotion">): void {
  try {
    localStorage.setItem(KEY, JSON.stringify({ guiScale: s.guiScale, highContrast: s.highContrast, reducedMotion: s.reducedMotion }));
  } catch {
    /* ignore */
  }
}

export const useSettingsStore = create<Settings>((set, get) => ({
  ...load(),
  setGuiScale: (n) => {
    set({ guiScale: Math.max(2, Math.min(4, Math.round(n))) });
    persist(get());
  },
  setHighContrast: (b) => {
    set({ highContrast: b });
    persist(get());
  },
  setReducedMotion: (b) => {
    set({ reducedMotion: b });
    persist(get());
  },
  reload: () => set({ ...load() }),
}));
