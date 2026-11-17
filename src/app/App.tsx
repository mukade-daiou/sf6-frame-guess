import { useState } from "react";
import { shareUrl } from "../features/game/share";
import { production } from "../lib/frame-data/datasets";
import type { MoveInput } from "../lib/frame-data/schema";
import {
  answer,
  giveUp,
  ask,
  isCorrect,
  startGame,
  startStreak,
  continueStreak,
  changeMode,
  requestAnswer,
  returnToQuestions,
  type Game,
} from "../features/game/engine";
import { MoveSelector } from "../features/move-selector/MoveSelector";
import { History } from "../components/History";
import { DataInfo } from "../components/DataInfo";
import { MoveNotation } from "../components/MoveNotation";
import { sortCharactersForDisplay } from "../features/game/character-order";

function ShareButton({ game, label }: { game: Game; label: string }) {
  return (
    <button
      type="button"
      className="secondary-button"
      aria-label={`Xで${label}`}
      onClick={() =>
        window.open(shareUrl(game), "_blank", "noopener,noreferrer")
      }
    >
      <svg
        aria-hidden="true"
        width="17"
        height="17"
        viewBox="0 0 24 24"
        style={{ verticalAlign: "-3px", marginRight: "8px" }}
      >
        <path
          fill="currentColor"
          d="M18.9 2H22l-6.8 7.8L23.2 22h-6.3L12 14.5 5.4 22H2.2l7.3-8.4L1.8 2h6.4l4.4 6.8L18.9 2zm-1.1 18h1.7L7.2 3.9H5.4L17.8 20z"
        />
      </svg>
      {label}
    </button>
  );
}

