import { useGameStore } from "../store/gameStore";
import { useKeybindStore } from "./keybindStore";
import { ACTIONS, type ActionId } from "./actions";

/** Dispatched on window for tool actions so the UI/challenge layer can react. */
export function emitAction(id: ActionId): void {
  window.dispatchEvent(new CustomEvent("craftpace:action", { detail: { id } }));
}

/**
 * Installs a global keydown handler that maps the active keybind profile to
 * engine events, acting on the slot currently under the cursor.
 */
export function installKeyboard(getHover: () => number | null): () => void {
  const onKey = (e: KeyboardEvent) => {
    // Don't hijack typing in text fields / dropdowns. (Buttons are intentionally
    // NOT blocked: a tab/reset button keeps focus after a click, and blocking it
    // would silently swallow every keybind on the practice screen.)
    const tag = (e.target as HTMLElement)?.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || (e.target as HTMLElement)?.isContentEditable) return;

    // Treat numpad digits the same as the top-row digits.
    const code = e.code.replace(/^Numpad([1-9])$/, "Digit$1");
    const binds = useKeybindStore.getState().binds();
    const action = ACTIONS.find((a) => binds[a.id] && binds[a.id] === code);
    // Parity-only binds (movement, chat, screenshot, etc.) are catalogued for
    // remapping but never intercepted - let the browser handle those keys.
    if (!action || !action.functional) return;

    const game = useGameStore.getState();
    const hover = getHover();

    if (action.requiresSlot && hover == null) return;

    switch (action.id) {
      case "drop":
        e.preventDefault();
        game.dispatch({ t: "drop", slot: hover!, whole: e.ctrlKey || e.metaKey });
        break;
      case "swapOffhand":
        e.preventDefault();
        game.dispatch({ t: "offhand", slot: hover! });
        break;
      case "resetAttempt":
        e.preventDefault();
        game.reset();
        emitAction("resetAttempt");
        break;
      case "toggleInstantSmelt":
        e.preventDefault();
        game.setInstantSmelt(!game.instantSmelt);
        break;
      case "toggleRecipeBook":
        e.preventDefault();
        emitAction(action.id);
        break;
      default: {
        if (action.id.startsWith("hotbar")) {
          const idx = Number(action.id.slice(6)) - 1;
          e.preventDefault();
          game.dispatch({ t: "number", slot: hover!, hotbar: idx });
        }
      }
    }
  };

  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}
