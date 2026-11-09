import { useState } from "react";
import { production } from "../lib/frame-data/datasets";
import type { MoveInput } from "../lib/frame-data/schema";
import {
  answer,
  giveUp,
  ask,
  isCorrect,
  startGame,
  changeMode,
  requestAnswer,
  returnToQuestions,
  type Game,
} from "../features/game/engine";
import { MoveSelector } from "../features/move-selector/MoveSelector";
import { History } from "../components/History";
import { DataInfo } from "../components/DataInfo";
import { sortCharactersForDisplay } from "../features/game/character-order";

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
        <section className="panel" aria-labelledby="description-title">
          <h2 id="description-title" className="start-heading">
            ゲームの説明
          </h2>
          <p>
            技のフレームデータを調べて、隠されたキャラクターを当てるゲームです。レバーとボタンで技を指定し、質問を重ねて候補を絞ってください。
          </p>
          <p>
            <strong>Normal</strong>
            ：発生・全体・ヒット時の硬直差・ガード時の硬直差を表示します。
            <br />
            <strong>Hard</strong>：発生だけを表示します。
            <br />
            プレイ中も切り替えられ、履歴全体の表示が変わります。
          </p>
          <section className="start-rules" aria-labelledby="rules-title">
            <h2 id="rules-title" className="start-heading">
              ルール・注意事項
            </h2>
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
            </ul>
          </section>
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
                      {m === "normal" ? "Normal" : "Hard"}
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
                <p>隠されたキャラクターを選んでください。</p>
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
                  <div className="question-actions">
                    <button disabled={!selection}>回答確定</button>
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
                <p className="verdict">
                  {game.selectedId === null
                    ? "ギブアップ"
                    : isCorrect(game)
                      ? "正解！"
                      : "不正解"}
                </p>
                <dl className="result">
                  <dt>正解キャラクター</dt>
                  <dd>{game.target.nameJa}</dd>
                  <dt>
                    {game.selectedId === null ? "回答" : "選択したキャラクター"}
                  </dt>
                  <dd>
                    {game.selectedId === null
                      ? "ギブアップ"
                      : game.candidates.find((c) => c.id === game.selectedId)
                          ?.nameJa}
                  </dd>
                </dl>
                <button
                  onClick={() => {
                    setGame(startGame(dataset, game.mode, limit));
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
