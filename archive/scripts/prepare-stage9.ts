import { readFile, writeFile, mkdir, access } from "node:fs/promises";
import { characterSchema } from "../../src/lib/frame-data/schema";
const out = "archive/staging/sf6-frame-data-stage9";
const read = async (p: string) => JSON.parse(await readFile(p, "utf8"));
const save = async (p: string, v: unknown) =>
  writeFile(p, JSON.stringify(v, null, 2) + "\n");
await mkdir(`${out}/evidence`, { recursive: true });
const prior = await read("archive/staging/sf6-frame-data-stage8/review.json");
const moves = [];
for (const c of prior.characters) {
  const candidate = characterSchema.parse(
    await read(
      `archive/staging/sf6-frame-data-stage7/characters/${c.characterId}.json`,
    ),
  );
  for (const m of c.moves) {
    const record = candidate.moves.find((r) => r.id === m.moveId)!;
    moves.push({
      characterId: c.characterId,
      moveId: m.moveId,
      input: m.input,
      sourceInput: m.sourceInput,
      name: record.name,
      referenceName: m.expectedFrameSearchName,
      referenceFrames: record.frames,
      referenceWarning: "未検証の参照値。実測欄にコピーしない。",
      existingSource: m.candidateSource,
      existingComparisons: m.comparison,
      technicalStatus: {
        schema: "complete",
        counterpartName: m.matched ? "complete" : "pending",
      },
      gameStatus: {
        battleVersion: "pending",
        inputPair:
          m.inputPair === "not_applicable" ? "not_applicable" : "pending",
        patchFrameValues: "pending",
        coverage: "pending",
      },
      requiredPair:
        m.inputPair === "not_applicable"
          ? null
          : m.input.button === "P"
            ? "LP+MP"
            : "LK+MK",
      role:
        m.sourceInput === "KK" ||
        (["214K", "214KK"].includes(m.sourceInput) &&
          c.characterId === "marisa")
          ? "non_attacking_entry_or_movement"
          : "attack",
      requiredEvidence: m.requiredEvidence,
    });
  }
}
const plan = {
  targetBattleVersion: "2.0500.001",
  automaticLaunchOrUpdate: false,
  productionEligible: 0,
  sourceLineageAlreadyReviewed: prior.sourceLineage,
  unknownFramesAllowed: [
    "ken:2HK:total",
    "ken:623KK:startup",
    "marisa:2MK:total",
    "marisa:236KK:hit",
  ],
  standard: {
    control: "classic",
    state: "initial",
    location: "midscreen",
    opponent: "standing_except_low_guard",
    hit: "normal",
    hold: false,
    followup: false,
    total: "whiff",
  },
  minimumFiles: ["version.png", "ken-session.mp4", "marisa-session.mp4"],
  versionProcedure: [
    "ユーザー自身が現在のSteam/SF6を確認。更新・起動はCodexが実行しない。",
    "タイトル／メインメニューで版表示を探し、数値だけでなく画面全体と表示ラベルを撮る。",
    "表示がBattle Version／バトルバージョンでなければ、何の版かの確認を残す。場所やラベルは未確認なので推測しない。",
    "2.0500.001に対応すると確認できなければ入力測定を採用せず停止。別版の値で置き換えない。",
  ],
  measurementsPolicy:
    "11入力を優先。残る52技もpatchFrameValuesは未確認。版付き資料と変更履歴で対応付けられない場合に限り追加計測する。未知の4値は不明のままでも可。",
  moves,
};
await save(`${out}/plan.json`, plan);
// Never overwrite manual observations on subsequent preparation runs.
try {
  await access(`${out}/submission.json`);
} catch {
  await save(`${out}/submission.json`, {
    sessions: [],
    observations: [],
    coverage: [],
  });
}
const pairRows = moves.filter((m) => m.requiredPair);
const lines = [
  "# ゲーム内証拠チェック表",
  "",
  "全11入力は未実施。チェックは証拠内容の確認後に更新する。参照値との一致だけでパッチを認定しない。",
  "",
  "|順|キャラ|入力|参照名|実際の同時押し|記録内容|実施状態|",
  "|---|---|---|---|---|---|---|",
  ...pairRows.map(
    (m, i) =>
      `|${i + 1}|${m.characterId}|${m.sourceInput}|${m.referenceName}|${m.requiredPair}|${m.role === "attack" ? "技名・入力履歴・発生・空振り全体・通常ヒット・ガード" : "技名・入力履歴・非ホールド全体（攻撃発生・ヒット・ガードは適用対象外）"}|未実施|`,
  ),
  "",
  "## 収録範囲",
  "",
  "|キャラ|採用候補|確認方法|状態|",
  "|---|---|---|---|",
  "|ケン|通常12・コマンド必殺20・奮迅脚1|クラシックのゲーム内一覧を全区分撮影。基本12技が個別未掲載なら12入力を記録。派生は別分類。|未実施|",
  "|マリーザ|通常12・コマンド必殺18|同様。スクトゥム開始と自動反撃・構え中派生を区別。|未実施|",
  "",
  "## 全63技の対応表",
  "",
  "全行をその版の技一覧と照合する。未掲載＝不存在とはしない。",
  "",
  "|キャラ|moveId|入力|参照名|版・実測／版付き資料|",
  "|---|---|---|---|---|",
  ...moves.map(
    (m) =>
      `|${m.characterId}|${m.moveId}|${m.sourceInput}|${m.referenceName}|未確認|`,
  ),
];
await writeFile(`${out}/CHECKLIST.md`, lines.join("\n") + "\n");
await writeFile(
  `${out}/evidence/README.md`,
  "# 証拠保存先\n\nこのフォルダーにversion.png、ken-session.mp4、marisa-session.mp4を保存してください。分割ファイルでも構いません。submission.jsonのfileは、このフォルダーからの相対パスです。\n\n版表示の画像と各動画の撮影セッションを対応付けてください。ゲーム本体・メモリ・認証情報は保存しません。動画には入力履歴、技名、フレームメーター、中央開始位置を含め、各試行の時刻を記録します。\n",
);
await writeFile(
  `${out}/NOTICE`,
  (await readFile("archive/staging/sf6-frame-data-stage8/NOTICE", "utf8")) +
    "\nStage 9: manual evidence checklist and intake preparation only. Reference values remain unverified; no measurements performed.\n",
);
console.log(
  JSON.stringify({
    moves: moves.length,
    priorityInputs: pairRows.length,
    gameChecksComplete: 0,
    schemaPass: 2,
    productionEligible: 0,
  }),
);
