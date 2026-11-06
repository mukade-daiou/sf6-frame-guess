import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { MoveInput } from "../../lib/frame-data/schema";
import { MoveSelector } from "./MoveSelector";

it.each([
  [{ type: "normal", direction: "2", button: "K", strength: "H" }, "2HK"],
  [{ type: "special", motion: "[2]8", button: "K", strength: "OD" }, "[2]8KK"],
  [{ type: "special", motion: "360", button: "P", strength: "none" }, "360P"],
] satisfies [MoveInput, string][])(
  "requires an explicit lever/button selection and does not approximate complex input: %j",
  (input, command) => {
    const html = renderToStaticMarkup(
      <MoveSelector inputs={[input]} onAsk={() => {}} />,
    );
    expect(html).not.toContain(`>${command}</output>`);
    expect(html).toContain('disabled="" type="submit"');
    expect(html).not.toContain("<select");
  },
);
