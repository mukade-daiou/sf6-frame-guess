import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { MoveInput } from "../../lib/frame-data/schema";
import { MoveSelector } from "./MoveSelector";

it.each([
  [{ type: "normal", direction: "2", button: "K", strength: "H" }, "2HK"],
  [{ type: "special", motion: "[2]8", button: "K", strength: "OD" }, "[2]8KK"],
  [{ type: "special", motion: "360", button: "P", strength: "none" }, "360P"],
] satisfies [MoveInput, string][])(
  "selects the first available input without assuming 5LP: %j",
  (input, command) => {
    const html = renderToStaticMarkup(
      <MoveSelector inputs={[input]} onAsk={() => {}} />,
    );
    expect(html).toContain(`>${command}</output>`);
    expect(html).not.toContain('disabled=""');
  },
);
