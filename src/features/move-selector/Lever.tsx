import { useRef, useState } from "react";
import { DirectionIcon, directionNames } from "../../components/MoveNotation";
import { directionAt, type Direction } from "./controller";
const positions: Direction[] = ["7", "8", "9", "4", "5", "6", "1", "2", "3"];
const arrows: Record<string, Direction> = {
  ArrowUp: "8",
  ArrowDown: "2",
  ArrowLeft: "4",
  ArrowRight: "6",
  Home: "7",
  PageUp: "9",
  End: "1",
  PageDown: "3",
};
const keyDirection = (key: string) =>
  arrows[key] || (/^[1-9]$/.test(key) ? (key as Direction) : undefined);
export function Lever({
  normal,
  selected,
  onDirection,
}: {
  normal: boolean;
  selected: "5" | "2";
  onDirection: (direction: Direction) => void;
}) {
  const [active, setActive] = useState<Direction>("5");
  const previous = useRef<Direction>("5");
  const pointer = useRef<number | null>(null);
  const keys = useRef(new Set<string>());
  function emit(d: Direction) {
    if (normal && d !== "5" && d !== "2") return;
    if (d !== previous.current || normal) onDirection(d);
    previous.current = d;
    setActive(d);
  }
  function release() {
    if (!normal) emit("5");
    previous.current = "5";
    pointer.current = null;
    keys.current.clear();
    setActive("5");
  }
  function heldDirection(): Direction {
    const x = Number(keys.current.has("6")) - Number(keys.current.has("4"));
    const y = Number(keys.current.has("2")) - Number(keys.current.has("8"));
    return keys.current.size > 1
      ? positions[(y + 1) * 3 + x + 1]
      : ([...keys.current][0] as Direction) || "5";
  }
  const direction = normal ? selected : active;
  const index = positions.indexOf(direction);
  return (
    <div className="lever-section">
      <div
        className="lever"
        tabIndex={0}
        role="group"
        aria-label="レバー（方向キー・テンキーで操作）"
        onPointerDown={(e) => {
          if (e.button !== 0 || pointer.current !== null) return;
          pointer.current = e.pointerId;
          e.currentTarget.setPointerCapture(e.pointerId);
          const rect = e.currentTarget.getBoundingClientRect();
          emit(
            directionAt(
              e.clientX - rect.left,
              e.clientY - rect.top,
              rect.width,
            ),
          );
        }}
        onPointerMove={(e) => {
          if (pointer.current !== e.pointerId) return;
          const rect = e.currentTarget.getBoundingClientRect();
          emit(
            directionAt(
              e.clientX - rect.left,
              e.clientY - rect.top,
              rect.width,
            ),
          );
        }}
        onPointerUp={(e) => {
          if (pointer.current === e.pointerId) release();
        }}
        onPointerCancel={(e) => {
          if (pointer.current === e.pointerId) release();
        }}
        onLostPointerCapture={() => {
          if (pointer.current !== null) release();
        }}
        onKeyDown={(e) => {
          const d = keyDirection(e.key);
          if (!d) return;
          e.preventDefault();
          if (e.repeat) return;
          keys.current.add(d);
          emit(heldDirection());
        }}
        onKeyUp={(e) => {
          const d = keyDirection(e.key);
          if (d) {
            e.preventDefault();
            keys.current.delete(d);
            if (!normal) emit(heldDirection());
            else previous.current = "5";
          }
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) release();
        }}
      >
        {positions.map((d) => (
          <button
            key={d}
            type="button"
            className={`lever-direction ${direction === d ? "is-active" : ""}`}
            aria-label={directionNames[d]}
            aria-pressed={direction === d}
            disabled={normal && d !== "5" && d !== "2"}
            onClick={(e) => {
              if (e.detail === 0) {
                emit(d);
                if (!normal) emit("5");
              }
            }}
          >
            {d === "5" ? (
              <span className="neutral-dot" />
            ) : (
              <DirectionIcon direction={d} />
            )}
          </button>
        ))}
        <svg className="lever-drawing" viewBox="0 0 156 156" aria-hidden="true">
          <line
            x1="78"
            y1="78"
            x2={78 + ((index % 3) - 1) * 28}
            y2={78 + (Math.floor(index / 3) - 1) * 28}
          />
          <circle
            cx={78 + ((index % 3) - 1) * 28}
            cy={78 + (Math.floor(index / 3) - 1) * 28}
            r="16"
          />
        </svg>
      </div>
      <p className="muted lever-help">
        {normal
          ? "中央：立ち ／ 下：しゃがみ"
          : "ドラッグ・タップ・方向キーで入力"}
      </p>
    </div>
  );
}
