import type { Dataset } from "../lib/frame-data/loader";
export function DataInfo({ dataset }: { dataset: Dataset }) {
  return (
    <details className="data-info">
      <summary aria-label="データの出典・帰属">
        <span aria-hidden="true">ⓘ</span>
      </summary>
      <div className="info-content">
        <h2>データの出典・帰属</h2>
        <p>
          {dataset.metadata.label} ／ {dataset.metadata.gameVersion}
        </p>
        <p>
          原典対応に基づく採用データです。公式検証・対象パッチは未確認です。技なしは採用データ内での不存在を示します。
        </p>
        {[
          ...new Map(
            dataset.characters
              .flatMap((c) => [c.source, ...c.moves.map((m) => m.source)])
              .map((s) => [`${s.url}:${s.attribution}:${s.license}`, s]),
          ).values(),
        ].map((s, i) => (
          <p key={i}>
            {s.attribution}
            <br />
            {s.license}
            <br />
            <a href={s.url} rel="noreferrer" target="_blank">
              取得元
            </a>{" "}
            · 取得日時 {s.retrievedAt} · 出典確認:{" "}
            {s.verification === "verified" ? "検証済み" : "未検証"}
          </p>
        ))}
        <h2>操作アイコン</h2>
        <p>
          <a
            href="https://game-icons.net/1x1/lorc/punch.html"
            rel="noreferrer"
            target="_blank"
          >
            Punch
          </a>
          ・
          <a
            href="https://game-icons.net/1x1/lorc/barefoot.html"
            rel="noreferrer"
            target="_blank"
          >
            Barefoot
          </a>{" "}
          by Lorc / Game-icons.net
          <br />
          <a
            href="https://creativecommons.org/licenses/by/3.0/"
            rel="noreferrer"
            target="_blank"
          >
            CC BY 3.0
          </a>
          <br />
          表示用に縮小し、色付き円と合成。同時押しは2個を組み合わせています。
        </p>
      </div>
    </details>
  );
}
