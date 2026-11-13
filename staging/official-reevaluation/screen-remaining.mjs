import fs from "node:fs";
import assert from "node:assert/strict";
const read = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const prior = read("staging/official-reevaluation/unverifiable-play-risk.json");
const rows = prior.records.filter(
  (r) => (r.normalQuestion || r.hardQuestion) && !r.detailed,
);
assert.equal(rows.length, 209);
const confirmations = {
  ed__special_236_K_L: "45",
  ed__special_236_K_M: "49",
};
const screened = rows.map((r) => {
  const move = read(`data/characters/${r.characterId}.json`).moves.find(
    (m) => m.id === r.moveId,
  );
  assert(move);
  const notes = move.notes.filter((n) => n.startsWith("upstreamNotes:"));
  const text = notes.join(" ");
  const reported = r.field === "total" ? confirmations[r.moveId] : undefined;
  if (reported) assert.equal(move.frames.total.display, reported);
  return {
    characterId: r.characterId,
    moveId: r.moveId,
    field: r.field,
    current: r.current,
    sourceMoveId: r.sourceMoveId,
    flags: {
      whiff:
        /whiff/i.test(text) && /extra|additional|more|faster|less/i.test(text),
      specialState: /\b(?:shin|install|enhanced|powered|stock)\b/i.test(text),
      strengthODHold: /\b(?:strength|button|hold|held|OD)\b/i.test(text),
    },
    notes,
    ...(reported
      ? {
          judgment: "現状維持確定",
          userConfirmation: {
            basis: "ユーザーによるゲーム内確認",
            condition: "空振り全体F",
            reportedValue: reported,
            gameVersion: null,
            opponent: null,
            distance: null,
            holdCondition: null,
          },
          unresolved:
            "測定時のゲーム版・相手・距離・ホールド条件は未報告。Cargoの括弧表記との差の原因は未確定。",
        }
      : {}),
  };
});
const bison = read("data/characters/m_bison.json")
  .moves.filter(
    (m) =>
      m.adoption.status === "accepted" &&
      m.notes.some((n) => /shin bison/i.test(n)),
  )
  .map((m) => m.id);
const output = {
  scope:
    "前回の未詳細調査のうち数値・Dとして出題される209フィールド。文字列検索は候補抽出であり、フラグは誤りの判定ではない。",
  count: screened.length,
  bisonAcceptedShinMentions: bison,
  findings: [
    {
      id: "ed__special_236_K_L/total",
      judgment: "現状維持確定",
      finding:
        "Cargo 45(43)の43候補は採用しない。ユーザーのゲーム内確認では空振り全体45F。ゲーム版・相手・距離・ホールド条件は未報告。",
      source:
        "archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#/data/cargoquery/10/title",
    },
    {
      id: "ed__special_236_K_M/total",
      judgment: "現状維持確定",
      finding:
        "Cargo 49(48)の48候補は採用しない。ユーザーのゲーム内確認では空振り全体49F。ゲーム版・相手・距離・ホールド条件は未報告。",
      source:
        "archive/staging/sf6-frame-data-quality/evidence/ed.cargo.json#/data/cargoquery/11/title",
    },
    {
      id: "ken__normal_5_K_H/total",
      finding: "空振り追加2Fは現行38に反映済み。修正候補ではない。",
    },
    {
      id: "blanka__special_22_P_none__strength_L/startup",
      finding:
        "原典の設置と後続効果の指標差。既存の中優先度で、空振り追加硬直の誤採用は示さない。",
    },
  ],
  records: screened,
};
fs.writeFileSync(
  "staging/official-reevaluation/remaining-screen.json",
  JSON.stringify(output, null, 2) + "\n",
);
console.log(
  JSON.stringify({
    count: screened.length,
    flags: Object.fromEntries(
      ["whiff", "specialState", "strengthODHold"].map((k) => [
        k,
        screened.filter((r) => r.flags[k]).length,
      ]),
    ),
    bison,
  }),
);
