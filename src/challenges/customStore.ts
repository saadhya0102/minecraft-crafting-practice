import type { Challenge } from "./types";

const KEY = "craftpace.custom.v1";

function read(): Challenge[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Challenge[]) : [];
  } catch {
    return [];
  }
}

function write(list: Challenge[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export function getCustomChallenges(): Challenge[] {
  return read();
}

export function saveCustomChallenge(c: Challenge): void {
  const list = read().filter((x) => x.id !== c.id);
  list.push(c);
  write(list);
}

export function deleteCustomChallenge(id: string): void {
  write(read().filter((x) => x.id !== id));
}

/** URL-safe base64 encode/decode of a challenge for share links. */
export function encodeChallenge(c: Challenge): string {
  const json = JSON.stringify(c);
  const b64 = btoa(unescape(encodeURIComponent(json)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function decodeChallenge(code: string): Challenge | null {
  try {
    const b64 = code.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(escape(atob(b64)));
    const c = JSON.parse(json) as Challenge;
    if (!c.id || !c.goal || !c.setup) return null;
    if (c.goal.kind === "haveItems" && !Array.isArray(c.goal.items)) return null;
    if (c.goal.kind === "matchLayout" && !c.goal.target) return null;
    return c;
  } catch {
    return null;
  }
}

export function shareUrlFor(c: Challenge): string {
  const base = `${location.origin}${location.pathname}`;
  return `${base}#challenge=${encodeChallenge(c)}`;
}

/** Parse a shared challenge from the current URL hash, if present. */
export function challengeFromHash(): Challenge | null {
  const m = location.hash.match(/challenge=([^&]+)/);
  return m ? decodeChallenge(m[1]) : null;
}
