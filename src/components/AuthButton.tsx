import { useEffect, useState } from "react";
import { useAuthStore } from "../firebase/authStore";
import { syncUp, syncDown } from "../firebase/sync";
import { syncHistory } from "../firebase/historySync";

export function AuthButton() {
  const configured = useAuthStore((s) => s.configured);
  const user = useAuthStore((s) => s.user);
  const init = useAuthStore((s) => s.init);
  const signInGoogle = useAuthStore((s) => s.signInGoogle);
  const signInAnon = useAuthStore((s) => s.signInAnon);
  const signOut = useAuthStore((s) => s.signOut);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (user) {
      syncDown(user.uid).catch(() => {});
      syncHistory(user.uid).catch(() => {});
    }
  }, [user]);

  async function doSyncUp(uid: string) {
    setStatus("Syncing...");
    const ok = await syncUp(uid);
    await syncHistory(uid).catch(() => 0);
    setStatus(ok ? "Settings + history synced to cloud." : "Sync failed - is Firestore enabled?");
  }
  async function doSyncDown(uid: string) {
    setStatus("Restoring...");
    const ok = await syncDown(uid);
    const pulled = await syncHistory(uid).catch(() => 0);
    setStatus(ok || pulled > 0 ? `Restored from cloud (${pulled} attempts).` : "Nothing to restore yet.");
  }

  if (!configured) {
    return <span className="cloud-off" title="Set VITE_FIREBASE_* env vars to enable cloud features">Offline mode</span>;
  }

  if (!user) {
    return (
      <div className="auth">
        <button className="btn small" onClick={() => void signInGoogle().catch(() => {})}>
          Sign in
        </button>
        <button className="btn small" onClick={() => void signInAnon().catch(() => {})}>
          Guest
        </button>
      </div>
    );
  }

  return (
    <div className="auth">
      <button className="btn small" onClick={() => setOpen((o) => !o)}>
        {user.anonymous ? "Guest" : user.name}
      </button>
      {open && (
        <div className="auth-menu">
          {user.anonymous && (
            <button onClick={() => void signInGoogle().catch(() => {})}>Upgrade to Google account</button>
          )}
          <button onClick={() => void doSyncUp(user.uid)}>Sync settings to cloud</button>
          <button onClick={() => void doSyncDown(user.uid)}>Restore from cloud</button>
          <button onClick={() => void signOut()}>Sign out</button>
          {status && <span className="auth-status">{status}</span>}
        </div>
      )}
    </div>
  );
}
