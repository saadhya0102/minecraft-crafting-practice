import { firebaseConfig, isFirebaseConfigured } from "./config";
import type { FirebaseApp } from "firebase/app";
import type { Auth } from "firebase/auth";
import type { Firestore } from "firebase/firestore";

// Lazy singletons. The heavy Firebase SDK is dynamically imported so it never
// touches the main bundle path when the project is unconfigured.
let appPromise: Promise<FirebaseApp> | null = null;

async function getApp(): Promise<FirebaseApp | null> {
  if (!isFirebaseConfigured) return null;
  if (!appPromise) {
    appPromise = import("firebase/app")
      .then(({ initializeApp }) => initializeApp(firebaseConfig as never))
      .catch(() => {
        // Reset so a transient failure doesn't permanently poison the singleton.
        appPromise = null;
        return null as never;
      });
  }
  return appPromise;
}

export async function getAuthClient(): Promise<Auth | null> {
  const app = await getApp();
  if (!app) return null;
  const { getAuth } = await import("firebase/auth");
  return getAuth(app);
}

export async function getDb(): Promise<Firestore | null> {
  const app = await getApp();
  if (!app) return null;
  const { getFirestore } = await import("firebase/firestore");
  return getFirestore(app);
}

export async function getAnalyticsClient() {
  const app = await getApp();
  if (!app) return null;
  try {
    const { getAnalytics, isSupported } = await import("firebase/analytics");
    if (!(await isSupported())) return null;
    return getAnalytics(app);
  } catch {
    return null;
  }
}
