import { useEffect, useState } from "react";
import {
  fixtures,
  production,
  loadDevelopmentReview,
} from "../lib/frame-data/datasets";
import type { Dataset } from "../lib/frame-data/loader";
import type { MoveInput } from "../lib/frame-data/schema";
import {
  answer,
  ask,
  isCorrect,
  startGame,
  changeMode,
  requestAnswer,
  type Game,
} from "../features/game/engine";
import { MoveSelector } from "../features/move-selector/MoveSelector";
import { History } from "../components/History";
import { DataInfo } from "../components/DataInfo";

export default function App() {
  const [fixture, setFixture] = useState(false);
  const [reviewData, setReviewData] = useState<Dataset | null>(null);
  const [review, setReview] = useState(false);
  useEffect(() => {
    let active = true;
    if (import.meta.env.DEV)
      void loadDevelopmentReview()
        .then((data) => {
          if (active) setReviewData(data);
        })
        .catch(() => {
          if (active) setMessage("検証用データを読み込めませんでした。");
        });
    return () => {
      active = false;
    };
  }, []);
  const [game, setGame] = useState<Game | null>(null);
  const [selection, setSelection] = useState("");
  const [message, setMessage] = useState("");
  const dataset =
    review && reviewData ? reviewData : fixture ? fixtures : production;
  const limit = 5;
  function question(input: MoveInput) {
    if (!game) return;
    const next = ask(game, input);
    setGame(next.game);
    setMessage(
      {
        review:
          "未検証データの確認結果です。検証用として質問を1回記録しました。",
        found: "",
        not_found: "",
        unknown: "",
        ambiguous: "同じ入力に複数候補があります。質問は消費しません。",
        duplicate: "質問済みの入力です。履歴を確認してください。",
        invalid: "無効な入力です。",
        unsupported: "未対応の入力です。",
        closed: "質問は終了しました。",
      }[next.status],
    );
    return next.status;
  }
  return (
    <main>
      <header>
        <DataInfo dataset={dataset} />
        <h1>
          SF6 Frame Data
          <br className="mobile-break" /> Guessing Game
        </h1>
      </header>
      {(review || fixture) && (
        <aside className="notice">
          {review
            ? "開発専用：未検証の実データです。正確な性能や現行パッチへの対応を保証するデータではありません。"
            : fixture
              ? "テスト用Fixtureでプレイ中。キャラクター・技・数値は架空で、SF6の実データではありません。"
              : production.eligible.length === 0
                ? "本番データは未収録です。動作確認にはテスト用Fixtureを選択してください。"
                : "原典対応に基づく採用データです。公式検証・対象パッチは未確認です。技なしは採用データ内での不存在を示します。"}
          <small>
            データ: {dataset.metadata.label} / 版:{" "}
            {dataset.metadata.gameVersion} / 出題対象: {dataset.eligible.length}
            体
          </small>
          {review && (
            <p>
              比較対象: Ver.2.0500.001（暫定）／対象パッチ:
              未確認。OD入力はLP+MP /
              LK+MK。標準条件：通常状態・原則立ち・画面中央・通常ヒット／ガード・非ホールド・派生なし。全体Fは空振り時。不明・未収録は質問を消費せず、確定範囲は1回消費します。
            </p>
          )}
        </aside>
      )}
      {!game ? (
        <section className="panel">
          <h2>ゲームを始める</h2>
          <p>
            最大{limit}
            回質問して、キャラクターを1体選んで回答します。分かった時点で、途中でも回答できます。
          </p>
          <details className="development-options">
            <summary>動作確認用データ</summary>
            <label className="fixture-toggle">
              <input
                type="checkbox"
                checked={fixture}
                onChange={(e) => {
                  setFixture(e.target.checked);
                  setReview(false);
                }}
              />
              テスト用の架空Fixtureを使う
            </label>
            {import.meta.env.DEV && (
              <label className="fixture-toggle">
                <input
                  type="checkbox"
                  checked={review}
                  disabled={!reviewData}
                  onChange={(e) => {
                    setReview(e.target.checked);
                    setFixture(false);
                  }}
                />
                未検証の実データで試遊（開発専用）
              </label>
            )}
          </details>
          <p>質問回数：{limit}回</p>
          {dataset.eligible.length < 2 && (
            <p role="status">
              開始には、採用済みで収録範囲が確定したキャラクターが2体以上必要です。
            </p>
          )}
          <button
            disabled={
              dataset.eligible.length < 2 || dataset.inputs.length === 0
            }
            onClick={() => {
              setGame(startGame(dataset, "normal", limit));
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
              <div>
                <div
                  className="segments mode-toggle"
                  role="group"
                  aria-label="表示モード"
                >
                  {(["normal", "startup"] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      aria-pressed={game.mode === m}
                      onClick={() => {
                        setGame(changeMode(game, m));
                        setMessage("");
                      }}
                    >
                      {m === "normal" ? "ノーマル" : "発生のみ"}
                    </button>
                  ))}
                </div>
                <small className="remaining">
                  残り {game.limit - game.history.length}回
                </small>
              </div>
            </div>
            {game.phase === "question" && (
              <MoveSelector
                inputs={game.inputs}
                onAsk={question}
                mode={game.mode}
                onAnswer={() => {
                  setGame(requestAnswer(game));
                  setMessage("");
                }}
              />
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
                  再プレイ
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
    </main>
  );
}
