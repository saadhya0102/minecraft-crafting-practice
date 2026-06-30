import { getDb } from "./client";
import { useAuthStore } from "./authStore";
import type { Attempt } from "../recorder/types";
import { getAllAttempts, putAttempt } from "../lib/idb";

/** Strip undefined fields (Firestore rejects them) via a JSON round-trip. */
function sanitize<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

/** Push a single completed attempt to the signed-in user's cloud history. */
export async function pushAttempt(a: Attempt): Promise<void> {
  const { configured, user } = useAuthStore.getState();
  if (!configured || !user) return;
  const db = await getDb();
  if (!db) return;
  try {
    const { doc, setDoc } = await import("firebase/firestore");
    await setDoc(doc(db, "users", user.uid, "attempts", a.id), sanitize(a));
  } catch {
    /* offline / rules not deployed - keep local copy */
  }
}

/**
 * Two-way merge of attempt history between IndexedDB and the cloud:
 * cloud-only attempts are pulled into IDB, local-only ones are pushed up.
 * Returns the number of attempts newly pulled into local history.
 */
export async function syncHistory(uid: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  try {
    const { collection, getDocs, doc, setDoc } = await import("firebase/firestore");
    const snap = await getDocs(collection(db, "users", uid, "attempts"));
    const cloud = snap.docs.map((d) => d.data() as Attempt);
    const cloudIds = new Set(cloud.map((a) => a.id));

    const local = await getAllAttempts();
    const localIds = new Set(local.map((a) => a.id));

    let pulled = 0;
    for (const a of cloud) {
      if (!localIds.has(a.id)) {
        await putAttempt(a);
        pulled++;
      }
    }
    for (const a of local) {
      if (!cloudIds.has(a.id)) await setDoc(doc(db, "users", uid, "attempts", a.id), sanitize(a));
    }

    if (pulled > 0) window.dispatchEvent(new CustomEvent("craftpace:history-changed"));
    return pulled;
  } catch {
    return 0;
  }
}
