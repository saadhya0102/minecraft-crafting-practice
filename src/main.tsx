import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./styles.css";

// Note: no <StrictMode> here. Its dev-only double-invocation of effects races
// two PixiJS Application.init() calls on the same canvas, breaking the WebGL
// context (blank/grey canvas). Production never double-invokes, so this also
// matches production behavior.
createRoot(document.getElementById("root")!).render(<App />);
