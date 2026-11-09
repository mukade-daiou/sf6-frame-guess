import type { HistoryEntry } from "../features/game/engine";
import { MoveNotation } from "./MoveNotation";
import { displayFrame } from "../lib/frame-data/resolver";
import type { Mode } from "../lib/frame-data/schema";

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
        <ol className="history" reversed>
          {[...entries].reverse().map((entry, index) => {
            const questionNumber = entries.length - index;
            const frames =
              entry.result.status === "found" ||
              entry.result.status === "review"
                ? entry.result.frames
                : null;
            return (
              <li key={questionNumber}>
                <h3>
                  <span className="muted">{questionNumber}.</span>{" "}
                  <MoveNotation input={entry.input} />
                </h3>
                {entry.result.status === "review" && (
                  <p>{entry.result.reason}</p>
                )}
                {frames ? (
                  <dl
                    className={`frames${mode === "startup" ? " frames-startup" : ""}`}
                  >
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
                          {displayFrame(frames[key]) === "D"
                            ? "ダウン"
                            : displayFrame(frames[key])}
                        </dd>
                      </div>
                    ))}
                  </dl>
                ) : (
                  <p>
                    {entry.result.status === "review"
                      ? {
                          recorded: "未検証候補",
                          source_absent:
                            "原典の対象範囲では技なし（パッチ未確認）",
                          not_recorded: "データ未収録",
                          ambiguous: "同一入力が衝突",
                        }[entry.result.assessment]
                      : "採用データ内に該当する技なし"}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}
