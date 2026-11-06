import { useRef, useState } from "react";
import type { MoveInput } from "../../lib/frame-data/schema";
import {
  AttackIcon,
  CommandNotation,
  MoveNotation,
} from "../../components/MoveNotation";
import { Lever } from "./Lever";
import {
  attackButtons,
  appendDirection,
  selectAttack,
  type Direction,
} from "./controller";
export function MoveSelector({
  inputs,
  onAsk,
}: {
  inputs: MoveInput[];
  onAsk: (input: MoveInput) => void;
}) {
  const [type, setType] = useState<"normal" | "special">("normal");
  const [direction, setDirection] = useState<"5" | "2">("5");
  const [command, setCommand] = useState("");
  const previous = useRef<Direction>("5");
  const [selected, setSelected] = useState<MoveInput>();
  const motions = inputs
    .filter(
      (i) =>
        i.type === "special" &&
        i.motion !== "none" &&
        /^[12346789]+$/.test(i.motion),
    )
    .map((i) => (i.type === "special" ? i.motion : ""));
  const commandStatus = !command
    ? "未入力"
    : motions.includes(command)
      ? "候補一致"
      : motions.some((m) => m.startsWith(command))
        ? "入力途中"
        : "候補不一致・未対応";
  function clear() {
    setCommand("");
    previous.current = "5";
    setSelected(undefined);
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (selected) onAsk(selected);
      }}
    >
      <div className="segments type-toggle" role="group" aria-label="技の種類">
        {(["normal", "special"] as const).map((t) => (
          <button
            type="button"
            key={t}
            aria-pressed={type === t}
            onClick={() => {
              setType(t);
              setDirection("5");
              clear();
            }}
          >
            {t === "normal" ? "通常技" : "必殺技"}
          </button>
        ))}
      </div>
      <div className="arcade-controls">
        <div className="lever-column">
          <Lever
            key={type}
            normal={type === "normal"}
            selected={direction}
            onDirection={(d) => {
              if (type === "normal") {
                if (d === "2" || d === "5") {
                  setDirection(d);
                  setSelected(undefined);
                }
              } else {
                const before = previous.current;
                setCommand((c) => appendDirection(c, before, d));
                previous.current = d;
                if (d !== "5") setSelected(undefined);
              }
            }}
          />
          {type === "special" && (
            <div className="command-strip">
              <div>
                <CommandNotation command={command} />
                <small role="status">{commandStatus}</small>
              </div>
              <button type="button" className="quiet-button" onClick={clear}>
                クリア
              </button>
            </div>
          )}
        </div>
        <div className="attack-buttons" role="group" aria-label="攻撃ボタン">
          {attackButtons.map((a) => {
            const input = selectAttack(
              inputs,
              type,
              type === "normal" ? direction : command,
              a.button,
              a.strength,
            );
            return (
              <button
                type="button"
                key={a.label}
                className={`attack-button strength-${a.strength} ${a.strength === "OD" ? "paired" : ""}`}
                aria-label={a.label}
                aria-pressed={
                  !!selected &&
                  selected.button === a.button &&
                  selected.strength === a.strength
                }
                disabled={!input}
                onClick={() => setSelected(input)}
              >
                <AttackIcon button={a.button} strength={a.strength} />
                <span>{a.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      <div className="submit-row">
        <output className="input-preview" aria-live="polite">
          {selected ? (
            <MoveNotation input={selected} />
          ) : (
            "レバーとボタンで技を選択"
          )}
        </output>
        <button disabled={!selected} type="submit">
          質問する
        </button>
      </div>
    </form>
  );
}
