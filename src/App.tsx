import { useEffect, useState } from "react";
import { GuiCanvas } from "./components/GuiCanvas";
import { AuthButton } from "./components/AuthButton";
import { HomePage } from "./pages/HomePage";
import { PracticePage } from "./pages/PracticePage";
import { BuilderPage } from "./pages/BuilderPage";
import { KeybindsPage } from "./pages/KeybindsPage";
import { HistoryPage } from "./pages/HistoryPage";
import { LeaderboardPage } from "./pages/LeaderboardPage";
import { challengeFromHash, saveCustomChallenge } from "./challenges/customStore";
import { useChallengeStore } from "./challenges/challengeStore";
import { useAuthStore } from "./firebase/authStore";
import { submitScore } from "./firebase/leaderboard";
import { track } from "./firebase/analytics";
import { useSettingsStore } from "./store/settingsStore";

type Tab = "home" | "practice" | "builder" | "leaderboard" | "keybinds" | "history";

const TABS: Tab[] = ["home", "practice", "builder", "leaderboard", "keybinds", "history"];

export function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [practiceInit, setPracticeInit] = useState<{ mode?: "challenge" | "free"; layout?: string }>({});
  const [practiceKey, setPracticeKey] = useState(0);
  const highContrast = useSettingsStore((s) => s.highContrast);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);

  const goPractice = (opts?: { mode?: "challenge" | "free"; layout?: string }) => {
    setPracticeInit(opts ?? {});
    setPracticeKey((k) => k + 1);
    setTab("practice");
  };

  // Apply accessibility preferences to the document root.
  useEffect(() => {
    document.documentElement.dataset.contrast = highContrast ? "high" : "normal";
    document.documentElement.dataset.motion = reducedMotion ? "reduced" : "full";
  }, [highContrast, reducedMotion]);

  // Load a shared challenge from the URL hash, if present.
  useEffect(() => {
    const shared = challengeFromHash();
    if (shared) {
      saveCustomChallenge(shared);
      useChallengeStore.getState().select(shared);
      setTab("practice");
      history.replaceState(null, "", location.pathname + location.search);
    }
  }, []);

  // Submit completed attempts to the leaderboard + analytics (when signed in).
  useEffect(() => {
    return useChallengeStore.getState().onResult((r) => {
      track("challenge_complete", { challenge: r.challengeId, version: r.version, ms: Math.round(r.durationMs) });
      const { user, configured } = useAuthStore.getState();
      if (configured && user) {
        submitScore({
          challengeId: r.challengeId,
          version: r.version,
          durationMs: r.durationMs,
          actions: r.actions,
          uid: user.uid,
          name: user.name,
        }).catch(() => {});
      }
    });
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <button className="brand" onClick={() => setTab("home")}>
          <span className="brand-mark">⛏</span> CraftPace
          <span className="brand-sub">Minecraft Crafting Trainer</span>
        </button>
        <nav className="tabs">
          {TABS.map((t) => (
            <button key={t} className={tab === t ? "tab active" : "tab"} onClick={() => setTab(t)}>
              {t[0].toUpperCase() + t.slice(1)}
            </button>
          ))}
        </nav>
        <AuthButton />
      </header>
      <main className="content">
        {tab === "home" && (
          <HomePage nav={{ goPractice, goTab: (t) => setTab(t) }} />
        )}
        {tab === "practice" && (
          <PracticePage key={practiceKey} initialMode={practiceInit.mode} initialLayout={practiceInit.layout} />
        )}
        {tab === "builder" && <BuilderPage />}
        {tab === "leaderboard" && <LeaderboardPage />}
        {tab === "keybinds" && <KeybindsPage />}
        {tab === "history" && <HistoryPage onPlay={() => setTab("practice")} />}
      </main>
    </div>
  );
}

export { GuiCanvas };
