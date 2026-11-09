import { useMemo, useState } from "react";
import { production } from "../../lib/frame-data/datasets";
import { displayFrame } from "../../lib/frame-data/resolver";
import { displayInput, inputKey } from "../../lib/frame-data/input";
import { sortCharactersForDisplay } from "../game/character-order";
import {
  inventoryPatterns,
  inventoryRow,
  recordStatus,
  type MoveStatus,
} from "./inventory";
import type { Move, MoveInput } from "../../lib/frame-data/schema";
const characters = sortCharactersForDisplay(production.characters);
const patterns = inventoryPatterns(production.characters, production.inputs);
function label(i: MoveInput) {
  return (
    displayInput(i)
      .replace(/^5/, i.type === "normal" ? "" : "5")
      .replace(/LP/g, "弱P")
      .replace(/MP/g, "中P")
      .replace(/HP/g, "強P")
      .replace(/LK/g, "弱K")
      .replace(/MK/g, "中K")
      .replace(/HK/g, "強K") +
    (i.type === "special" && i.includeSuperArts
      ? "（統合）"
      : i.type === "special" && i.strength === "none"
        ? "（保存・強度未指定）"
        : "")
  );
}
export function Frames({ move }: { move?: Move }) {
  return (
    <>
      {(["startup", "total", "hit", "block"] as const).map((f) => (
        <td className="move-frame" key={f}>
          {move
            ? move.frames[f].status === "not_applicable"
              ? "対象外"
              : displayFrame(move.frames[f])
            : "—"}
        </td>
      ))}
    </>
  );
}
function Name({ move }: { move?: Move }) {
  return move ? (
    <>
      <span>{move.name}</span>
      <details>
        <summary>詳細</summary>
        <small>
          ID: {move.id}
          <br />
          カテゴリ: {move.category}
          <br />
          variant: {move.variant.kind} {move.variant.condition}
          <br />
          adoption: {move.adoption?.status ?? "未設定"}
          <br />
          {move.adoption?.basis}
          <br />
          {move.notes.map((n, i) => (
            <span className="move-note" key={i}>
              {n}
            </span>
          ))}
        </small>
      </details>
    </>
  ) : (
    <>—</>
  );
}
export default function MovesPage() {
  const [id, setId] = useState(characters[0].id),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("すべて");
  const character = characters.find((c) => c.id === id)!;
  const rows = useMemo(
    () =>
      patterns.map((input) => ({ input, ...inventoryRow(character, input) })),
    [character],
  );
  const matches = (status: MoveStatus) =>
    filter === "すべて" ||
    ({ 採用: "技あり", 無し: "技なし" }[filter] || filter) === status;
  const visible = rows.filter((r) => {
    const term = search.trim().toLowerCase();
    return (
      (!term ||
        `${label(r.input)} ${displayInput(r.input)} ${r.records.map((m) => m.name).join(" ")}`
          .toLowerCase()
          .includes(term)) &&
      (matches(r.status) || r.records.some((m) => matches(recordStatus(m))))
    );
  });
  return (
    <main className="moves-page">
      <h1>技データ一覧</h1>
      <p>
        読み取り専用。統合はゲームのコマンド、SA行はレベル別データです。保存済みの対象外入力も含みます。
      </p>
      <div className="moves-controls">
        <label>
          キャラクター
          <select
            id="moves-character"
            value={id}
            onChange={(e) => setId(e.target.value)}
          >
            {characters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nameJa}
              </option>
            ))}
          </select>
        </label>
        <label>
          入力・技名で検索
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label>
          技の状態
          <select value={filter} onChange={(e) => setFilter(e.target.value)}>
            {[
              "すべて",
              "採用",
              "無し",
              "除外",
              "保留",
              "条件付き",
              "不明",
              "複数候補",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </label>
      </div>
      <p aria-live="polite">
        {visible.length} / {patterns.length}入力パターン · 保存レコード{" "}
        {character.moves.length}件
      </p>
      <div
        className="moves-scroll"
        role="region"
        aria-label="技データ表（横スクロール可能）"
        tabIndex={0}
      >
        <table className="moves-table">
          <caption>{character.nameJa}の技データ</caption>
          <thead>
            <tr>
              {["入力", "技名", "発生", "全体", "ヒット", "ガード", "判定"].map(
                (h) => (
                  <th scope="col" key={h}>
                    {h}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {visible.flatMap((r) => {
              const key = inputKey(r.input);
              if (!matches(r.status))
                return r.records
                  .filter((m) => matches(recordStatus(m)))
                  .map((m) => (
                    <tr key={`${key}:${m.id}`} data-input-key={key}>
                      <th scope="row">{label(r.input)}</th>
                      <td>
                        <Name move={m} />
                      </td>
                      <Frames move={m} />
                      <td>{recordStatus(m)}</td>
                    </tr>
                  ));
              return [
                <tr key={key} data-input-key={key}>
                  <th scope="row">{label(r.input)}</th>
                  <td>
                    <Name move={r.primary} />
                  </td>
                  <Frames move={r.primary} />
                  <td>{r.status}</td>
                </tr>,
                ...(r.records.length > 1
                  ? r.records
                      .filter(
                        (m) =>
                          filter === "複数候補" || matches(recordStatus(m)),
                      )
                      .map((m) => (
                        <tr className="move-detail-row" key={`${key}:${m.id}`}>
                          <th scope="row">
                            ↳{" "}
                            {m.input.type === "super_art"
                              ? `SA${m.input.saLevel}`
                              : "保存行"}
                          </th>
                          <td>
                            <Name move={m} />
                          </td>
                          <Frames move={m} />
                          <td>{recordStatus(m)}</td>
                        </tr>
                      ))
                  : []),
              ];
            })}
          </tbody>
        </table>
      </div>
    </main>
  );
}
