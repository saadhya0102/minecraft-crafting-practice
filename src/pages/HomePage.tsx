export interface HomeNav {
  goPractice: (opts?: { mode?: "challenge" | "free"; layout?: string }) => void;
  goTab: (tab: "builder" | "leaderboard" | "keybinds" | "history") => void;
}

const CARDS = [
  { key: "ct", title: "Crafting Table", desc: "Open the 3x3 bench and free-craft anything.", action: (n: HomeNav) => n.goPractice({ mode: "free", layout: "crafting_table" }) },
  { key: "inv", title: "Player Inventory", desc: "Practice the 2x2 player crafting grid.", action: (n: HomeNav) => n.goPractice({ mode: "free", layout: "inventory" }) },
  { key: "furnace", title: "Furnace", desc: "Smelt ores and arrange fuel.", action: (n: HomeNav) => n.goPractice({ mode: "free", layout: "furnace" }) },
  { key: "chest", title: "Chest", desc: "Loot, sort, and clean-up drills.", action: (n: HomeNav) => n.goPractice({ mode: "free", layout: "chest" }) },
  { key: "challenges", title: "Challenges", desc: "Timed BT loot, iron tools, boat+bucket+doors.", action: (n: HomeNav) => n.goPractice({ mode: "challenge" }) },
  { key: "builder", title: "Challenge Builder", desc: "Create and share your own drills.", action: (n: HomeNav) => n.goTab("builder") },
  { key: "leaderboard", title: "Leaderboards", desc: "Compare your best times.", action: (n: HomeNav) => n.goTab("leaderboard") },
  { key: "keybinds", title: "Keybinds", desc: "Remap controls to match your Minecraft.", action: (n: HomeNav) => n.goTab("keybinds") },
  { key: "history", title: "History", desc: "Trends, PBs, and attempt replays.", action: (n: HomeNav) => n.goTab("history") },
];

export function HomePage({ nav }: { nav: HomeNav }) {
  return (
    <div className="home">
      <div className="home-hero">
        <h1>CraftPace</h1>
        <p>Pixel-accurate Minecraft inventory &amp; crafting practice for speedrunners.</p>
      </div>
      <div className="home-grid">
        {CARDS.map((c) => (
          <button key={c.key} className="home-card" onClick={() => c.action(nav)}>
            <span className="home-card-title">{c.title}</span>
            <span className="home-card-desc">{c.desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
