import { expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import type { MoveInput } from "../../lib/frame-data/schema";
import { MoveSelector } from "./MoveSelector";
import { MoveNotation } from "../../components/MoveNotation";

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

it("renders all nine lever choices and the two move categories", () => {
  const html = renderToStaticMarkup(
    <MoveSelector inputs={[]} onAsk={() => {}} />,
  );
  expect(html).toContain("通常技・特殊技");
  expect(html).toContain("必殺技・SA");
  const directions = html.match(
    /<button[^>]+class="lever-direction[^"]*"[^>]*>/g,
  )!;
  expect(directions).toHaveLength(9);
  expect(directions.every((button) => !button.includes("disabled"))).toBe(true);
  expect(
    directions.filter((button) => button.includes('aria-pressed="true"')),
  ).toEqual([expect.stringContaining('aria-label="中央"')]);
});

it.each(["6", "4", "3"] as const)(
  "renders %s in the question preview and history notation",
  (direction) => {
    const html = renderToStaticMarkup(
      <MoveNotation
        input={{ type: "normal", direction, button: "P", strength: "M" }}
      />,
    );
    expect(html).toContain(`aria-label="${direction}MP"`);
    expect(html).toContain("direction-icon");
  },
);
