import { getDb } from "./client";

export interface LeaderboardEntry {
  uid: string;
  name: string;
  durationMs: number;
  actions: number;
  at: number;
}

/** Client-side sanity floor. Real validation belongs in Cloud Functions. */
const MIN_PLAUSIBLE_MS = 400;

function boardId(version: string, challengeId: string): string {
  return `${version}__${challengeId}`;
}

export async function submitScore(params: {
  challengeId: string;
  version: string;
  durationMs: number;
  actions: number;
  uid: string;
  name: string;
}): Promise<{ ok: boolean; reason?: string }> {
  if (params.durationMs < MIN_PLAUSIBLE_MS) return { ok: false, reason: "implausibly fast" };
  const db = await getDb();
  if (!db) return { ok: false, reason: "not configured" };
  const { doc, getDoc, setDoc } = await import("firebase/firestore");
  const ref = doc(db, "leaderboards", boardId(params.version, params.challengeId), "scores", params.uid);
  const existing = await getDoc(ref);
  // Keep only the user's personal best.
  if (existing.exists() && (existing.data() as LeaderboardEntry).durationMs <= params.durationMs) {
    return { ok: true, reason: "not a PB" };
  }
  const entry: LeaderboardEntry = {
    uid: params.uid,
    name: params.name,
    durationMs: Math.round(params.durationMs),
    actions: params.actions,
    at: Date.now(),
  };
  await setDoc(ref, entry);
  return { ok: true };
}

export async function fetchTop(
  challengeId: string,
  version: string,
  n = 25,
): Promise<LeaderboardEntry[]> {
  const db = await getDb();
  if (!db) return [];
  const { collection, query, orderBy, limit, getDocs } = await import("firebase/firestore");
  const col = collection(db, "leaderboards", boardId(version, challengeId), "scores");
  const q = query(col, orderBy("durationMs", "asc"), limit(n));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data() as LeaderboardEntry);
}
