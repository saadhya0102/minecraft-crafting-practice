import { getAnalyticsClient } from "./client";

let consent = true;

export function setAnalyticsConsent(on: boolean): void {
  consent = on;
}

/** Fire-and-forget analytics event; no-op when unconfigured or consent off. */
export function track(event: string, params?: Record<string, unknown>): void {
  if (!consent) return;
  getAnalyticsClient()
    .then(async (a) => {
      if (!a) return;
      const { logEvent } = await import("firebase/analytics");
      logEvent(a, event, params as never);
    })
    .catch(() => {});
}