export default function App() {
  const [game, setGame] = useState<Game | null>(null);
  const [selection, setSelection] = useState("");
  const [message, setMessage] = useState("");
  const dataset = production;
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
          SF6
          <br className="mobile-break" />
          フレーム探偵
        </h1>
        {game && (
          <details className="play-rules">
            <summary>回答時のルール</summary>
            <ul>
              <li>通常状態・画面中央が基準。全体Fは空振り時の値。</li>
              <li>派生がある技は派生しない。長押し・空中版は原則対象外。</li>
              <li>距離で性能が変わる技は遠距離の値を使う。</li>
              <li>ODは弱＋中。特殊技や3ボタン同時押しは対象外。</li>
            </ul>
          </details>
        )}
      </header>
      {!game ? (
        <section className="start-screen" aria-describedby="start-description">
          <div className="start-layout">
            <div className="start-entry">
              <div className="start-intro">
                <p id="start-description">
                  技のフレームからキャラを当てるゲーム。
                  <span className="start-limit">質問は{limit}回まで。</span>
                </p>
              </div>
              <div className="start-actions">
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
                <button
                  className="secondary-button"
                  disabled={
                    dataset.eligible.length <= 10 || dataset.inputs.length === 0
                  }
                  onClick={() => {
                    setGame(startStreak(dataset, "normal", limit));
                    setSelection("");
                    setMessage("");
                  }}
                >
                  連続モード
                </button>
              </div>
            </div>
            <figure className="start-example">
              <figcaption>質問例（数値はサンプル）</figcaption>
              <div className="start-example-input">
                <MoveNotation
                  input={{
                    type: "normal",
                    direction: "2",
                    button: "P",
                    strength: "L",
                  }}
                />
                <span>しゃがみ弱P</span>
              </div>
              <dl className="start-example-frames">
                <div>
                  <dt>発生F</dt>
                  <dd>4</dd>
                </div>
                <div>
                  <dt>全体F</dt>
                  <dd>16</dd>
                </div>
                <div>
                  <dt>ヒット時硬直差</dt>
                  <dd>+4</dd>
                </div>
                <div>
                  <dt>ガード時硬直差</dt>
                  <dd>-1</dd>
                </div>
              </dl>
            </figure>
          </div>
          <div className="start-modes">
            <dl>
              <div>
                <dt>Normal</dt>
                <dd>発生・全体・ヒット時／ガード時の硬直差</dd>
              </div>
              <div>
                <dt>Hard</dt>
                <dd>発生のみ</dd>
              </div>
            </dl>
            <p>難易度は質問後に変更不可</p>
          </div>
          <details className="start-rules">
            <summary>ルール・注意事項</summary>
            <ul>
              <li>
                質問は最大{limit}
                回です。途中でも回答でき、回数が残っていれば質問に戻れます。
              </li>
              <li>
                「不明」は質問回数を消費しません。「技なし」は1回消費します。質問済みの入力は再質問できません。
              </li>
              <li>
                通常状態・画面中央での通常ヒットやガードが基準です。ボタンを長押しする版や派生技は対象外です。
              </li>
              <li>
                ODは弱＋中で入力します。3ボタン同時押しやOD以外の2ボタン同時押し技、特殊技等は対象外です。
              </li>
              <li>距離で性能が変わる技は遠距離の値を使います。</li>
              <li>
                溜め技は左から右、または下から上へ入力します。長押しは不要です。
              </li>
              <li>CAとSAの派生技は対象外です。</li>
              <li>
                連続モードは正解すると自動で次の問題へ進みます。不正解・ギブアップで終了し、直近10問で正解したキャラは出題されません。
              </li>
            </ul>
          </details>
          {dataset.eligible.length < 2 && (
            <p role="status">
              開始には、採用済みで収録範囲が確定したキャラクターが2体以上必要です。
            </p>
          )}
          {dataset.errors.length > 0 && (
            <p role="alert">
              データ検証で問題が見つかりました。管理者は validate:data
              を実行してください。
            </p>
          )}
        </section>
      ) : (
        <>
          <section
            className={
              game.phase === "result"
                ? "result-screen"
                : game.phase === "question"
                  ? "play-screen"
                  : "answer-screen"
            }
          >
            <div className="run-mode-bar">
              <div className="segments" role="group" aria-label="プレイモード">
                {(["single", "streak"] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    aria-pressed={game.runMode === mode}
                    disabled={
                      mode === "streak" && dataset.eligible.length <= 10
                    }
                    onClick={() => {
                      if (game.runMode === mode) return;
                      const prompt =
                        game.runMode === "streak"
                          ? `現在の連続正解記録（${game.streak.length}問）を終了してモードを変更しますか？`
                          : "現在のゲームを終了してモードを変更しますか？";
                      if (
                        game.phase !== "result" &&
                        (game.history.length > 0 || game.streak.length > 0) &&
                        !window.confirm(prompt)
                      )
                        return;
                      setGame(
                        mode === "streak"
                          ? startStreak(dataset, "normal", limit)
                          : startGame(dataset, "normal", limit),
                      );
                      setSelection("");
                      setMessage("");
                    }}
                  >
                    {mode === "single" ? "通常モード" : "連続モード"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="title-return"
                onClick={() => {
                  const prompt =
                    game.runMode === "streak"
                      ? `現在の連続正解記録（${game.streak.length}問）を終了してモード選択に戻りますか？`
                      : "現在のゲームを終了してモード選択に戻りますか？";
                  if (
                    game.phase !== "result" &&
                    (game.history.length > 0 || game.streak.length > 0) &&
                    !window.confirm(prompt)
                  )
                    return;
                  setGame(null);
                  setSelection("");
                  setMessage("");
                }}
              >
                ← タイトルへ戻る
              </button>
            </div>
            {game.runMode === "streak" && (
              <div className="streak-bar">
                <p className="streak-count" aria-live="polite">
                  <strong>{game.streak.length}</strong> 連勝
                </p>
                {game.phase !== "result" && (
                  <ShareButton game={game} label="記録をシェア" />
                )}
              </div>
            )}
            <div className="game-heading">
              <h2>
                {game.phase === "question"
                  ? "コマンドを指定"
                  : game.phase === "answer"
                    ? "最終回答"
                    : game.runMode === "streak"
                      ? "連続モード終了"
                      : "結果"}
              </h2>
              {game.phase === "result" && (
                <p className="result-session">
                  <span>{game.mode === "normal" ? "Normal" : "Hard"}</span>
                  <span>
                    質問 <strong>{game.history.length}</strong> / {game.limit}回
                  </span>
                </p>
              )}
              {game.phase === "question" && (
                <div>
                  <div
                    className="segments mode-toggle"
                    role="group"
                    aria-label="難易度"
                  >
                    {(["normal", "startup"] as const).map((m) => (
                      <button
                        key={m}
                        type="button"
                        aria-pressed={game.mode === m}
                        disabled={
                          game.history.length > 0 || game.streak.length > 0
                        }
                        onClick={() => {
                          setGame(changeMode(game, m));
                          setMessage("");
                        }}
                      >
                        {m === "normal" ? "Normal" : "Hard"}
                      </button>
                    ))}
                  </div>
                  <small className="remaining">
                    残り {game.limit - game.history.length}回
                  </small>
                </div>
              )}
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
                <p>隠されたキャラクターを選んでください。</p>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const result = answer(game, selection);
                    if (result.runMode === "streak" && isCorrect(result)) {
                      setGame(continueStreak(result, dataset));
                      setMessage(
                        `正解！ ${result.streak.length + 1}問連続正解`,
                      );
                    } else {
                      setGame(result);
                      setMessage("");
                    }
                    setSelection("");
                  }}
                >
                  <fieldset>
                    <legend>キャラクター</legend>
                    <div className="characters">
                      {sortCharactersForDisplay(game.candidates).map((c) => (
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
                  <p className="answer-current" aria-live="polite">
                    {selection && (
                      <>
                        選択中：
                        {
                          game.candidates.find((c) => c.id === selection)
                            ?.nameJa
                        }
                      </>
                    )}
                  </p>
                  <div className="answer-actions">
                    <button disabled={!selection}>回答確定</button>
                    {game.history.length < game.limit && (
                      <button
                        type="button"
                        className="secondary-button"
                        onClick={() => {
                          setGame(returnToQuestions(game));
                          setSelection("");
                          setMessage("");
                        }}
                      >
                        質問に戻る
                      </button>
                    )}
                    <button
                      type="button"
                      className="giveup-button"
                      onClick={() => {
                        if (
                          !window.confirm("ギブアップして正解を表示しますか？")
                        )
                          return;
                        setGame(giveUp(game));
                        setSelection("");
                        setMessage("");
                      }}
                    >
                      ギブアップ
                    </button>
                  </div>
                </form>
              </>
            )}
            {game.phase === "result" && (
              <>
                <p
                  className={`verdict result-verdict${isCorrect(game) ? " is-correct" : ""}`}
                >
                  {game.selectedId === null
                    ? "ギブアップ"
                    : isCorrect(game)
                      ? "正解！"
                      : "不正解"}
                </p>
                <dl className="result-identities">
                  <div className="result-answer">
                    <dt>正解キャラクター</dt>
                    <dd>{game.target.nameJa}</dd>
                  </div>
                  {!isCorrect(game) && (
                    <div className="result-selection">
                      <dt>あなたの回答</dt>
                      <dd>
                        {game.selectedId === null
                          ? "ギブアップ"
                          : game.candidates.find(
                              (c) => c.id === game.selectedId,
                            )?.nameJa}
                      </dd>
                    </div>
                  )}
                </dl>
                <div className="result-actions">
                  <button
                    onClick={() => {
                      setGame(
                        game.runMode === "streak"
                          ? startStreak(dataset, game.mode, limit)
                          : startGame(dataset, game.mode, limit),
                      );
                      setSelection("");
                      setMessage("");
                    }}
                  >
                    再プレイ
                  </button>
                  <ShareButton game={game} label="結果をシェア" />
                </div>
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
