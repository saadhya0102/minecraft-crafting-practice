import { useMemo, useState } from "react";
import { ItemSprite } from "../components/ItemSprite";
import { SetupEditor, emptyWork, workToSetup, type WorkSetup } from "../components/SetupEditor";
import { useGameStore } from "../store/gameStore";
import { getRegistry } from "../../data/index";
import { CATEGORIES } from "../../data/1.16.1/items";
import type { Challenge, Goal, ItemReq } from "../challenges/types";
import {
  getCustomChallenges,
  saveCustomChallenge,
  deleteCustomChallenge,
  shareUrlFor,
  decodeChallenge,
} from "../challenges/customStore";

const LAYOUTS = [
  { id: "crafting_table", label: "Crafting Table" },
  { id: "inventory", label: "Inventory (2x2)" },
  { id: "furnace", label: "Furnace" },
  { id: "chest", label: "Chest" },
];

export function BuilderPage() {
  const version = useGameStore((s) => s.version);
  const registry = getRegistry(version);

  const [name, setName] = useState("My Challenge");
  const [description, setDescription] = useState("");
  const [layoutId, setLayoutId] = useState("crafting_table");
  const [work, setWork] = useState<WorkSetup>(() => emptyWork("crafting_table"));
  const [selectedItem, setSelectedItem] = useState<string | null>("minecraft:oak_planks");
  const [selectedCount, setSelectedCount] = useState(1);
  const [category, setCategory] = useState<string>("building");
  const [search, setSearch] = useState("");
  const [goalKind, setGoalKind] = useState<Goal["kind"]>("haveItems");
  const [goalItems, setGoalItems] = useState<ItemReq[]>([]);
  const [savedList, setSavedList] = useState<Challenge[]>(() => getCustomChallenges());
  const [message, setMessage] = useState("");

  const palette = useMemo(() => {
    const q = search.trim().toLowerCase();
    return registry
      .allItems()
      .filter((i) => (q ? i.name.toLowerCase().includes(q) || i.id.includes(q) : i.category === category));
  }, [registry, category, search]);

  function changeLayout(id: string) {
    setLayoutId(id);
    setWork(emptyWork(id));
    if (id !== "chest" && goalKind === "emptyContainer") setGoalKind("haveItems");
  }

  function addGoalItem() {
    if (!selectedItem) return;
    setGoalItems((g) => [...g.filter((x) => x.id !== selectedItem), { id: selectedItem, count: selectedCount }]);
  }

  function buildChallenge(): Challenge {
    const goal: Goal =
      goalKind === "emptyContainer"
        ? { kind: "emptyContainer" }
        : goalKind === "matchLayout"
          ? { kind: "matchLayout", target: workToSetup(work) }
          : { kind: "haveItems", items: goalItems.length ? goalItems : [{ id: selectedItem ?? "minecraft:oak_boat", count: 1 }] };

    const splits =
      goal.kind === "haveItems"
        ? goal.items.map((r) => ({ id: r.id, name: registry.name(r.id) + (r.count && r.count > 1 ? ` x${r.count}` : ""), req: r }))
        : undefined;

    return {
      id: `custom_${Date.now()}`,
      name: name || "Untitled",
      description,
      version,
      layoutId,
      setup: workToSetup(work),
      goal,
      splits,
      scoring: "time",
    };
  }

  function save() {
    const c = buildChallenge();
    saveCustomChallenge(c);
    setSavedList(getCustomChallenges());
    setMessage(`Saved "${c.name}". Find it under Challenges in Practice.`);
  }

  function share() {
    const c = buildChallenge();
    saveCustomChallenge(c);
    setSavedList(getCustomChallenges());
    const url = shareUrlFor(c);
    navigator.clipboard?.writeText(url);
    setMessage("Share link copied to clipboard.");
  }

  function importCode() {
    const code = prompt("Paste a share link or challenge code:");
    if (!code) return;
    const raw = code.includes("challenge=") ? code.split("challenge=")[1].split("&")[0] : code.trim();
    const c = decodeChallenge(raw);
    if (!c) {
      setMessage("Could not read that challenge code.");
      return;
    }
    saveCustomChallenge(c);
    setSavedList(getCustomChallenges());
    setMessage(`Imported "${c.name}".`);
  }

  return (
    <div className="builder">
      <div className="builder-main">
        <h2>Challenge Builder</h2>
        {message && <p className="kb-message">{message}</p>}

        <div className="builder-meta">
          <label className="field">
            <span>Name</span>
            <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label className="field">
            <span>Layout</span>
            <select value={layoutId} onChange={(e) => changeLayout(e.target.value)}>
              {LAYOUTS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="field">
          <span>Description</span>
          <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} />
        </label>

        <SetupEditor work={work} onChange={setWork} selectedItem={selectedItem} selectedCount={selectedCount} />

        <div className="region">
          <h4>Goal</h4>
          <div className="goal-kinds">
            <label className="radio">
              <input type="radio" checked={goalKind === "haveItems"} onChange={() => setGoalKind("haveItems")} />
              Have items (crafting drill)
            </label>
            {layoutId === "chest" && (
              <label className="radio">
                <input type="radio" checked={goalKind === "emptyContainer"} onChange={() => setGoalKind("emptyContainer")} />
                Empty the container (loot drill)
              </label>
            )}
            <label className="radio">
              <input type="radio" checked={goalKind === "matchLayout"} onChange={() => setGoalKind("matchLayout")} />
              Match this exact layout (sort drill)
            </label>
          </div>

          {goalKind === "haveItems" && (
            <div className="goal-items">
              <button className="btn small" onClick={addGoalItem} disabled={!selectedItem}>
                + Add selected as goal ({selectedCount})
              </button>
              <div className="goal-list">
                {goalItems.map((r) => (
                  <div key={r.id} className="goal-chip">
                    <ItemSprite itemId={r.id} count={r.count} size={28} />
                    <span>{registry.name(r.id)}</span>
                    <button onClick={() => setGoalItems((g) => g.filter((x) => x.id !== r.id))}>x</button>
                  </div>
                ))}
                {goalItems.length === 0 && <span className="hint small">Select an item and add it as a goal.</span>}
              </div>
            </div>
          )}
        </div>

        <div className="builder-actions">
          <button className="btn" onClick={save}>
            Save Challenge
          </button>
          <button className="btn small" onClick={share}>
            Save &amp; Copy Share Link
          </button>
          <button className="btn small" onClick={importCode}>
            Import from Link
          </button>
        </div>

        {savedList.length > 0 && (
          <div className="region">
            <h4>My Challenges</h4>
            <div className="saved-list">
              {savedList.map((c) => (
                <div key={c.id} className="saved-item">
                  <span>{c.name}</span>
                  <div>
                    <button
                      className="btn small"
                      onClick={() => {
                        navigator.clipboard?.writeText(shareUrlFor(c));
                        setMessage("Share link copied.");
                      }}
                    >
                      Share
                    </button>
                    <button
                      className="btn small"
                      onClick={() => {
                        deleteCustomChallenge(c.id);
                        setSavedList(getCustomChallenges());
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <aside className="palette">
        <div className="palette-controls">
          <input type="text" placeholder="Search items..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <label className="field inline">
            <span>Count</span>
            <input
              type="number"
              min={1}
              max={64}
              value={selectedCount}
              onChange={(e) => setSelectedCount(Math.max(1, Math.min(64, Number(e.target.value) || 1)))}
            />
          </label>
        </div>
        {!search && (
          <div className="cat-tabs">
            {CATEGORIES.map((c) => (
              <button key={c} className={category === c ? "cat active" : "cat"} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        <div className="palette-grid">
          {palette.map((i) => (
            <ItemSprite
              key={i.id}
              itemId={i.id}
              size={34}
              selected={selectedItem === i.id}
              onClick={() => setSelectedItem(i.id)}
              title={i.name}
            />
          ))}
        </div>
        {selectedItem && (
          <div className="palette-selected">
            Selected: <strong>{registry.name(selectedItem)}</strong> x{selectedCount}
          </div>
        )}
      </aside>
    </div>
  );
}
