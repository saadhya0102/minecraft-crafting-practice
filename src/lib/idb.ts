import type { Attempt } from "../recorder/types";

const DB = "craftpace";
const STORE = "attempts";
const VERSION = 1;

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: "id" });
        store.createIndex("byChallenge", "challengeId");
        store.createIndex("byTime", "completedAt");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function tx<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  return open().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const t = db.transaction(STORE, mode);
        const req = fn(t.objectStore(STORE));
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => reject(req.error);
      }),
  );
}

export async function putAttempt(a: Attempt): Promise<void> {
  await tx("readwrite", (s) => s.put(a));
}

export async function getAllAttempts(): Promise<Attempt[]> {
  const all = await tx<Attempt[]>("readonly", (s) => s.getAll() as IDBRequest<Attempt[]>);
  return all.sort((a, b) => b.completedAt - a.completedAt);
}

export async function deleteAttempt(id: string): Promise<void> {
  await tx("readwrite", (s) => s.delete(id));
}

export async function clearAttempts(): Promise<void> {
  await tx("readwrite", (s) => s.clear());
}
