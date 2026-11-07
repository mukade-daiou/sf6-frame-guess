import { useRef, useState } from "react";
import type { Mode, MoveInput } from "../../lib/frame-data/schema";
import type { ask } from "../game/engine";
import {
  AttackIcon,
  CommandNotation,
  MoveNotation,
  RotationIcon,
} from "../../components/MoveNotation";
import { Lever } from "./Lever";
import {
  attackButtons,
  appendDirection,
  selectAttack,
  getMotionCandidates,
  emptyRotation,
  trackRotation,
  rotationSuggestions,
  type Direction,
} from "./controller";
export function MoveSelector({
  inputs,
  onAsk,
  mode = "normal",
  onAnswer,
}: {
  inputs: MoveInput[];
  onAsk: (input: MoveInput) => ReturnType<typeof ask>["status"] | void;
  mode?: Mode;
  onAnswer?: () => void;
}) {
  const [type, setType] = useState<MoveInput["type"]>("normal");
  const [saLevel, setSaLevel] = useState<1 | 2 | 3>(1);
  const [direction, setDirection] = useState<"5" | "2">("5");
  const [command, setCommand] = useState("");
  const previous = useRef<Direction>("5");
  const [selected, setSelected] = useState<MoveInput>();
  const [unknownMode, setUnknownMode] = useState<Mode | null>(null);
  const [leverReset, setLeverReset] = useState(0);
  const rotation = useRef(emptyRotation());
  const [rotationClockwise, setRotationClockwise] = useState(true);
  const motionType = type === "super_art" ? "super_art" : "special";
  const motions = getMotionCandidates(inputs, "", motionType, saLevel);
  const suggestions = command
    ? getMotionCandidates(inputs, command, motionType, saLevel)
    : [];
  const turns = motions.includes("720") ? 2 : 1;
  const commandStatus = !command
    ? "未入力"
    : motions.includes(command)
      ? "候補一致"
      : suggestions.length > 0
        ? "入力途中"
        : "候補不一致・未対応";
  function clear() {
    setUnknownMode(null);
    setCommand("");
    previous.current = "5";
    rotation.current = emptyRotation();
    setRotationClockwise(true);
    setSelected(undefined);
  }
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (selected) {
          const status = onAsk(selected);
          clear();
          setDirection("5");
          setLeverReset((n) => n + 1);
          setUnknownMode(status === "unknown" ? mode : null);
        }
      }}
    >
      <div className="segments type-toggle" role="group" aria-label="技の種類">
        {(["normal", "special", "super_art"] as const).map((t) => (
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
            {t === "normal" ? "通常技" : t === "special" ? "必殺技" : "SA"}
          </button>
        ))}
      </div>
      {type === "super_art" && (
        <div
          className="segments sa-level-toggle"
          role="group"
          aria-label="SAレベル"
        >
          {([1, 2, 3] as const).map((level) => (
            <button
              type="button"
              key={level}
              aria-pressed={saLevel === level}
              onClick={() => {
                setSaLevel(level);
                clear();
                setLeverReset((n) => n + 1);
              }}
            >
              SA{level}
            </button>
          ))}
        </div>
      )}
      <div className="arcade-controls">
        <div className="lever-column">
          <Lever
            key={`${type}:${saLevel}:${leverReset}`}
            normal={type === "normal"}
            selected={direction}
            onDirection={(d) => {
              if (type === "normal") {
                if (d === "2" || d === "5") {
                  setUnknownMode(null);
                  setDirection(d);
                  setSelected(undefined);
                }
              } else {
                const before = previous.current;
                rotation.current = trackRotation(rotation.current, d, turns);
                if (rotation.current.complete)
                  setRotationClockwise(rotation.current.steps >= 0);
                setCommand((c) =>
                  rotation.current.complete
                    ? turns === 2
                      ? "720"
                      : "360"
                    : appendDirection(c, before, d),
                );
                previous.current = d;
                if (d !== "5") {
                  setSelected(undefined);
                  setUnknownMode(null);
                }
              }
            }}
          />
          {type !== "normal" && (
            <>
              <div className="command-strip">
                <div>
                  <CommandNotation
                    command={command}
                    clockwise={rotationClockwise}
                  />
                  <small role="status">{commandStatus}</small>
                </div>
                <button type="button" className="quiet-button" onClick={clear}>
                  クリア
                </button>
              </div>
              {suggestions.length > 0 && (
                <div
                  className="motion-suggestions"
                  role="group"
                  aria-label="コマンド候補"
                >
                  {suggestions
                    .flatMap((motion) =>
                      motion === "360" || motion === "720"
                        ? rotationSuggestions(command, motion === "720" ? 2 : 1)
                            .slice(0, 1)
                            .map((path) => ({
                              motion,
                              ...path,
                            }))
                        : [{ motion, sequence: motion, clockwise: true }],
                    )
                    .map(({ motion, sequence, clockwise }) => (
                      <button
                        type="button"
                        className="motion-suggestion"
                        key={`${motion}:${sequence}`}
                        aria-label={`コマンド ${motion}`}
                        aria-pressed={command === motion}
                        onClick={() => {
                          setCommand(motion);
                          setRotationClockwise(clockwise);
                          rotation.current =
                            motion === "360" || motion === "720"
                              ? {
                                  previous: null,
                                  steps:
                                    (clockwise ? 8 : -8) *
                                    (motion === "720" ? 2 : 1),
                                  complete: true,
                                }
                              : emptyRotation();
                          previous.current = "5";
                          setSelected(undefined);
                          setUnknownMode(null);
                        }}
                      >
                        {motion === "360" || motion === "720" ? (
                          <>
                            <CommandNotation command={sequence.slice(0, 5)} />
                            <span aria-hidden="true">…</span>
                            <RotationIcon
                              clockwise={clockwise}
                              turns={motion === "720" ? 2 : 1}
                            />
                          </>
                        ) : (
                          <CommandNotation command={motion} />
                        )}
                      </button>
                    ))}
                </div>
              )}
            </>
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
              saLevel,
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
                onClick={() => {
                  setSelected(input);
                  setUnknownMode(null);
                }}
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
          ) : unknownMode === mode ? (
            <span className="query-unknown" role="status">
              不明
            </span>
          ) : (
            "レバーとボタンで技を選択"
          )}
        </output>
        <div className="question-actions">
          {onAnswer && (
            <button
              type="button"
              className="secondary-button"
              onClick={onAnswer}
            >
              回答へ進む
            </button>
          )}
          <button disabled={!selected} type="submit">
            質問する
          </button>
        </div>
      </div>
    </form>
  );
}
