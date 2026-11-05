import { useState } from "react";
import type { MoveInput } from "../../lib/frame-data/schema";
import { displayInput, inputKey } from "../../lib/frame-data/input";

export function MoveSelector({
  inputs,
  onAsk,
}: {
  inputs: MoveInput[];
  onAsk: (input: MoveInput) => void;
}) {
  const initial = inputs[0];
  const [type, setType] = useState<MoveInput["type"]>(
    initial?.type ?? "normal",
  );
  const [motion, setMotion] = useState(
    initial?.type === "normal" ? initial.direction : (initial?.motion ?? ""),
  );
  const [button, setButton] = useState<string>(initial?.button ?? "P");
  const [strength, setStrength] = useState<string>(initial?.strength ?? "L");
  const typed = inputs.filter((input) => input.type === type);
  const motions = [
    ...new Set(
      typed.map((input) =>
        input.type === "normal" ? input.direction : input.motion,
      ),
    ),
  ];
  const byMotion = typed.filter(
    (input) =>
      (input.type === "normal" ? input.direction : input.motion) === motion,
  );
  const buttons = [...new Set(byMotion.map((input) => input.button))];
  const strengths = [
    ...new Set(
      byMotion
        .filter((input) => input.button === button)
        .map((input) => input.strength),
    ),
  ];
  const selected = byMotion.find(
    (input) => input.button === button && input.strength === strength,
  );
  function changeType(next: MoveInput["type"]) {
    setType(next);
    const first = inputs.find((input) => input.type === next);
    if (first) {
      setMotion(first.type === "normal" ? first.direction : first.motion);
      setButton(first.button);
      setStrength(first.strength);
    }
  }
  function changeMotion(next: string) {
    setMotion(next);
    const first = typed.find(
      (input) =>
        (input.type === "normal" ? input.direction : input.motion) === next,
    );
    if (first) {
      setButton(first.button);
      setStrength(first.strength);
    }
  }
  function changeButton(next: string) {
    setButton(next);
    const first = byMotion.find((input) => input.button === next);
    if (first) setStrength(first.strength);
  }
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        if (selected) onAsk(selected);
      }}
    >
      <fieldset>
        <legend>技の種類</legend>
        <div className="choices">
          {(["normal", "special"] as const).map((value) => (
            <label key={value}>
              <input
                type="radio"
                name="type"
                value={value}
                checked={type === value}
                onChange={() => changeType(value)}
              />
              {value === "normal" ? "通常技" : "必殺技"}
            </label>
          ))}
        </div>
      </fieldset>
      <div className="selector-grid">
        <label>
          {type === "normal" ? "方向" : "コマンド"}
          <select value={motion} onChange={(e) => changeMotion(e.target.value)}>
            {motions.map((value) => (
              <option key={value} value={value}>
                {value === "none" ? "同時押し（モーションなし）" : value}
              </option>
            ))}
          </select>
        </label>
        <label>
          ボタン
          <select value={button} onChange={(e) => changeButton(e.target.value)}>
            {buttons.map((value) => (
              <option key={value}>{value}</option>
            ))}
          </select>
        </label>
        <label>
          強度
          <select
            value={strength}
            onChange={(e) => setStrength(e.target.value)}
          >
            {strengths.map((value) => (
              <option key={value} value={value}>
                {
                  { L: "弱", M: "中", H: "強", OD: "OD", none: "強度なし" }[
                    value
                  ]
                }
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="submit-row">
        <output
          className="command"
          key={selected ? inputKey(selected) : "empty"}
        >
          {selected ? displayInput(selected) : "選択できる入力なし"}
        </output>
        <button disabled={!selected} type="submit">
          質問する
        </button>
      </div>
      <p className="muted">
        候補は出題対象全体から生成しています。相手が持たない技も質問できます。
      </p>
    </form>
  );
}
