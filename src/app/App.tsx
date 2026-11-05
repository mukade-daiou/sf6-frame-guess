import { useEffect, useState } from "react";
import {
  fixtures,
  production,
  loadDevelopmentReview,
} from "../lib/frame-data/datasets";
import type { Dataset } from "../lib/frame-data/loader";
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
  const [mode, setMode] = useState<Mode>("normal");
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
        found: "フレームデータを取得しました。履歴で確認できます。",
        not_found: "該当する技なし。質問を1回消費しました。",
        unknown:
          "必要な値が不明、出典未検証、またはデータ未収録です。質問は消費しません。",
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
        {review
          ? "開発専用：未検証の実データです。正確な性能や現行パッチへの対応を保証するデータではありません。"
          : fixture
            ? "テスト用Fixtureでプレイ中。キャラクター・技・数値は架空で、SF6の実データではありません。"
            : production.eligible.length === 0
              ? "本番データは未収録です。動作確認にはテスト用Fixtureを選択してください。"
              : "本番データを利用しています。"}
        <small>
          データ: {dataset.metadata.gameVersion} / 出題対象:{" "}
          {dataset.eligible.length}体
        </small>
        {review && (
          <p>
            比較対象: Ver.2.0500.001（暫定）／対象パッチ: 未確認。OD入力はLP+MP
            /
            LK+MK。標準条件：通常状態・原則立ち・画面中央・通常ヒット／ガード・非ホールド・派生なし。全体Fは空振り時。不明・未収録は質問を消費せず、確定範囲は1回消費します。
          </p>
        )}
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
