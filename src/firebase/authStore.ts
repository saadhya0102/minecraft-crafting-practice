import { create } from "zustand";
import { getAuthClient } from "./client";
import { isFirebaseConfigured } from "./config";

export interface AuthUser {
  uid: string;
  name: string;
  anonymous: boolean;
}

interface AuthStore {
  configured: boolean;
  ready: boolean;
  user: AuthUser | null;
  init: () => void;
  signInGoogle: () => Promise<void>;
  signInAnon: () => Promise<void>;
  signOut: () => Promise<void>;
}

let initialized = false;

export const useAuthStore = create<AuthStore>((set) => ({
  configured: isFirebaseConfigured,
  ready: !isFirebaseConfigured,
  user: null,

  init: () => {
    if (initialized || !isFirebaseConfigured) return;
    initialized = true;
    getAuthClient()
      .then(async (auth) => {
        if (!auth) return;
        const { onAuthStateChanged } = await import("firebase/auth");
        onAuthStateChanged(auth, (u) => {
          set({
            ready: true,
            user: u ? { uid: u.uid, name: u.displayName ?? "Guest", anonymous: u.isAnonymous } : null,
          });
        });
      })
      .catch(() => set({ ready: true }));
  },

  signInGoogle: async () => {
    const auth = await getAuthClient();
    if (!auth) return;
    const { GoogleAuthProvider, signInWithPopup, linkWithPopup } = await import("firebase/auth");
    const provider = new GoogleAuthProvider();
    // Upgrade an anonymous session in place when possible (keeps history).
    if (auth.currentUser?.isAnonymous) {
      try {
        await linkWithPopup(auth.currentUser, provider);
        return;
      } catch {
        /* fall through to a fresh sign-in */
      }
    }
    await signInWithPopup(auth, provider);
  },

  signInAnon: async () => {
    const auth = await getAuthClient();
    if (!auth) return;
    const { signInAnonymously } = await import("firebase/auth");
    await signInAnonymously(auth);
  },

  signOut: async () => {
    const auth = await getAuthClient();
    if (!auth) return;
    const { signOut } = await import("firebase/auth");
    await signOut(auth);
  },
}));
