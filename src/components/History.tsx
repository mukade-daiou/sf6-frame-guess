import type { HistoryEntry } from "../features/game/engine";
import type { Mode } from "../lib/frame-data/schema";
import { displayInput } from "../lib/frame-data/input";
import { displayFrame } from "../lib/frame-data/resolver";

export function History({
  entries,
  mode,
}: {
  entries: HistoryEntry[];
  mode: Mode;
}) {
  return (
    <section className="panel">
      <h2>質問履歴</h2>
      {entries.length === 0 ? (
        <p className="muted">まだ質問していません。</p>
      ) : (
        <ol className="history">
          {entries.map((entry, index) => (
            <li key={index}>
              <h3>
                <span className="muted">{index + 1}.</span>{" "}
                <code>{displayInput(entry.input)}</code>
              </h3>
              {entry.result.status === "found" ? (
                <dl className="frames">
                  {(
                    [
                      "startup",
                      ...(mode === "normal"
                        ? (["total", "hit", "block"] as const)
                        : []),
                    ] as const
                  ).map((key) => (
                    <div key={key}>
                      <dt>
                        {
                          {
                            startup: "発生F",
                            total: "全体F",
                            hit: "ヒット時硬直差",
                            block: "ガード時硬直差",
                          }[key]
                        }
                      </dt>
                      <dd>
                        {displayFrame(
                          entry.result.status === "found"
                            ? entry.result.frames[key]
                            : { status: "unknown", display: null },
                        )}
                      </dd>
                    </div>
                  ))}
                </dl>
              ) : (
                <p>該当する技なし</p>
              )}
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
