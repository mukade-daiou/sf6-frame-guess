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
  charged = false,
}: {
  direction: Exclude<Direction, "5">;
  charged?: boolean;
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
    <svg
      className={`direction-icon${charged ? " charge-direction" : ""}`}
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        transform={`rotate(${degrees[direction]} 12 12)`}
        d="M12 2 2 12h6v10h8V12h6Z"
        fill="currentColor"
        stroke={charged ? "#876800" : undefined}
        strokeWidth={charged ? 0.8 : undefined}
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
export function RotationIcon({
  clockwise = true,
  turns = 1,
}: {
  clockwise?: boolean;
  turns?: 1 | 2;
}) {
  return (
    <svg
      className="direction-icon rotation-icon"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <g transform={clockwise ? undefined : "translate(24 0) scale(-1 1)"}>
        <path
          d="M19 10a7 7 0 1 0-1 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path d="M14 7h9l-4.5 8Z" fill="currentColor" />
      </g>
      {turns === 2 && (
        <text
          x="10"
          y="16"
          textAnchor="middle"
          fill="currentColor"
          fontSize="10"
          fontWeight="bold"
        >
          2
        </text>
      )}
    </svg>
  );
}
export function CommandNotation({
  command,
  clockwise = true,
}: {
  command: string;
  clockwise?: boolean;
}) {
  const tokens = command.match(/\[[12346789]\]|[12346789]/g) || [];
  const supported = /^(?:\[[12346789]\]|[12346789])+$/.test(command);
  return (
    <span
      className="command-directions"
      aria-label={
        command === "360" || command === "720"
          ? command === "720"
            ? "2回転"
            : "1回転"
          : supported
            ? tokens
                .map((d) =>
                  d.startsWith("[")
                    ? `${directionNames[d[1] as Direction]}（溜め）`
                    : directionNames[d as Direction],
                )
                .join("、") || "未入力"
            : command || "未入力"
      }
    >
      {command === "360" || command === "720" ? (
        <RotationIcon clockwise={clockwise} turns={command === "720" ? 2 : 1} />
      ) : command && supported ? (
        tokens.map((d, i) => (
          <DirectionIcon
            key={i}
            direction={
              (d.startsWith("[") ? d[1] : d) as Exclude<Direction, "5">
            }
            charged={d.startsWith("[")}
          />
        ))
      ) : (
        command || "—"
      )}
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
    <span
      className="move-notation"
      role="img"
      aria-description={
        input.type !== "normal" && input.motion === "[4]6"
          ? "後ろ溜めから前"
          : input.type !== "normal" && input.motion === "[2]8"
            ? "下溜めから上"
            : undefined
      }
      aria-label={
        input.type === "super_art"
          ? `SA${input.saLevel}：${input.motion === "720" ? "2回転" : input.motion}＋${{ L: "弱", M: "中", H: "強" }[input.strength]}${input.button}（${displayInput(input)}）`
          : input.type === "special" && input.motion === "360"
            ? `1回転＋${input.strength === "OD" ? `弱${input.button}＋中${input.button}` : `${{ L: "弱", M: "中", H: "強", none: "" }[input.strength]}${input.button}`}（${displayInput(input)}）`
            : displayInput(input)
      }
    >
      <span aria-hidden="true">
        {input.type === "super_art" && `SA${input.saLevel}：`}
        {command &&
          (command === "360" ||
          command === "720" ||
          /^(?:\[[12346789]\]|[12346789])+$/.test(command) ? (
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
