import { useEffect, useState } from "react";
import { GuiCanvas } from "../components/GuiCanvas";
import { ChallengePanel } from "../components/ChallengePanel";
import { useGameStore } from "../store/gameStore";
import { useChallengeStore } from "../challenges/challengeStore";
import { BUILTIN_CHALLENGES } from "../challenges/builtins";
import { getCustomChallenges } from "../challenges/customStore";
import { getBundle, listVersions } from "../../data/index";
import { useSettingsStore } from "../store/settingsStore";

type Mode = "challenge" | "free";

const FREE_LAYOUTS = [
  { id: "crafting_table", label: "Crafting Table" },
  { id: "inventory", label: "Inventory (2x2)" },
  { id: "furnace", label: "Furnace" },
  { id: "chest", label: "Chest" },
];

export function PracticePage({ initialMode, initialLayout }: { initialMode?: Mode; initialLayout?: string }) {
  const version = useGameStore((s) => s.version);
  const instantSmelt = useGameStore((s) => s.instantSmelt);
  const creative = useGameStore((s) => s.creative);
  const setVersion = useGameStore((s) => s.setVersion);
  const setInstantSmelt = useGameStore((s) => s.setInstantSmelt);
  const loadSetup = useGameStore((s) => s.loadSetup);
  const reset = useGameStore((s) => s.reset);
  const select = useChallengeStore((s) => s.select);
  const guiScale = useSettingsStore((s) => s.guiScale);
  const setGuiScale = useSettingsStore((s) => s.setGuiScale);
  const highContrast = useSettingsStore((s) => s.highContrast);
  const setHighContrast = useSettingsStore((s) => s.setHighContrast);
  const reducedMotion = useSettingsStore((s) => s.reducedMotion);
  const setReducedMotion = useSettingsStore((s) => s.setReducedMotion);

  const [mode, setMode] = useState<Mode>(initialMode ?? "challenge");
  const [challengeId, setChallengeId] = useState(BUILTIN_CHALLENGES[0].id);
  const [freeLayout, setFreeLayout] = useState(initialLayout ?? "crafting_table");
  const [presetId, setPresetId] = useState(""); // "" = empty layout

  const presets = getBundle(version).presets;
  const allChallenges = [...BUILTIN_CHALLENGES, ...getCustomChallenges()];
  const matchingPresets = presets.filter((p) => p.setup.layoutId === freeLayout);

  useEffect(() => {
    if (mode === "challenge") {
      const c = allChallenges.find((x) => x.id === challengeId) ?? BUILTIN_CHALLENGES[0];
      select(c);
    } else {
      select(null);
      const preset = presets.find((x) => x.id === presetId && x.setup.layoutId === freeLayout);
      loadSetup(preset ? preset.setup : { layoutId: freeLayout }, { creative });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, challengeId, presetId, freeLayout, version]);

  return (
    <div className="practice">
      <aside className="sidebar">
        <div className="seg">
          <button className={mode === "challenge" ? "seg-btn active" : "seg-btn"} onClick={() => setMode("challenge")}>
            Challenges
          </button>
          <button className={mode === "free" ? "seg-btn active" : "seg-btn"} onClick={() => setMode("free")}>
            Free Practice
          </button>
        </div>

        <label className="field">
          <span>Version</span>
          <select value={version} onChange={(e) => setVersion(e.target.value)}>
            {listVersions().map((v) => (
              <option key={v.id} value={v.id}>
                {v.label}
              </option>
            ))}
          </select>
        </label>

        {mode === "challenge" ? (
          <>
            <label className="field">
              <span>Challenge</span>
              <select value={challengeId} onChange={(e) => setChallengeId(e.target.value)}>
                <optgroup label="Built-in">
                  {BUILTIN_CHALLENGES.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </optgroup>
                {getCustomChallenges().length > 0 && (
                  <optgroup label="My Challenges">
                    {getCustomChallenges().map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </label>
            <p className="hint">{allChallenges.find((c) => c.id === challengeId)?.description}</p>
            <ChallengePanel />
          </>
        ) : (
          <>
            <label className="field">
              <span>Screen</span>
              <div className="layout-picker">
                {FREE_LAYOUTS.map((l) => (
                  <button
                    key={l.id}
                    className={freeLayout === l.id ? "layout-btn active" : "layout-btn"}
                    onClick={() => {
                      setFreeLayout(l.id);
                      setPresetId("");
                    }}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </label>
            <label className="field">
              <span>Starting Setup</span>
              <select value={presetId} onChange={(e) => setPresetId(e.target.value)}>
                <option value="">Empty</option>
                {matchingPresets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
            <p className="hint">{matchingPresets.find((p) => p.id === presetId)?.description}</p>
            <div className="toggles">
              <label className="check">
                <input type="checkbox" checked={instantSmelt} onChange={(e) => setInstantSmelt(e.target.checked)} />
                Instant smelt
              </label>
              <label className="check">
                <input
                  type="checkbox"
                  checked={creative}
                  onChange={(e) => {
                    const p = presets.find((x) => x.id === presetId && x.setup.layoutId === freeLayout);
                    loadSetup(p ? p.setup : { layoutId: freeLayout }, { creative: e.target.checked });
                  }}
                />
                Creative (middle-click clone)
              </label>
            </div>
            <button className="btn" onClick={reset}>
              Reset (R)
            </button>
          </>
        )}

        <p className="hint small">
          Left/right click, shift-click, double-click, drag to distribute, number keys to swap, Q to drop, F for off-hand.
        </p>

        <div className="display-settings">
          <h4>Display</h4>
          <label className="field">
            <span>GUI scale: {guiScale}x</span>
            <input
              type="range"
              min={2}
              max={4}
              step={1}
              value={guiScale}
              onChange={(e) => setGuiScale(Number(e.target.value))}
            />
          </label>
          <label className="check">
            <input type="checkbox" checked={highContrast} onChange={(e) => setHighContrast(e.target.checked)} />
            High contrast
          </label>
          <label className="check">
            <input type="checkbox" checked={reducedMotion} onChange={(e) => setReducedMotion(e.target.checked)} />
            Reduce motion
          </label>
        </div>
      </aside>
      <section className="stage">
        <GuiCanvas scale={guiScale} />
      </section>
    </div>
  );
}
