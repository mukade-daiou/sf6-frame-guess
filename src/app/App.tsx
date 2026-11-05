import { useState } from "react";
import { fixtures, production } from "../lib/frame-data/datasets";
import type { Mode, MoveInput } from "../lib/frame-data/schema";
import {
  answer,
  ask,
  isCorrect,
  startGame,
  type Game,
} from "../features/game/engine";
import { MoveSelector } from "../features/move-selector/MoveSelector";
import { History } from "../components/History";

export default function App() {
  const [fixture, setFixture] = useState(false);
  const [mode, setMode] = useState<Mode>("normal");
  const [game, setGame] = useState<Game | null>(null);
  const [selection, setSelection] = useState("");
  const [message, setMessage] = useState("");
  const dataset = fixture ? fixtures : production;
  const limit = 5;
  function question(input: MoveInput) {
    if (!game) return;
    const next = ask(game, input);
    setGame(next.game);
    setMessage(
      {
        found: "フレームデータを取得しました。履歴で確認できます。",
        not_found: "該当する技なし。質問を1回消費しました。",
        unknown:
          "データ未収録・未検証、または必要な値が未確定です。質問は消費しません。",
        ambiguous: "同じ入力に複数候補があります。質問は消費しません。",
        duplicate: "質問済みの入力です。履歴を確認してください。",
        invalid: "無効な入力です。",
        unsupported: "未対応の入力です。",
        closed: "質問は終了しました。",
      }[next.status],
    );
  }
  return (
    <main>
      <header>
        <p className="eyebrow">FRAME DATA / GUESS THE CHARACTER</p>
        <h1>
          SF6 Frame Data
          <br className="mobile-break" /> Guessing Game
        </h1>
        <p>フレームデータを手がかりに、隠されたキャラクターを推理。</p>
      </header>
      <aside className="notice">
        {fixture
          ? "テスト用Fixtureでプレイ中。キャラクター・技・数値は架空で、SF6の実データではありません。"
          : production.eligible.length === 0
            ? "本番データは未収録です。動作確認にはテスト用Fixtureを選択してください。"
            : "本番データを利用しています。"}
        <small>
          データ: {dataset.metadata.gameVersion} / 出題対象:{" "}
          {dataset.eligible.length}体
        </small>
      </aside>
      {!game ? (
        <section className="panel">
          <h2>ゲームを始める</h2>
          <p>
            共通コマンドで{limit}
            回質問した後、キャラクターを1体選んで回答します。技が存在しないこともヒントになります。
          </p>
          <label className="fixture-toggle">
            <input
              type="checkbox"
              checked={fixture}
              onChange={(e) => setFixture(e.target.checked)}
            />
            テスト用の架空Fixtureを使う
          </label>
          <fieldset>
            <legend>表示モード</legend>
            <div className="choices">
              {(["normal", "startup"] as const).map((value) => (
                <label key={value}>
                  <input
                    type="radio"
                    name="mode"
                    checked={mode === value}
                    onChange={() => setMode(value)}
                  />
                  {value === "normal" ? "通常（4項目）" : "発生のみ"}
                </label>
              ))}
            </div>
          </fieldset>
          <p>質問回数：{limit}回</p>
          <p className="muted">プレイ中は表示モードを変更できません。</p>
          {dataset.eligible.length < 2 && (
            <p role="status">
              開始には、収録完了・検証済みで同じバージョンのキャラクターが2体以上必要です。
            </p>
          )}
          <button
            disabled={
              dataset.eligible.length < 2 || dataset.inputs.length === 0
            }
            onClick={() => {
              setGame(startGame(dataset, mode, limit));
              setSelection("");
              setMessage("");
            }}
          >
            ゲーム開始
          </button>
          {dataset.errors.length > 0 && (
            <p role="alert">
              データ検証で問題が見つかりました。管理者は validate:data
              を実行してください。
            </p>
          )}
        </section>
      ) : (
        <>
          <section className="panel">
            <div className="game-heading">
              <h2>
                {game.phase === "question"
                  ? "コマンドを指定"
                  : game.phase === "answer"
                    ? "最終回答"
                    : "結果"}
              </h2>
              <span>
                {game.mode === "normal" ? "通常モード" : "発生のみ"} · 残り{" "}
                {game.limit - game.history.length}回
              </span>
            </div>
            {game.phase === "question" && (
              <MoveSelector inputs={game.inputs} onAsk={question} />
            )}
            {game.phase === "answer" && (
              <>
                <p>質問は終了です。隠されたキャラクターを選んでください。</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setGame(answer(game, selection));
                    setMessage("");
                  }}
                >
                  <fieldset>
                    <legend>キャラクター</legend>
                    <div className="characters">
                      {game.candidates.map((c) => (
                        <label key={c.id}>
                          <input
                            type="radio"
                            name="answer"
                            value={c.id}
                            checked={selection === c.id}
                            onChange={() => setSelection(c.id)}
                          />
                          {c.nameJa}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <button disabled={!selection}>回答確定</button>
                </form>
              </>
            )}
            {game.phase === "result" && (
              <>
                <p className="verdict">
                  {isCorrect(game) ? "正解！" : "不正解"}
                </p>
                <dl className="result">
                  <dt>正解キャラクター</dt>
                  <dd>{game.target.nameJa}</dd>
                  <dt>選択したキャラクター</dt>
                  <dd>
                    {
                      game.candidates.find((c) => c.id === game.selectedId)
                        ?.nameJa
                    }
                  </dd>
                </dl>
                <button
                  onClick={() => {
                    setGame(null);
                    setSelection("");
                    setMessage("");
                  }}
                >
                  再プレイ・設定に戻る
                </button>
              </>
            )}
            <p className="feedback" role="status" aria-live="polite">
              {message}
            </p>
          </section>
          <History entries={game.history} mode={game.mode} />
        </>
      )}
      <footer>
        <p>非公式の個人用推理ゲーム。SF6の全キャラクターには未対応です。</p>
        <details>
          <summary>データの出典・帰属</summary>
          {dataset.characters.length === 0 ? (
            <p>本番データ未収録。</p>
          ) : (
            [
              ...new Map(
                dataset.characters
                  .flatMap((c) => [c.source, ...c.moves.map((m) => m.source)])
                  .map((s) => [`${s.url}:${s.attribution}:${s.license}`, s]),
              ).values(),
            ].map((source, i) => (
              <p key={i}>
                {source.attribution}
                <br />
                {source.license}
                <br />
                <a href={source.url} rel="noreferrer" target="_blank">
                  取得元
                </a>{" "}
                · 取得日時 {source.retrievedAt}
              </p>
            ))
          )}
        </details>
      </footer>
    </main>
  );
}
