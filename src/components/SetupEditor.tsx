import { ItemSprite } from "./ItemSprite";
import type { ItemStack } from "../../engine/types";

export interface WorkSetup {
  layoutId: string;
  hotbar: (ItemStack | null)[];
  main: (ItemStack | null)[];
  container: (ItemStack | null)[];
}

export function emptyWork(layoutId: string): WorkSetup {
  return {
    layoutId,
    hotbar: Array(9).fill(null),
    main: Array(27).fill(null),
    container: Array(containerSize(layoutId)).fill(null),
  };
}

export function containerSize(layoutId: string): number {
  switch (layoutId) {
    case "chest":
      return 27;
    case "crafting_table":
      return 9;
    case "furnace":
      return 2;
    case "inventory":
      return 4;
    default:
      return 0;
  }
}

function containerCols(layoutId: string): number {
  switch (layoutId) {
    case "chest":
      return 9;
    case "crafting_table":
      return 3;
    case "furnace":
      return 1;
    case "inventory":
      return 2;
    default:
      return 9;
  }
}

function containerLabel(layoutId: string): string {
  switch (layoutId) {
    case "chest":
      return "Chest";
    case "crafting_table":
      return "Crafting Grid (3x3)";
    case "furnace":
      return "Furnace (input, fuel)";
    case "inventory":
      return "Crafting Grid (2x2)";
    default:
      return "Container";
  }
}

interface Props {
  work: WorkSetup;
  onChange: (w: WorkSetup) => void;
  selectedItem: string | null;
  selectedCount: number;
}

export function SetupEditor({ work, onChange, selectedItem, selectedCount }: Props) {
  function edit(region: keyof Omit<WorkSetup, "layoutId">, i: number, stack: ItemStack | null) {
    const next = { ...work, [region]: [...(work[region] as (ItemStack | null)[])] } as WorkSetup;
    (next[region] as (ItemStack | null)[])[i] = stack;
    onChange(next);
  }

  const renderGrid = (region: "hotbar" | "main" | "container", cols: number) => {
    const arr = work[region] as (ItemStack | null)[];
    return (
      <div className="slot-grid" style={{ gridTemplateColumns: `repeat(${cols}, 38px)` }}>
        {arr.map((stack, i) => (
          <ItemSprite
            key={i}
            itemId={stack?.id ?? null}
            count={stack?.count}
            size={36}
            onClick={() => {
              if (selectedItem) edit(region, i, { id: selectedItem, count: selectedCount });
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              edit(region, i, null);
            }}
            onWheel={(e) => {
              if (!stack) return;
              e.preventDefault();
              const delta = e.deltaY < 0 ? 1 : -1;
              const c = Math.max(1, stack.count + delta);
              edit(region, i, { ...stack, count: c });
            }}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="setup-editor">
      {containerSize(work.layoutId) > 0 && (
        <div className="region">
          <h4>{containerLabel(work.layoutId)}</h4>
          {renderGrid("container", containerCols(work.layoutId))}
        </div>
      )}
      <div className="region">
        <h4>Inventory</h4>
        {renderGrid("main", 9)}
      </div>
      <div className="region">
        <h4>Hotbar</h4>
        {renderGrid("hotbar", 9)}
      </div>
      <p className="hint small">
        Click a slot to place the selected item · right-click to clear · scroll over a slot to change the count.
      </p>
    </div>
  );
}

export function workToSetup(work: WorkSetup): import("../../engine/setup").SetupSnapshot {
  const base = { layoutId: work.layoutId, hotbar: work.hotbar, main: work.main };
  switch (work.layoutId) {
    case "chest":
      return { ...base, container: work.container };
    case "crafting_table":
    case "inventory":
      return { ...base, craftIn: work.container };
    case "furnace":
      return { ...base, furnaceIn: work.container[0] ?? null, furnaceFuel: work.container[1] ?? null };
    default:
      return base;
  }
}
