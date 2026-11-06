import type { MoveInput } from "../lib/frame-data/schema";
import { displayInput } from "../lib/frame-data/input";
import type { Direction } from "../features/move-selector/controller";
import punchIcon from "../assets/attack-icons/punch.svg";
import barefootIcon from "../assets/attack-icons/barefoot.svg";
export const directionNames: Record<Direction, string> = {
  "1": "左下",
  "2": "下",
  "3": "右下",
  "4": "左",
  "5": "中央",
  "6": "右",
  "7": "左上",
  "8": "上",
  "9": "右上",
};
export function DirectionIcon({
  direction,
}: {
  direction: Exclude<Direction, "5">;
}) {
  const degrees = {
    "8": 0,
    "9": 45,
    "6": 90,
    "3": 135,
    "2": 180,
    "1": 225,
    "4": 270,
    "7": 315,
  };
  return (
    <svg className="direction-icon" viewBox="0 0 24 24" aria-hidden="true">
      <path
        transform={`rotate(${degrees[direction]} 12 12)`}
        d="M12 2 2 12h6v10h8V12h6Z"
        fill="currentColor"
      />
    </svg>
  );
}
export function AttackIcon({
  strength,
  button,
}: {
  strength: "L" | "M" | "H" | "OD" | "none";
  button: "P" | "K";
}) {
  if (strength === "OD")
    return (
      <span className="button-pair">
        <AttackIcon strength="L" button={button} />
        <span>＋</span>
        <AttackIcon strength="M" button={button} />
      </span>
    );
  return (
    <svg
      className={`attack-icon strength-${strength}`}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="14" />
      <image
        href={button === "P" ? punchIcon : barefootIcon}
        x="6"
        y="6"
        width="20"
        height="20"
      />
    </svg>
  );
}
export function CommandNotation({ command }: { command: string }) {
  return (
    <span
      className="command-directions"
      aria-label={
        command
          .split("")
          .map((d) => directionNames[d as Direction])
          .join("、") || "未入力"
      }
    >
      {command
        ? command
            .split("")
            .map((d, i) => (
              <DirectionIcon key={i} direction={d as Exclude<Direction, "5">} />
            ))
        : "—"}
    </span>
  );
}
export function MoveNotation({ input }: { input: MoveInput }) {
  const command =
    input.type === "normal"
      ? input.direction === "2"
        ? "2"
        : ""
      : input.motion === "none"
        ? ""
        : input.motion;
  return (
    <span className="move-notation" role="img" aria-label={displayInput(input)}>
      <span aria-hidden="true">
        {command &&
          (/^[12346789]+$/.test(command) ? (
            <CommandNotation command={command} />
          ) : (
            command
          ))}
        {command && " ＋ "}
        <AttackIcon strength={input.strength} button={input.button} />
      </span>
    </span>
  );
}
