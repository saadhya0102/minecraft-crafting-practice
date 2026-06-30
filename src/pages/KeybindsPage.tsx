import { useEffect, useState } from "react";
import { useKeybindStore } from "../input/keybindStore";
import { ACTIONS, GROUP_LABELS, GROUP_ORDER, codeLabel, type ActionId } from "../input/actions";

export function KeybindsPage() {
  const profiles = useKeybindStore((s) => s.profiles);
  const active = useKeybindStore((s) => s.active);
  const setBind = useKeybindStore((s) => s.setBind);
  const resetActive = useKeybindStore((s) => s.resetActive);
  const selectProfile = useKeybindStore((s) => s.selectProfile);
  const addProfile = useKeybindStore((s) => s.addProfile);
  const deleteProfile = useKeybindStore((s) => s.deleteProfile);
  const exportActive = useKeybindStore((s) => s.exportActive);
  const importProfile = useKeybindStore((s) => s.importProfile);

  const [listening, setListening] = useState<ActionId | null>(null);
  const [message, setMessage] = useState<string>("");
  const binds = profiles[active].binds;

  useEffect(() => {
    if (!listening) return;
    const onKey = (e: KeyboardEvent) => {
      e.preventDefault();
      if (e.code === "Escape") {
        setListening(null);
        return;
      }
      const res = setBind(listening, e.code);
      if (res.conflict) setMessage(`Reassigned from "${res.conflict}" (single-binding, like Minecraft).`);
      else setMessage("");
      setListening(null);
    };
    window.addEventListener("keydown", onKey, { capture: true });
    return () => window.removeEventListener("keydown", onKey, { capture: true });
  }, [listening, setBind]);

  const groups = GROUP_ORDER.map((g) => ({ title: GROUP_LABELS[g], items: ACTIONS.filter((a) => a.group === g) })).filter(
    (grp) => grp.items.length > 0,
  );

  return (
    <div className="keybinds">
      <div className="kb-head">
        <h2>Keybinds &amp; Remapping</h2>
        <div className="kb-profiles">
          <label className="field inline">
            <span>Profile</span>
            <select value={active} onChange={(e) => selectProfile(Number(e.target.value))}>
              {profiles.map((p, i) => (
                <option key={i} value={i}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>
          <button className="btn small" onClick={() => addProfile(`Profile ${profiles.length + 1}`)}>
            + New
          </button>
          <button className="btn small" onClick={() => deleteProfile(active)} disabled={profiles.length <= 1}>
            Delete
          </button>
          <button className="btn small" onClick={resetActive}>
            Reset to default
          </button>
          <button
            className="btn small"
            onClick={() => navigator.clipboard?.writeText(exportActive()).then(() => setMessage("Copied profile JSON to clipboard."))}
          >
            Export
          </button>
          <button
            className="btn small"
            onClick={() => {
              const json = prompt("Paste a keybind profile JSON:");
              if (json) setMessage(importProfile(json) ? "Imported profile." : "Invalid profile JSON.");
            }}
          >
            Import
          </button>
        </div>
      </div>

      {message && <p className="kb-message">{message}</p>}

      {groups.map((group) => (
        <div key={group.title} className="kb-group">
          <h3>{group.title}</h3>
          <table className="kb-table">
            <tbody>
              {group.items.map((a) => (
                <tr key={a.id}>
                  <td className="kb-label">
                    {a.label}
                    {a.note && <span className="kb-note">{a.note}</span>}
                  </td>
                  <td className="kb-bind">
                    <button
                      className={listening === a.id ? "key listening" : "key"}
                      disabled={!a.rebindable}
                      onClick={() => a.rebindable && setListening(a.id)}
                    >
                      {listening === a.id ? "Press a key..." : binds[a.id] ? codeLabel(binds[a.id]) : "Unbound"}
                    </button>
                    {!a.rebindable && <span className="kb-fixed">fixed</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
      <p className="hint">
        Mouse buttons, Shift (quick-move), and Ctrl (drop whole stack) are fixed, exactly as in Minecraft.
      </p>
    </div>
  );
}
