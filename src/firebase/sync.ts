import { getDb } from "./client";
import { useKeybindStore } from "../input/keybindStore";
import { useSettingsStore } from "../store/settingsStore";

const KEYBINDS = "craftpace.keybinds.v1";
const CUSTOM = "craftpace.custom.v1";
const SETTINGS = "craftpace.settings.v1";

/** Push local settings (keybinds + custom challenges + display) to the cloud. */
export async function syncUp(uid: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const { doc, setDoc } = await import("firebase/firestore");
    const payload = {
      keybinds: safeParse(localStorage.getItem(KEYBINDS)),
      custom: safeParse(localStorage.getItem(CUSTOM)),
      settings: safeParse(localStorage.getItem(SETTINGS)),
      updatedAt: Date.now(),
    };
    await setDoc(doc(db, "users", uid), payload, { merge: true });
    return true;
  } catch {
    return false;
  }
}

/** Pull cloud settings into local storage and re-hydrate the running stores. */
export async function syncDown(uid: string): Promise<boolean> {
  try {
    const db = await getDb();
    if (!db) return false;
    const { doc, getDoc } = await import("firebase/firestore");
    const snap = await getDoc(doc(db, "users", uid));
    if (!snap.exists()) return false;
    const data = snap.data() as { keybinds?: unknown; custom?: unknown; settings?: unknown };
    if (data.keybinds) localStorage.setItem(KEYBINDS, JSON.stringify(data.keybinds));
    if (data.custom) localStorage.setItem(CUSTOM, JSON.stringify(data.custom));
    if (data.settings) localStorage.setItem(SETTINGS, JSON.stringify(data.settings));
    // Apply immediately so the UI reflects the restore without a page reload.
    useKeybindStore.getState().reload();
    useSettingsStore.getState().reload();
    window.dispatchEvent(new CustomEvent("craftpace:synced"));
    return true;
  } catch {
    return false;
  }
}

function safeParse(v: string | null): unknown {
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}
