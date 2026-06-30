import { getRegistry } from "../../data/index";
import { useGameStore } from "../store/gameStore";
import { itemIconDataUrl } from "../render/itemIcon";

interface Props {
  itemId: string | null;
  count?: number;
  size?: number;
  selected?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onWheel?: (e: React.WheelEvent) => void;
  title?: string;
}

/**
 * DOM tile that renders the same pixel-art icon as the WebGL GUI (so the
 * builder/history/setup editor match the practice screen exactly).
 */
export function ItemSprite({ itemId, count, size = 34, selected, onClick, onContextMenu, onWheel, title }: Props) {
  const version = useGameStore((s) => s.version);
  const def = itemId ? getRegistry(version).item(itemId) : undefined;
  const label = def?.name ?? itemId ?? "";
  const iconSize = Math.round(size * 0.82);

  return (
    <div
      className={selected ? "isprite selected" : "isprite"}
      style={{ width: size, height: size }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onWheel={onWheel}
      title={title ?? label}
    >
      {itemId && def && (
        <img
          className="isprite-img"
          src={itemIconDataUrl(def)}
          width={iconSize}
          height={iconSize}
          alt={label}
          draggable={false}
        />
      )}
      {count && count > 1 && <span className="isprite-count">{count}</span>}
    </div>
  );
}
