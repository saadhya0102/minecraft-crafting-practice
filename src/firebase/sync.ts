import { getDb } from "./client";

const KEYBINDS = "craftpace.keybinds.v1";
const CUSTOM = "craftpace.custom.v1";

/** Push local settings (keybinds + custom challenges) to the user's cloud doc. */
export async function syncUp(uid: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const { doc, setDoc } = await import("firebase/firestore");
  const payload = {
    keybinds: safeParse(localStorage.getItem(KEYBINDS)),
    custom: safeParse(localStorage.getItem(CUSTOM)),
    updatedAt: Date.now(),
  };
  await setDoc(doc(db, "users", uid), payload, { merge: true });
  return true;
}

/** Pull cloud settings into local storage (last-write-wins for simplicity). */
export async function syncDown(uid: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const { doc, getDoc } = await import("firebase/firestore");
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return false;
  const data = snap.data() as { keybinds?: unknown; custom?: unknown };
  if (data.keybinds) localStorage.setItem(KEYBINDS, JSON.stringify(data.keybinds));
  if (data.custom) localStorage.setItem(CUSTOM, JSON.stringify(data.custom));
  return true;
}

function safeParse(v: string | null): unknown {
  if (!v) return null;
  try {
    return JSON.parse(v);
  } catch {
    return null;
  }
}
