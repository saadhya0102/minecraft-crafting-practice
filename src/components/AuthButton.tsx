import { useEffect, useState } from "react";
import { useAuthStore } from "../firebase/authStore";
import { syncUp, syncDown } from "../firebase/sync";

export function AuthButton() {
  const configured = useAuthStore((s) => s.configured);
  const user = useAuthStore((s) => s.user);
  const init = useAuthStore((s) => s.init);
  const signInGoogle = useAuthStore((s) => s.signInGoogle);
  const signInAnon = useAuthStore((s) => s.signInAnon);
  const signOut = useAuthStore((s) => s.signOut);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (user) syncDown(user.uid);
  }, [user]);

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
            <button onClick={() => signInGoogle()}>Upgrade to Google account</button>
          )}
          <button onClick={() => syncUp(user.uid)}>Sync settings to cloud</button>
          <button onClick={() => syncDown(user.uid)}>Restore from cloud</button>
          <button onClick={() => signOut()}>Sign out</button>
        </div>
      )}
    </div>
  );
}
